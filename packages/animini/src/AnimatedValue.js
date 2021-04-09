import { raf } from './raf'

export function AnimatedValue(value, fn) {
  this.value = this.target = this.previousValue = value
  this.velocity = 0
  this.idle = true
  this.config = {}
  this.time = {}

  this.setFn(fn)
}

AnimatedValue.prototype.setFn = function (fn) {
  if (typeof fn === 'function') {
    this.fn = fn
    this.onStart = undefined
  } else {
    this.fn = fn.update
    if (fn.onStart) this.onStart = fn.onStart
  }
}

AnimatedValue.prototype.start = function (target, config = {}) {
  this.target = target
  this.time.elapsed = 0
  this.idle = this.target === this.value
  if (this.config.immediate) {
    this.value = this.target
  } else {
    this.distance = this.target - this.value
    this.precision = Math.min(1, Math.abs(this.distance) * 0.0001)
    this.config = config
    this.onStart && this.onStart()
  }
}

AnimatedValue.prototype.update = function () {
  this.time.elapsed += raf.time.delta
  this.time.delta = raf.time.delta

  if (this.idle || this.value === this.target) {
    this.idle = true
    this.value = this.target
    return
  }
  this.previousValue = this.value
  this.value = this.fn()
  this.velocity = (this.value - this.previousValue) / this.time.delta

  const isMoving = Math.abs(this.velocity) > this.precision
  const isTravelling = Math.abs(this.target - this.value) > this.precision

  this.idle = !isMoving && !isTravelling
}
