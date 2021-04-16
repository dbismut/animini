import { lerp, clamp } from '../utils'

export function AnimatedValue(parent, index) {
  this.x0 = this.v0 = this.velocity = 0
  this.idle = true
  this.parent = parent
  this.index = index
}

AnimatedValue.prototype = {
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

  if (!this.idle) {
    this.v0 = this.velocity
    this.x0 = this.to - this.from
    this.precision = clamp(Math.abs(this.x0) * 0.001, 0.001, 1)
  }
}

AnimatedValue.prototype.update = function (immediate, getProgress, dt) {
  if (this.idle) return
  if (immediate) this.value = this.to

  if (this.value === this.to) {
    this.idle = true
    this.velocity = 0
    return
  }

  this.previousValue = this.value
  const progress = getProgress(this)

  this.value = lerp(this.from, this.to, progress)
  this.velocity = (this.value - this.previousValue) / dt

  const isMoving = Math.abs(this.velocity) > this.precision
  const isTravelling = Math.abs(this.to - this.value) > this.precision

  this.idle = !isMoving && !isTravelling

  if (this.idle) {
    this.value = this.to
    this.velocity = 0
  }
}
