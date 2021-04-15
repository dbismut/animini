import { AnimatedValue } from './AnimatedValue'
import { each, map } from '../utils'

export function Animated(value, adapter) {
  this.adapter = adapter
  this.onUpdate = adapter?.onUpdate
  this._value = adapter?.parseInitial ? adapter.parseInitial(value) : value
  this.children = map(this._value, (_v, i) => new AnimatedValue(this, i))
  this.movingChildren = 0
}

Animated.prototype = {
  get idle() {
    return this.movingChildren <= 0
  },
  get value() {
    return this.adapter?.format ? this.adapter.format(this._value) : this._value
  },
  get to() {
    return this._to
  },
  set to(to) {
    this._to = this.adapter?.parse ? this.adapter.parse(to) : to
  },
}

Animated.prototype.start = function () {
  this.movingChildren = 0
  each(this.children, (child) => {
    child.start()
    if (!child.idle) this.movingChildren++
  })
}

Animated.prototype.update = function (progress, fn, dt) {
  each(this.children, (child) => {
    if (!child.idle) {
      child.update(progress, fn, dt)
      if (child.idle) this.movingChildren--
    }
  })
}
