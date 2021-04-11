import { AnimatedValue } from './AnimatedValue'
import { raf } from './raf'
import { each, map, getset, lerp } from './utils'

function lerpFn() {
  return lerp(this.value, this.target, this.config.factor || 0.05)
}

function getLength(v) {
  return typeof v === 'object' ? (Array.isArray(v) ? v.length : Object.keys(v).length) : 1
}

export function Animated(value, fn) {
  this.config = {}
  this.time = {}
  this.length = getLength(value)
  this.value = value
  this._movingChildren = 0
  this.children = map(value, (_v, i) => new AnimatedValue(this, i))
  this.setFn(fn)

  getset(this, 'idle', () => this._movingChildren <= 0)
}

Animated.prototype.setFn = function (fn = lerpFn) {
  if (typeof fn === 'function') {
    this.fn = fn
    this.onStart = undefined
  } else {
    this.fn = fn.update
    if (fn.onStart) this.onStart = fn.onStart
    if (fn.memo) this.memo = fn.memo()
  }
}

Animated.prototype.start = function (target, config = {}) {
  this.time.elapsed = 0
  this.target = target
  this._movingChildren = 0
  this.config = config

  if (!this.config.immediate) {
    this.onStart && this.onStart()
  }
  each(this.children, (child) => {
    child.start(config)
    if (!child.idle) this._movingChildren++
  })
}

Animated.prototype.update = function () {
  this.time.elapsed += raf.time.delta
  this.time.delta = raf.time.delta

  each(this.children, (child) => {
    if (!child.idle) {
      child.update()
      if (child.idle) this._movingChildren--
    }
  })
}
