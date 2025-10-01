export class TestBot {
  private timer?: number;
  private interval = 120;
  
  constructor(
    private tap: (x: number, y: number) => void,
    opts?: { interval?: number }
  ) {
    if (opts?.interval) this.interval = opts.interval;
  }
  
  start() { 
    this.stop(); 
    this.timer = window.setInterval(() => this.step(), this.interval); 
  }
  
  stop() { 
    if (this.timer) window.clearInterval(this.timer); 
    this.timer = undefined; 
  }
  
  private step() {
    // 6x8 grid (adjust if your field differs)
    const cols = 6, rows = 8, startX = 60, startY = 220, cw = 90, rh = 90;
    const c = Math.floor(Math.random() * cols), r = Math.floor(Math.random() * rows);
    this.tap(startX + c * cw, startY + r * rh);
  }
}