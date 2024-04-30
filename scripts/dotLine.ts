// 元素ID
const DOTLINE_ID: string = "dotLine";
// 点颜色
const DOT_COLOR: string = "rgba(0,0,0,1)"


interface Dot {
    rx: number; // 相对 x
    ry: number; // 相对 y
    ax: number; // 加速度 x
    ay: number; // 加速度 y
    label: string;
}

// Dotline构造函数
class Dotline {
    
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    dotSum: number;
    radius: number;
    disMax: number;
    dots: Dot[] = [];
    mouse: Dot = {
        ax: NaN,
        ay: NaN,
        rx: NaN,
        ry: NaN,
        label: "mouse"
    }

    constructor(dom: string, dotSum: number, r: number, disMax: number, width: number, height: number, color: string) {
        // 初始化一些参数
        this.dotSum = dotSum;
        this.radius = r;
        this.disMax = disMax;
        // 获取canvas元素和上下文
        this.canvas = document.getElementById(dom) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        // set dotline color
        this.ctx.strokeStyle = color;
        // 设置canvas的宽高
        this.canvas.width = width;
        this.canvas.height = height;
        // 鼠标移动事件，记录鼠标位置
        window.onmousemove = (ev: MouseEvent) => {
            this.mouse.rx = (ev.clientX - this.canvas.offsetLeft) / this.canvas.width;
            this.mouse.ry = (ev.clientY - this.canvas.offsetTop) / this.canvas.height;
        };
        // 鼠标移出事件，清空鼠标位置
        window.onmouseout = () => {
            this.mouse.rx = NaN;
            this.mouse.ry = NaN;
        }
    }

    // 添加点的方法，随机生成点的位置和加速度
    addDots(): void {
        // 清空点
        this.dots = [];
        // 循环生成点
        for(let i = 0; i < this.dotSum; i++) {
            // 生成点 & 添加到dots数组中
            this.dots.push({
                ax: (2 * Math.random() - 1) / 1.5,
                ay: (2 * Math.random() - 1) / 1.5,
                rx: Math.random(),
                ry: Math.random(),
                label: "dot"
            });
        }
    }

    // 点的移动方法，改变点的位置，并绘制点
    move(): void {
        for(const t of this.dots) { // 目标点
            // 重力加速度
            for(const d of [this.mouse].concat(this.dots)) { // 检测点
                // if worth calculating?
                if(d === t || Number.isNaN(d.rx) || Number.isNaN(d.ry)) {
                    continue;
                }
                // 计算绝对距离
                const dx: number = (t.rx - d.rx) * this.canvas.width; // x距离
                const dy: number = (t.ry - d.ry) * this.canvas.height; // y距离
                const dd: number = Math.sqrt(dx * dx + dy * dy); // 绝对距离
                // 重力加速度
                if(dd < this.disMax && dd > 0) {
                    // 系数
                    const k: number = (d.label == "mouse" ? 6e-2 : 1e-4);
                    // 加速度
                    const nax: number = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)) * k;
                    const nay: number = Math.abs(dy) / (Math.abs(dx) + Math.abs(dy)) * k;
                    // 新速度
                    t.ax -= dx > 0 ? nax : -nax;
                    t.ay -= dy > 0 ? nay : -nay;
                }
            }
            // 移动
            t.rx += t.ax / this.canvas.width;
            t.ry += t.ay / this.canvas.height;
            // 碰到边界反弹
            t.ax *= t.rx <= 0 || t.rx >= 1 ? -1 : 1;
            t.ay *= t.ry <= 0 || t.ry >= 1 ? -1 : 1;
            // 如果点在边界以外，将点的位置设置为边界以内的一个随机位置
            if(t.rx > 1.1) {
                t.rx -= 1;
            } else if(t.rx < -0.1) {
                t.rx += 1;
            }
            if(t.ry > 1.1) {
                t.ry -= 1;
            } else if(t.ry < -0.1) {
                t.ry += 1;
            }
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
                        // 线条的宽度，距离越远，线条越细
                        this.ctx.lineWidth = (this.disMax - h) / this.disMax;
                        // 移动绘制
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
        window.setInterval(() => this.move(), 1e3 / 60);
        // draw lines
        this.drawLine();
    }
}


// 页面加载完成后，创建Dotline实例，添加点，启动动画
window.addEventListener<"load">("load", () => {
    const t: Dotline = new Dotline(
        DOTLINE_ID,
        70,
        .5,
        80,
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
        DOT_COLOR
    );
    // 启动动画
    t.start();
    // 监听窗口大小变化，重新设置canvas的宽高
    window.addEventListener<"resize">("resize", () => {
        t.canvas.width = document.documentElement.clientWidth;
        t.canvas.height = document.documentElement.clientHeight;
    });
});
