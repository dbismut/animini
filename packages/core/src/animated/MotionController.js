import * as algorithms from '../algorithms'

export function MotionController(key, config, frameLoop) {
  this.config = config
  this.progress = 0

  this._key = key
  this._algorithm = algorithms[config.motion]
  this._algorithm.setup?.call(this)
  this._removed = false
  this._internalTime = { elapsed: 0 }
  this._createdAt = frameLoop.time.elapsed

  this._frameLoop = frameLoop
}

MotionController.prototype.update = function () {
  const loopTime = this._frameLoop.time
  const firstFrame = loopTime.elapsed === this._createdAt

  if (!this._removed && !firstFrame) {
    removeFromAvailableControllers(this)
  }

  if (this._internalTime.lastUpdate === loopTime.elapsed) return

  this._internalTime.lastUpdate = loopTime.elapsed
  this._internalTime.elapsed += loopTime.delta
  this._internalTime.delta = loopTime.delta

  const [progress, getProgress] = this._algorithm.solver.call(this)
  this.progress = progress
  this.getProgress = getProgress
}

const AvailableControllers = new Map()

function removeFromAvailableControllers(ctrl) {
  AvailableControllers.get(ctrl._key).delete(ctrl._createdAt)
  ctrl._removed = true
}

export function getAvailableController(config = { motion: 'lerp', factor: 0.05 }, frameLoop) {
  const configKey = JSON.stringify(config)
  const motionTimestamp = frameLoop.time.elapsed

  if (!AvailableControllers.has(configKey)) AvailableControllers.set(configKey, new Map())
  const motionForConfig = AvailableControllers.get(configKey)

  if (!motionForConfig.has(motionTimestamp)) {
    const controller = new MotionController(configKey, config, frameLoop)
    motionForConfig.set(motionTimestamp, controller)
  }

  return motionForConfig.get(motionTimestamp)
}
