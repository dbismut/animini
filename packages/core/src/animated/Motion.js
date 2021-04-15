import { lerp } from '../utils'

function lerpFn() {
  return lerp(this.value, this.to, this.config.factor || 0.05)
}

export function Motion(fn, config = {}, loop) {
  this.config = {}
  this.time = {}
  this.loop = loop
  this.config = config
  this.children = new Set()
  this.movingChildren = 0
  this.progress = 0
  this.setFn(fn)
}

Motion.prototype = {
  get idle() {
    return this.movingChildren <= 0
  },
}

Motion.prototype.setFn = function (fn = lerpFn) {
  if (typeof fn === 'function') {
    this.fn = fn
    this.onStart = undefined
  } else {
    this.fn = fn.update
    if (fn.onStart) this.onStart = fn.onStart
  }
}

Motion.prototype.attach = function (child) {
  this.children.add(child)
}

Motion.prototype.detach = function (child) {
  this.children.remove(child)
}

Motion.prototype.start = function () {
  this.time.elapsed = 0

  if (!this.config.immediate) {
    this.onStart && this.onStart()
  }
  this.movingChildren = 0
  this.children.forEach((child) => {
    child.start()
    if (!child.idle) this.movingChildren++
  })
}

Motion.prototype.update = function () {
  if (this.idle) return

  if (this.config.immediate) this.progress = 1
  else {
    this.time.elapsed += this.loop.time.delta
    this.time.delta = this.loop.time.delta

    const [v, fn] = this.fn(this.time.delta)

    this.progress = v

    this.children.forEach((child) => {
      if (!child.idle) {
        child.update(this.progress, fn, this.time.delta)
        if (child.idle) this.movingChildren--
      }
    })
  }
}
