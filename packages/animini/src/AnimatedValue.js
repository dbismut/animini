import { getset } from './utils'

export function AnimatedValue(value, fn, parent, index) {
  this.value = this.target = this.previousValue = value
  this.distance = this.velocity = 0
  this.idle = true
  this.parent = parent

  getset(this, 'fn', () => parent.fn)
  getset(this, 'time', () => parent.time)
  getset(this, 'target', () => (~index ? parent.target[index] : parent.target))
  getset(
    this,
    'value',
    () => (~index ? parent.value[index] : parent.value),
    (value) => (~index ? (parent.value[index] = value) : (parent.value = value))
  )
}

AnimatedValue.prototype.start = function (config) {
  this.idle = this.target === this.value
  this.parent.idle = this.idle
  this.config = config
  this.startVelocity = this.velocity

  if (this.config.immediate) {
    this.value = this.target
  } else if (!this.idle) {
    this.distance = this.target - this.value
    this.precision = Math.min(1, Math.abs(this.distance) * 0.0001)
  }
}

AnimatedValue.prototype.update = function () {
  if (this.value === this.target) {
    this.idle = true
    this.parent.idle = true
    return
  }

  this.previousValue = this.value
  this.value = this.fn()
  this.velocity = (this.value - this.previousValue) / this.time.delta

  const isMoving = Math.abs(this.velocity) > this.precision
  const isTravelling = Math.abs(this.target - this.value) > this.precision

  this.idle = !isMoving && !isTravelling

  if (this.idle) {
    this.value = this.target
    this.parent.idle = true
  }
}
