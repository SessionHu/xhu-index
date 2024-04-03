// 元素ID
const DOTLINE_ID: string = "dotLine";
// 点颜色
declare let DOT_COLOR: string;


interface Dot {
    x: number;
    y: number;
    ax: number;
    ay: number;
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
        x: NaN,
        y: NaN,
        ax: NaN,
        ay: NaN,
        label: "mouse"
    }

    animate: () => void;

    constructor(dom: string, ds: number, r: number, dis: number, width: number, height: number) {
        // 初始化一些参数
        this.dotSum = ds;
        this.radius = r;
        this.disMax = dis * dis;
        // 获取canvas元素和上下文
        this.canvas = document.getElementById(dom) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        // 设置canvas的宽高
        this.canvas.width = width;
        this.canvas.height = height;
        // 鼠标移动事件，记录鼠标位置
        const t = this;
        this.canvas.onmousemove = function (ev: MouseEvent) {
            t.mouse.x = ev.clientX - t.canvas.offsetLeft;
            t.mouse.y = ev.clientY - t.canvas.offsetTop;
        };
        // 鼠标移出事件，清空鼠标位置
        this.canvas.onmouseout = function () {
            t.mouse.x = NaN;
            t.mouse.y = NaN;
        }
        // 获取requestAnimationFrame方法，用于动画
        const i = window.requestAnimationFrame || function (t) {
            window.setTimeout(t, 1e3 / 60);
        }
        // 动画函数，清空画布，绘制线条，递归调用自身
        this.animate = function () {
            t.ctx.clearRect(0, 0, t.canvas.width, t.canvas.height);
            t.drawLine([t.mouse].concat(t.dots));
            i(t.animate);
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
                x: Math.floor(Math.random() * this.canvas.width) - this.radius,
                y: Math.floor(Math.random() * this.canvas.height) - this.radius,
                ax: (2 * Math.random() - 1) / 1.5,
                ay: (2 * Math.random() - 1) / 1.5,
                label: "dot"
            });
        }
    }

    // 点的移动方法，改变点的位置，并绘制点
    move(dot: Dot): void {
        // 移动
        dot.x += dot.ax;
        dot.y += dot.ay;
        // 检查点是否在边界以外
        if(dot.x > this.canvas.width - this.radius + 5 || dot.x < this.radius - 5 ||
           dot.y > this.canvas.height - this.radius + 5 || dot.y < this.radius - 5) {
            // 如果点在边界以外，将点的位置设置为边界以内的一个随机位置
            dot.x = Math.floor(Math.random() * (this.canvas.width - 2 * this.radius)) + this.radius;
            dot.y = Math.floor(Math.random() * (this.canvas.height - 2 * this.radius)) + this.radius;
        } else {
            // 碰到边界反弹
            dot.ax *= dot.x > this.canvas.width - this.radius || dot.x < this.radius ? -1 : 1;
            dot.ay *= dot.y > this.canvas.height - this.radius || dot.y < this.radius ? -1 : 1;
        }
        // 绘制点
        this.ctx.beginPath();
        this.ctx.strokeStyle = DOT_COLOR;
        this.ctx.arc(dot.x, dot.y, this.radius, 0, 2 * Math.PI, !0);
        this.ctx.stroke();
    }

    // 绘制线条方法，遍历所有的点，计算距离，绘制线条
    drawLine(t: Dot[]): void {
        for(const n of this.dots) {
            // 移动每一个点
            this.move(n);
            // 绘制每一条线
            for(const d of t) {
                // 是否能够绘制
                if(d !== n && !Number.isNaN(d.x) && !Number.isNaN(d.y)) {
                    const c = n.x - d.x;
                    const s = n.y - d.y;
                    const h = c * c + s * s;
                    // 如果两点之间的距离小于最大距离，则绘制线条
                    if(!(Math.sqrt(h) > Math.sqrt(this.disMax))) {
                        // 引力
                        if(Math.sqrt(h) > Math.sqrt(this.disMax)/2) {
                            if(d.label === "mouse") {
                                n.x -= .02 * c;
                                n.y -= .02 * s;
                            } else if(d.label === "dot") {
                                n.x -= 1e-32 * c;
                                n.y -= 1e-32 * s;
                            }
                        }
                        // 绘制线条开始
                        this.ctx.beginPath();
                        // 线条的宽度，距离越远，线条越细
                        this.ctx.lineWidth = (this.disMax - h) / this.disMax / 2;
                        // 线条颜色
                        this.ctx.strokeStyle = DOT_COLOR;
                        // 移动绘制
                        this.ctx.moveTo(n.x, n.y);
                        this.ctx.lineTo(d.x, d.y);
                        // 绘制线条结束
                        this.ctx.stroke();
                    }
                }
            }
        }
    }

    // 启动动画
    start(): void {
        this.addDots();
        this.animate();
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
        document.documentElement.clientHeight
    );
    // 启动动画
    t.start();
    // 监听窗口大小变化，重新设置canvas的宽高
    window.addEventListener<"resize">("resize", () => {
        t.canvas.width = document.documentElement.clientWidth;
        t.canvas.height = document.documentElement.clientHeight;
    });
});
