import { AnimatedValue } from './AnimatedValue'
import { each, map } from '../utils'
import { lerp } from '../algorithms'

export function Animated(value, fn, adapter, loop) {
  this.config = {}
  this.time = {}
  this.loop = loop
  this.adapter = adapter
  this.onUpdate = adapter?.onUpdate
  this.parse = adapter?.parse

  this._movingChildren = 0
  this.setFn(fn)

  this._value = adapter?.parseInitial ? adapter.parseInitial(value) : value

  this.children = map(this._value, (_v, i) => new AnimatedValue(this, i))
}

Animated.prototype = {
  get idle() {
    return this._movingChildren <= 0
  },
  get value() {
    return this.adapter?.format ? this.adapter.format(this._value) : this._value
  },
}

Animated.prototype.setFn = function (fn = lerp) {
  this.fn = fn.update
  if (fn.setup) this.setup = fn.setup
  if (fn.memo) this.memo = fn.memo()
}

Animated.prototype.start = function (target, config = {}) {
  this.time.elapsed = 0
  this.target = this.parse ? this.parse(target) : target
  this._movingChildren = 0
  this.config = config

  if (!this.config.immediate) {
    this.setup && this.setup()
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
