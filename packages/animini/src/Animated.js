import { AnimatedValue } from './AnimatedValue'
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

  this.setFn(fn)

  getset(
    this,
    'idle',
    () => !this._idle,
    (flag) => (this._idle += flag ? -1 : 1)
  )
}

Animated.prototype.setFn = function (fn = lerpFn) {
  if (typeof fn === 'function') {
    this.fn = fn
    this.onStart = undefined
  } else {
    this.fn = fn.update
    if (fn.onStart) this.onStart = fn.onStart
  }
}

Animated.prototype.start = function (target, config = {}) {
  this.time.elapsed = 0
  this.target = target
  this._idle = this.length

  if (!this.config.immediate) {
    this.onStart && this.onStart()
  }
  each(this.children, (child) => child.start(config))
}

Animated.prototype.update = function () {
  this.time.elapsed += raf.time.delta
  this.time.delta = raf.time.delta

  each(this.children, (child) => child.update())
}
