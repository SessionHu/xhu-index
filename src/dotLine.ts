// 点颜色
const DOT_COLOR: string = "rgba(0,0,0,1)"


interface Dot {
    mass: number; // kg
    rx: number; // percent
    ry: number; // percent
    vx: number; // m/s
    vy: number; // m/s
    label: string;
}

// Dotline构造函数
class Dotline {
    
    canvas: HTMLCanvasElement;
    ctx:    CanvasRenderingContext2D;
    color:  string;
    
    dotSum: number;
    radius: number; // px
    disMax: number; // px
    scale:  number; // px/m
    freq:   number; // Hz
    
    dots:  Dot[] = [];
    mouse: Dot = {
        mass: 8e30,
        rx: NaN,
        ry: NaN,
        vx: NaN,
        vy: NaN,
        label: "mouse"
    }

    constructor(dom: HTMLCanvasElement,
                dotSum: number,
                radius: number, // px
                disMax: number, // px
                width:  number, // px
                height: number, // px
                freq:   number, // Hz
                color:  string)
    {
        // 初始化一些参数
        this.canvas = dom;
        this.dotSum = dotSum;
        this.radius = radius;
        this.disMax = disMax;
        this.color  = color;
        this.scale  = radius / 1.7371e6;
        this.freq   = freq;
        // get canvas context
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        // 设置canvas的宽高
        this.canvas.width = width;
        this.canvas.height = height;
        // 鼠标移动事件，记录鼠标位置
        window.addEventListener<"mousemove">("mousemove", (ev: MouseEvent) => {
            this.mouse.rx = (ev.clientX - this.canvas.offsetLeft) / this.canvas.width;
            this.mouse.ry = (ev.clientY - this.canvas.offsetTop) / this.canvas.height;
        });
        // 鼠标移出事件，清空鼠标位置
        window.addEventListener<"mouseout">("mouseout", () => {
            this.mouse.rx = NaN;
            this.mouse.ry = NaN;
        });
    }

    // 添加点的方法，随机生成点的位置和加速度
    addDots(): void {
        // 清空点
        this.dots = [];
        // 循环生成点
        for(let i = 0; i < this.dotSum; i++) {
            // 生成点 & 添加到dots数组中
            const v: number = (6 * Math.random() - 3) / 1.5 * 1e5; // m/s
            const d: number = 360 * Math.random(); // deg
            this.dots.push({
                mass: (Math.random() + 0.5) * 1.7371e10,
                vx: Math.sin(d) * v,
                vy: Math.cos(d) * v,
                rx: Math.random(),
                ry: Math.random(),
                label: "dot"
            });
        }
    }

    // 点的移动方法，改变点的位置，并绘制点
    move(): void {
        // 万有引力
        for(const t of this.dots) {
            const xt = t.rx * this.canvas.width / this.scale; // m
            const yt = t.ry * this.canvas.height / this.scale; // m
            for(const d of [this.mouse].concat(this.dots)) {
                // if worth calculating?
                if(d === t || Number.isNaN(d.rx) || Number.isNaN(d.ry)) {
                    continue;
                }
                // distance
                const disx: number = xt - d.rx * this.canvas.width / this.scale; // m
                const disy: number = yt - d.ry * this.canvas.height / this.scale; // m
                const disq: number = disx * disx + disy * disy; // m^2
                // if too close
                if(Math.sqrt(disq) < this.radius / this.scale * 2) {
                    t.vx *= -1;
                    t.vy *= -1;
                    continue;
                }
                // gravity(force)
                const f: number = 6.67258e-11 * t.mass * d.mass / disq; // N(kg*m/s^2)
                const fx: number = f * disx / Math.sqrt(disq); // N
                const fy: number = f * disy / Math.sqrt(disq); // N
                // velocity
                t.vx -= fx / t.mass / this.freq;
                t.vy -= fy / t.mass / this.freq;
            }
            // if move too fast
            t.vx *= t.vx > 5e5 ? 0.9 : 1;
            t.vy *= t.vy > 5e5 ? 0.9 : 1;
            // 移动
            t.rx += t.vx / this.freq * this.scale;
            t.ry += t.vy / this.freq * this.scale;
            // 碰到边界反弹
            t.vx *= t.rx <= 0 || t.rx >= 1 ? -1 : 1;
            t.vy *= t.ry <= 0 || t.ry >= 1 ? -1 : 1;
            // 边界循环
            //if(t.rx > 1.1) {
            //    t.rx -= 1.2;
            //} else if(t.rx < -0.1) {
            //    t.rx += 1.2;
            //}
            //if(t.ry > 1.1) {
            //    t.ry -= 1.2;
            //} else if(t.ry < -0.1) {
            //    t.ry += 1.2;
            //}
        }
    }

    // 绘制线条方法，遍历所有的点，计算距离，绘制线条
    drawLine(): void {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // draw
        for(const n of this.dots) {
            // draw lines
            for(const d of [this.mouse].concat(this.dots)) {
                // 是否能够绘制
                if(d !== n && !Number.isNaN(d.rx) && !Number.isNaN(d.ry)) {
                    const c = (n.rx - d.rx) * this.canvas.width;
                    const s = (n.ry - d.ry) * this.canvas.height;
                    const h = Math.sqrt(c * c + s * s);
                    // 如果两点之间的距离小于最大距离，则绘制线条
                    if(h < this.disMax) {
                        // 绘制线条开始
                        this.ctx.beginPath();
                        // line color
                        this.ctx.strokeStyle = this.color;
                        // line width, thiner if farther
                        this.ctx.lineWidth = (this.disMax - h) / this.disMax;
                        // move to draw
                        this.ctx.moveTo(n.rx * this.canvas.width, n.ry * this.canvas.height);
                        this.ctx.lineTo(d.rx * this.canvas.width, d.ry * this.canvas.height);
                        // 绘制线条结束
                        this.ctx.stroke();
                    }
                }
            }
            // 绘制点
            this.ctx.beginPath();
            this.ctx.lineWidth = this.radius;
            this.ctx.arc((n.rx * this.canvas.width), (n.ry * this.canvas.height), this.radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        // redraw
        window.requestAnimationFrame(() => this.drawLine());
    }

    // 启动动画
    start(): void {
        // add dots
        this.addDots();
        // move dots
        window.setInterval(() => this.move(), 1e3 / this.freq);
        // draw lines
        this.drawLine();
    }
}

let dotLine: Dotline;

// 页面加载完成后，创建Dotline实例，添加点，启动动画
window.addEventListener<"load">("load", () => {
    dotLine = new Dotline(
        document.getElementById("dotLine") as HTMLCanvasElement,
        70,
        .5,
        80,
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
        60,
        DOT_COLOR
    );
    // 启动动画
    dotLine.start();
    // 监听窗口大小变化，重新设置canvas的宽高
    window.addEventListener<"resize">("resize", () => {
        dotLine.canvas.width = document.documentElement.clientWidth;
        dotLine.canvas.height = document.documentElement.clientHeight;
    });
});
