// 元素ID
const dlid = "dotLine";


// Dotline构造函数
class Dotline {

    constructor(t) {
        // 默认参数和传入参数
        this.opt = this.extend({
            dom: dlid,
            cw: 1e3,
            ch: 500,
            ds: 100,
            r: .5,
            dis: 100
        }, t);
        // 获取canvas元素和上下文
        this.c = document.getElementById(this.opt.dom);
        this.ctx = this.c.getContext("2d");
        // 设置canvas的宽高
        this.c.width = this.opt.cw;
        this.c.height = this.opt.ch;
        // 初始化一些参数
        this.dotSum = this.opt.ds;
        this.radius = this.opt.r;
        this.disMax = this.opt.dis * this.opt.dis;
        // 存储所有的点
        this.dots = [];
        // 获取requestAnimationFrame方法，用于动画
        var i = window.requestAnimationFrame || window.requestAnimationFrame || window.requestAnimationFrame || window.requestAnimationFrame || window.requestAnimationFrame || function (t) {
            window.setTimeout(t, 1e3 / 60);
        }, e = this, n = {
            x: null,
            y: null,
            label: "mouse"
        };
        // 鼠标移动事件，记录鼠标位置
        this.c.onmousemove = function (t) {
            //t = t || window.event;
            n.x = t.clientX - e.c.offsetLeft;
            n.y = t.clientY - e.c.offsetTop;
        };
        // 鼠标移出事件，清空鼠标位置
        this.c.onmouseout = function () {
            n.x = null;
            n.y = null;
        };
        // 动画函数，清空画布，绘制线条，递归调用自身
        this.animate = function () {
            e.ctx.clearRect(0, 0, e.c.width, e.c.height);
            e.drawLine([n].concat(e.dots));
            i(e.animate);
        };
    }

    // 对象合并方法，将i对象的属性合并到t对象中
    extend(t, i) {
        for (var e in i) i[e] && (t[e] = i[e]);
        return t;
    }

    // 添加点的方法，随机生成点的位置和加速度
    addDots() {
        for (var t, i = 0; i < this.dotSum; i++) t = {
            x: Math.floor(Math.random() * this.c.width) - this.radius,
            y: Math.floor(Math.random() * this.c.height) - this.radius,
            ax: (2 * Math.random() - 1) / 1.5,
            ay: (2 * Math.random() - 1) / 1.5
        },
            // 将生成的点添加到dots数组中
            this.dots.push(t);
    }

    // 点的移动方法，改变点的位置，并绘制点
    move(t) {
        t.x += t.ax;
        t.y += t.ay;
        // 碰到边界反弹
        t.ax *= t.x > this.c.width - this.radius || t.x < this.radius ? -1 : 1;
        t.ay *= t.y > this.c.height - this.radius || t.y < this.radius ? -1 : 1;
        // 绘制点
        this.ctx.beginPath();
        this.ctx.arc(t.x, t.y, this.radius, 0, 2 * Math.PI, !0);
        this.ctx.stroke();
    }

    // 绘制线条方法，遍历所有的点，计算距离，绘制线条
    drawLine(t) {
        var i, e = this;
        this.dots.forEach((function (n) {
            // 移动每一个点
            e.move(n);
            for (var o = 0; o < t.length; o++)
                if ((i = t[o]) !== n && null !== i.x && null !== i.y) {
                    var d, c = n.x - i.x, s = n.y - i.y, h = c * c + s * s;
                    // 如果两点之间的距离小于最大距离，则绘制线条
                    if (!(Math.sqrt(h) > Math.sqrt(e.disMax)))
                        // 如果是鼠标，则让点向鼠标的反方向移动
                        i.label && Math.sqrt(h) > Math.sqrt(e.disMax) / 2 && (n.x -= .02 * c, n.y -= .02 * s),
                            // 计算线条的宽度，距离越远，线条越细
                            d = (e.disMax - h) / e.disMax,
                            // 绘制线条
                            e.ctx.beginPath(),
                            e.ctx.lineWidth = d / 2,
                            e.ctx.strokeStyle = dlColor,
                            e.ctx.moveTo(n.x, n.y),
                            e.ctx.lineTo(i.x, i.y),
                            e.ctx.stroke();
                }
        }));
    }

    // 启动动画
    start() {
        var t = this;
        this.addDots();
        setTimeout((function () {
            t.animate();
        }), 100);
        // 监听窗口大小变化，重新设置canvas的宽高
        window.addEventListener("resize", (function () {
            t.c.width = t.opt.cw = document.documentElement.clientWidth;
            t.c.height = t.opt.ch = document.documentElement.clientHeight;
        }));
    }
}


// 页面加载完成后，创建Dotline实例，添加点，启动动画
window.onload = function() {
    var t = new Dotline({
        dom: dlid,
        cw: document.documentElement.clientWidth,
        ch: document.documentElement.clientHeight,
        ds: 70,
        r: .5,
        dis: 80
    });
    t.addDots();
    // 启动动画
    t.animate();
};
