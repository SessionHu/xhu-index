interface Dot {
  mass: number; // kg
  rx: number; // percent
  ry: number; // percent
  vx: number; // m/s
  vy: number; // m/s
  label: string;
}

export class Dotline {

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

  constructor(args: {
    dom: HTMLCanvasElement,
    dotSum: number,
    radius: number, // px
    disMax: number, // px
    width:  number, // px
    height: number, // px
    freq:   number, // Hz
    color:  string
  }){
    this.canvas = args.dom;
    this.dotSum = args.dotSum;
    this.radius = args.radius;
    this.disMax = args.disMax;
    this.color  = args.color;
    this.scale  = args.radius / 1.7371e6;
    this.freq   = args.freq;
    // get canvas context
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    // set canvas size
    this.canvas.width  = args.width;
    this.canvas.height = args.height;
    // listen event
    window.addEventListener<"mousemove">("mousemove", (ev: MouseEvent) => {
      this.mouse.rx = (ev.clientX - this.canvas.offsetLeft) / this.canvas.width;
      this.mouse.ry = (ev.clientY - this.canvas.offsetTop) / this.canvas.height;
    });
    window.addEventListener<"mouseout">("mouseout", () => {
      this.mouse.rx = NaN;
      this.mouse.ry = NaN;
    });
  }

  /**
   * 添加点的方法, 随机生成点的位置和加速度
   */
  addDots(): void {
    // clear
    this.dots = [];
    // generate
    for(let i = 0; i < this.dotSum; i++) {
      const v: number = (6 * Math.random() - 3) / 1.5 * 1e5; // m/s
      const d: number = 2 * Math.PI * Math.random(); // rad
      this.dots.push({
        mass: (Math.random() + .5) * 1.7371e10,
        vx: Math.sin(d) * v,
        vy: Math.cos(d) * v,
        rx: Math.random(),
        ry: Math.random(),
        label: "dot"
      });
    }
  }

  /**
   * Move dots in place.
   */
  move(): void {
    // 万有引力
    for (const t of this.dots) {
      const xt = t.rx * this.canvas.width / this.scale; // m
      const yt = t.ry * this.canvas.height / this.scale; // m
      for (const d of [this.mouse].concat(this.dots)) {
        // if worth calculating?
        if(d === t || isNaN(d.rx) || isNaN(d.ry)) {
          continue;
        }
        // distance
        const disx = xt - d.rx * this.canvas.width / this.scale; // m
        const disy = yt - d.ry * this.canvas.height / this.scale; // m
        const disq = disx * disx + disy * disy; // m^2
        // if too close
        if (Math.sqrt(disq) < this.radius / this.scale * 2) {
          t.vx *= Number.MIN_VALUE - 1;
          t.vy *= Number.MIN_VALUE - 1;
          continue;
        }
        // gravity
        const f  = 6.67258e-11 * t.mass * d.mass / disq; // N
        const fx = f * disx / Math.sqrt(disq); // N
        const fy = f * disy / Math.sqrt(disq); // N
        // velocity
        t.vx -= fx / t.mass / this.freq;
        t.vy -= fy / t.mass / this.freq;
      }
      // if move too fast
      //t.vx *= t.vx > 5e5 ? 0.9 : 1;
      //t.vy *= t.vy > 5e5 ? 0.9 : 1;
      // move
      t.rx += t.vx / this.freq * this.scale;
      t.ry += t.vy / this.freq * this.scale;
      // out of bound
      //t.vx *= t.rx <= 0 || t.rx >= 1 ? -1 : 1;
      //t.vy *= t.ry <= 0 || t.ry >= 1 ? -1 : 1;
      if (t.rx > 1) {
        t.rx = 1;
        t.vx *= -1;
      } else if (t.rx < 0) {
        t.rx = 0;
        t.vx *= -1;
      }
      if (t.ry > 1) {
        t.ry = 1;
        t.vy *= -1;
      } else if (t.ry < 0) {
        t.ry = 0;
        t.vy *= -1;
      }
    }
  }

  drawLine(): void {
    // clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // draw
    for (const n of this.dots) {
      // draw lines
      for (const d of [this.mouse].concat(this.dots)) {
        // is drawable
        if (d === n || isNaN(d.rx) || isNaN(d.ry)) {
          continue;
        }
        // calc
        const c = (n.rx - d.rx) * this.canvas.width;
        const s = (n.ry - d.ry) * this.canvas.height;
        const h = Math.sqrt(c * c + s * s);
        if (h > this.disMax) {
          continue;
        }
        // draw
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = (this.disMax - h) / this.disMax;
        this.ctx.moveTo(n.rx * this.canvas.width, n.ry * this.canvas.height);
        this.ctx.lineTo(d.rx * this.canvas.width, d.ry * this.canvas.height);
        this.ctx.stroke();
      }
      // draw dots
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
    // draw lines
    this.drawLine();
    // move dots
    setInterval(() => this.move(), 1e3 / this.freq);
  }

}
