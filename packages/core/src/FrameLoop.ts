function now() {
  return typeof performance != 'undefined' ? performance.now() : Date.now()
}

type Time = {
  _elapsed: number
  elapsed: number
  start: number
  delta: number
}

export class FrameLoop {
  private rafId = 0
  private running = false
  private queue = new Set<Function>()
  public time = {} as Time

  tick() {
    if (!this.running) return
    this.update()
    this.rafId = window.requestAnimationFrame(this.tick.bind(this))
  }

  update() {
    this.updateTime()
    this.queue.forEach((cb) => cb())
  }

  run() {
    if (!this.running) {
      this.time = { start: now(), elapsed: 0, delta: 0, _elapsed: 0 }
      this.running = true
      this.tick()
    }
  }

  start(cb: Function) {
    this.queue.add(cb)
    this.run()
  }

  stop(cb: Function) {
    if (!cb) return
    this.queue.delete(cb)
    if (!this.queue.size) this.stopAll()
  }

  stopAll() {
    this.rafId && window.cancelAnimationFrame(this.rafId)
    this.running = false
  }

  updateTime() {
    const ts = now()
    const _elapsed = ts - this.time.start
    this.time.delta = Math.max(1, Math.min(64, Math.round(_elapsed - this.time._elapsed)))
    this.time._elapsed = _elapsed
    this.time.elapsed += this.time.delta
  }
}

export const GlobalLoop = new FrameLoop()
