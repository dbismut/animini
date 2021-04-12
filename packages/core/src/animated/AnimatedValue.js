import { getset } from '../utils'

export function AnimatedValue(parent, index) {
  this.distance = this.velocity = 0
  this.idle = true
  this.parent = parent
  const hasKey = index !== -1

  getset(this, 'fn', () => parent.fn)
  getset(this, 'config', () => parent.config)
  getset(this, 'time', () => parent.time)
  getset(this, 'target', () => (~index ? parent.target[index] : parent.target))
  getset(
    this,
    'value',
    () => (hasKey ? parent._value[index] : parent._value),
    (value) => (hasKey ? (parent._value[index] = value) : (parent._value = value))
  )
}

AnimatedValue.prototype.start = function () {
  this.previousValue = this.value
  this.idle = this.target === this.value
  this.startVelocity = this.velocity

  if (this.config.immediate) {
    this.value = this.target
  } else if (!this.idle) {
    this.distance = this.target - this.value
    this.precision = Math.min(1, Math.abs(this.distance) * 0.001)
  }
}

AnimatedValue.prototype.update = function () {
  if (this.idle) return
  if (this.value === this.target) {
    this.idle = true
    return
  }

  this.previousValue = this.value
  this.value = this.fn()

  this.velocity = (this.value - this.previousValue) / this.time.delta

  const isMoving = Math.abs(this.velocity) > this.precision
  const isTravelling = Math.abs(this.target - this.value) > this.precision

  this.idle = !isMoving && !isTravelling

  if (this.idle) this.value = this.target
}
