import { lerp } from '../utils'

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
  get to() {
    return this.index !== -1 ? this.parent.to[this.index] : this.parent.to
  },
  get value() {
    return this.index !== -1 ? this.parent._value[this.index] : this.parent._value
  },
  set value(value) {
    this.index !== -1 ? (this.parent._value[this.index] = value) : (this.parent._value = value)
  },
}

AnimatedValue.prototype.start = function () {
  this.previousValue = this.from = this.value
  this.idle = this.to === this.value
  this.v0 = this.velocity

  if (!this.idle) {
    this.distance = this.to - this.from
    this.precision = Math.min(1, Math.abs(this.distance) * 0.001)
  }
}

AnimatedValue.prototype.update = function (progress, fn, dt) {
  if (this.idle) return
  if (this.value === this.to) {
    this.idle = true
    return
  }

  this.previousValue = this.value
  const p = progress + fn(this.v0 / this.distance)
  this.value = lerp(this.from, this.to, p)
  this.velocity = (this.value - this.previousValue) / dt

  const isMoving = Math.abs(this.velocity) > this.precision
  const isTravelling = Math.abs(this.to - this.value) > this.precision

  this.idle = !isMoving && !isTravelling

  if (this.idle) this.value = this.to
}
