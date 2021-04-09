export const raf = {
  rafId: 0,
  running: false,
  queue: new Set<Function>(),
  time: { start: 0, elapsed: 0, delta: 0 },
  frame() {
    if (!this.running) return
    this.updateTime()
    this.queue.forEach((cb: Function) => cb())
    this.rafId = window.requestAnimationFrame(this.frame.bind(this))
  },
  run() {
    if (!this.running) {
      this.time = { start: performance.now(), elapsed: 0, delta: 0 }
      this.rafId = window.requestAnimationFrame(this.frame.bind(this))
      this.running = true
    }
  },
  start(cb: Function) {
    this.queue.add(cb)
    this.run()
  },
  stop(cb: Function) {
    if (!cb) return
    this.queue.delete(cb)
    if (!this.queue.size) this.stopAll()
  },
  stopAll() {
    window.cancelAnimationFrame(this.rafId)
    this.running = false
  },
  updateTime() {
    const ts = performance.now()
    const t = ts - this.time.start
    this.time.delta = Math.min(64, t - this.time.elapsed)
    this.time.elapsed += this.time.delta
  },
}
