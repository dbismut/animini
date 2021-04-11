import { AnimatedValue } from './AnimatedValue'
import { raf } from '../raf'
import { each, map, getset, lerp } from '../utils'

function lerpFn() {
  return lerp(this.value, this.target, this.config.factor || 0.05)
}

function getLength(v) {
  return typeof v === 'object' ? (Array.isArray(v) ? v.length : Object.keys(v).length) : 1
}

export function Animated(initialValue, fn, adapter) {
  this.config = {}
  this.time = {}

  this._movingChildren = 0
  this.adapter = adapter
  this.setFn(fn)

  this._value = initialValue
  this.length = getLength(initialValue)

  this.children = map(this._value, (_v, i) => new AnimatedValue(this, i))

  getset(this, 'idle', () => this._movingChildren <= 0)
  getset(this, 'value', () => (adapter?.format ? adapter.format(this._value) : this._value))
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

Animated.prototype.parse = function (value) {
  if (this.adapter?.parse) return this.adapter.parse(value)
  return value
}

Animated.prototype.start = function (target, config = {}) {
  this.time.elapsed = 0
  this.target = this.parse(target)
  this._movingChildren = 0
  this.config = config

  if (!this.config.immediate) {
    this.onStart && this.onStart()
  }
  each(this.children, (child) => {
    child.start()
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
