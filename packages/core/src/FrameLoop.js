function now() {
  return typeof performance != 'undefined' ? performance.now() : Date.now()
}

export function FrameLoop() {
  this.rafId = 0
  this.running = false
  this.queue = new Set()
  this.time = { start: 0, elapsed: 0, delta: 0, _elapsed: 0 }
}

FrameLoop.prototype.tick = function () {
  if (!this.running) return
  this.update()
  this.rafId = window.requestAnimationFrame(this.tick.bind(this))
}

FrameLoop.prototype.update = function () {
  this.updateTime()
  this.queue.forEach((cb) => cb())
}

FrameLoop.prototype.run = function () {
  if (!this.running) {
    this.time = { start: now(), elapsed: 0, delta: 0, _elapsed: 0 }
    this.running = true
    this.tick()
  }
}

FrameLoop.prototype.start = function (cb) {
  this.queue.add(cb)
  this.run()
}

FrameLoop.prototype.stop = function (cb) {
  if (!cb) return
  this.queue.delete(cb)
  if (!this.queue.size) this.stopAll()
}

FrameLoop.prototype.stopAll = function () {
  this.rafId && window.cancelAnimationFrame(this.rafId)
  this.running = false
}

FrameLoop.prototype.updateTime = function () {
  const ts = now()
  const _elapsed = ts - this.time.start
  this.time.delta = Math.max(1, Math.min(64, Math.round(_elapsed - this.time._elapsed)))
  this.time._elapsed = _elapsed
  this.time.elapsed += this.time.delta
}

export const GlobalLoop = new FrameLoop()
