import type { FrameLoop } from '../FrameLoop'
import { AnimatedValue } from './AnimatedValue'
import { each, map } from '../utils'
import { lerp } from '../algorithms'
import { Adapter, ParsedValue, ConfigValue } from '../types'

const defaultLerp = lerp()

type Time = {
  elapsed?: number
  delta?: number
}

export class Animated {
  public time: Time = {}
  public target: any
  public _value: ParsedValue
  public onUpdate
  private parse
  private _movingChildren = 0
  private children: AnimatedValue[]

  constructor(value: any, private adapter: Adapter | undefined, private loop: FrameLoop) {
    this.loop = loop
    this.adapter = adapter
    this.onUpdate = adapter?.onUpdate
    this.parse = adapter?.parse

    this._value = adapter?.parseInitial ? adapter.parseInitial(value) : value
    this.children = map(this._value, (_v, i) => new AnimatedValue(this, i))
  }

  get idle() {
    return this._movingChildren <= 0
  }
  get value() {
    return this.adapter?.format ? this.adapter.format(this._value) : this._value
  }

  start(target: any, { immediate = false, easing = defaultLerp }: ConfigValue = {}) {
    this.time.elapsed = 0
    this.target = this.parse ? this.parse(target) : target
    this._movingChildren = 0

    // if (!this.config.immediate) {
    //   this.setup?.()
    // }

    each(this.children, (child) => {
      child.start({ immediate, easing })
      if (!child.idle) this._movingChildren++
    })
  }

  update() {
    this.time.elapsed! += this.loop.time.delta!
    this.time.delta = this.loop.time.delta!

    each(this.children, (child) => {
      if (!child.idle) {
        child.update()
        if (child.idle) this._movingChildren--
      }
    })
  }
}
