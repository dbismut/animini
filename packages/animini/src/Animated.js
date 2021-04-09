import { raf } from './raf'
import { each, map, getset, lerp } from './utils'

function lerpFn() {
  return lerp(this.value, this.target, this.config.factor || 1)
}

export function Animated(value, fn) {
  this.config = {}
  this.time = {}
  this.length = Array.isArray(value) ? value.length : 1
  this.value = value
  this._idle = 0
  this.children = map(value, (v, i) => new AnimatedValue(v, fn, this, i))

  getset(
    this,
    'idle',
    () => !this._idle,
    (flag) => (this._idle += flag ? -1 : 1)
  )
}

Animated.prototype.start = function (target, config = {}) {
  this.time.elapsed = 0
  this.target = target
  this._idle = this.length

  each(this.children, (child) => child.start(config))
}

Animated.prototype.update = function () {
  this.time.elapsed += raf.time.delta
  this.time.delta = raf.time.delta

  each(this.children, (child) => child.update())
}

function AnimatedValue(value, fn, parent, index) {
  this.value = this.target = this.previousValue = value
  this.distance = this.velocity = 0
  this.idle = true
  this.parent = parent
  this.setFn(fn)

  getset(this, 'time', () => parent.time)
  getset(this, 'target', () => (~index ? parent.target[index] : parent.target))
  getset(
    this,
    'value',
    () => (~index ? parent.value[index] : parent.value),
    (value) => (~index ? (parent.value[index] = value) : (parent.value = value))
  )
}

AnimatedValue.prototype.setFn = function (fn = lerpFn) {
  if (typeof fn === 'function') {
    this.fn = fn
    this.onStart = undefined
  } else {
    this.fn = fn.update
    if (fn.onStart) this.onStart = fn.onStart
  }
}

AnimatedValue.prototype.start = function (config) {
  this.idle = this.target === this.value
  this.parent.idle = this.idle
  this.config = config

  if (this.config.immediate) {
    this.value = this.target
  } else if (!this.idle) {
    this.distance = this.target - this.value
    this.precision = Math.min(1, Math.abs(this.distance) * 0.0001)
    this.onStart && this.onStart()
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
