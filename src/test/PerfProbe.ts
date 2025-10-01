import { Analytics } from '../analytics/Analytics';

export class PerfProbe {
  private timer?: number;
  private interval = 2000; // 2 seconds
  private lastTime = 0;
  private frameCount = 0;
  private fps = 0;

  constructor(opts?: { interval?: number }) {
    if (opts?.interval) this.interval = opts.interval;
  }

  start() {
    this.stop();
    this.lastTime = performance.now();
    this.frameCount = 0;
    
    // Start FPS counting
    this.countFrame();
    
    // Start periodic logging
    this.timer = window.setInterval(() => this.logMetrics(), this.interval);
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = undefined;
  }

  private countFrame() {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    requestAnimationFrame(() => this.countFrame());
  }

  private logMetrics() {
    // Log FPS
    Analytics.send({
      type: 'fps_sample',
      payload: { fps: this.fps }
    });

    // Log memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      Analytics.send({
        type: 'memory_sample',
        payload: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        }
      });
    }

    if (import.meta.env.DEV) {
      console.log(`🔍 Performance - FPS: ${this.fps}, Memory: ${this.getMemoryInfo()}`);
    }
  }

  private getMemoryInfo(): string {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      return `${used}MB / ${total}MB`;
    }
    return 'N/A';
  }
}