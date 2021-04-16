import { AnimatedValue } from './AnimatedValue'
import { getAvailableController } from './MotionController'
import { each, map } from '../utils'

export function Animated(value, adapter, frameLoop) {
  this._adapter = adapter
  this._value = adapter?.parseInitial ? adapter.parseInitial(value) : value
  this._children = map(this._value, (_v, i) => new AnimatedValue(this, i))
  this._movingChildren = 0

  this.onUpdate = adapter?.onUpdate
  this._frameLoop = frameLoop
}

Animated.prototype = {
  get idle() {
    return this._movingChildren <= 0
  },
  get value() {
    return this._adapter?.format ? this._adapter.format(this._value) : this._value
  },
}

Animated.prototype.start = function (to, config) {
  this.to = this._adapter?.parse ? this._adapter.parse(to) : to
  this.config = config
  this._ctrl = undefined

  this._movingChildren = 0
  each(this._children, (child) => {
    child.start()
    if (!child.idle) this._movingChildren++
  })
}

function immediateSolver() {
  return 1
}

Animated.prototype.update = function () {
  if (this.idle) return

  const immediate = this.config.immediate
  if (!immediate) {
    if (!this._ctrl) {
      this._ctrl = getAvailableController(this.config, this._frameLoop)
    }
    this._ctrl.update()
  }

  each(this._children, (child) => {
    if (!child.idle) {
      child.update(immediate, this._ctrl?.getProgress, this._frameLoop.time.delta)
      if (child.idle) this._movingChildren--
    }
  })
}
