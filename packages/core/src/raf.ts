type Time = { start: number; elapsed: number; delta: number; _elapsed: number }

export const raf = {
  rafId: 0,
  running: false,
  queue: new Set<Function>(),
  time: {} as Time,
  frame() {
    if (!this.running) return
    this.updateTime()
    this.queue.forEach((cb: Function) => cb())
    this.rafId = window.requestAnimationFrame(this.frame.bind(this))
  },
  run() {
    if (!this.running) {
      this.time = { start: this.now(), elapsed: 0, delta: 0, _elapsed: 0 }
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
  now() {
    return typeof performance != 'undefined' ? performance.now() : Date.now()
  },
  updateTime() {
    const ts = this.now()
    const _elapsed = ts - this.time.start
    this.time.delta = Math.min(64, _elapsed - this.time._elapsed)
    this.time._elapsed = _elapsed
    this.time.elapsed += this.time.delta
  },
}
