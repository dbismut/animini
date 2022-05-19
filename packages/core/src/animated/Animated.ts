import type { FrameLoop } from '../FrameLoop'
import { AnimatedValue } from './AnimatedValue'
import { each, map } from '../utils'
import { lerp } from '../algorithms'
import { ParsedValue, ConfigValue } from '../types'
import { GlobalLoop } from '../FrameLoop'

const defaultLerp = lerp()

type Time = {
  elapsed: number
  delta: number
}

export class Animated {
  public time = {} as Time
  public to: any
  private _movingChildren = 0
  private children: AnimatedValue[]

  constructor(public value: ParsedValue, private loop: FrameLoop = GlobalLoop) {
    this.children = map(value, (_v, i) => {
      return new AnimatedValue(this, i)
    })
  }

  get idle() {
    return this._movingChildren <= 0
  }

  start(to: any, { immediate = false, easing = defaultLerp }: ConfigValue = {}) {
    this.time.elapsed = 0
    this.to = to
    this._movingChildren = 0

    each(this.children, (child) => {
      child.start({ immediate, easing })
      if (!child.idle) this._movingChildren++
    })
  }

  update() {
    this.time.elapsed += this.loop.time.delta
    this.time.delta = this.loop.time.delta

    each(this.children, (child) => {
      if (!child.idle) {
        child.update()
        if (child.idle) this._movingChildren--
      }
    })
  }
}
