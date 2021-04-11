import { AnimatedValue } from './AnimatedValue'
import { each, map, getset, lerp } from '../utils'

function lerpFn() {
  return lerp(this.value, this.target, this.config.factor || 0.05)
}

function getLength(v) {
  return typeof v === 'object' ? (Array.isArray(v) ? v.length : Object.keys(v).length) : 1
}

export function Animated(value, fn, adapter, loop) {
  this.config = {}
  this.time = {}
  this.loop = loop

  this._movingChildren = 0
  this.parse = adapter?.parse
  this.onUpdate = adapter?.onUpdate
  this.setFn(fn)

  this._value = adapter?.parseInitial ? adapter.parseInitial(value) : value
  this.length = getLength(this._value)

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

Animated.prototype.start = function (target, config = {}) {
  this.time.elapsed = 0
  this.target = this.parse ? this.parse(target) : target
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
  this.time.elapsed += this.loop.time.delta
  this.time.delta = this.loop.time.delta

  each(this.children, (child) => {
    if (!child.idle) {
      child.update()
      if (child.idle) this._movingChildren--
    }
  })
}
