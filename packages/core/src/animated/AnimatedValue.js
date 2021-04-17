import { clamp } from '../utils'

export function AnimatedValue(parent, index) {
  this.distance = this.velocity = 0
  this.idle = true
  this.parent = parent
  this.index = index
}

AnimatedValue.prototype = {
  get fn() {
    return this.parent.fn
  },
  get config() {
    return this.parent.config
  },
  get time() {
    return this.parent.time
  },
  get target() {
    return this.index !== -1 ? this.parent.target[this.index] : this.parent.target
  },
  get value() {
    return this.index !== -1 ? this.parent._value[this.index] : this.parent._value
  },
  set value(value) {
    this.index !== -1 ? (this.parent._value[this.index] = value) : (this.parent._value = value)
  },
}

AnimatedValue.prototype.start = function () {
  this.previousValue = this.value
  this.idle = this.target === this.value
  this.startVelocity = this.velocity

  if (this.config.immediate) {
    this.value = this.target
  } else if (!this.idle) {
    this.distance = this.target - this.value
    this.precision = clamp(Math.abs(this.distance), 0.001, 1)
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
