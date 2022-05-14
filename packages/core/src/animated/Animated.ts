import type { FrameLoop } from '../FrameLoop'
import { AnimatedValue } from './AnimatedValue'
import { each, map } from '../utils'
import { lerp } from '../algorithms'
import { Adapter, ParsedValue, Algorithm } from '../types'

type Config = {
  immediate?: boolean
}

type Time = {
  elapsed?: number
  delta?: number
}

export class Animated {
  public time: Time = {}
  public config: Config = {}
  public target: any
  public _value: ParsedValue
  public onUpdate
  public fn!: () => number
  public memo?(): any
  private parse
  private setup?(): void
  private _movingChildren = 0
  private children: AnimatedValue[]

  constructor(value: any, algo: Algorithm, private adapter: Adapter, private loop: FrameLoop) {
    this.loop = loop
    this.adapter = adapter
    this.onUpdate = adapter?.onUpdate
    this.parse = adapter?.parse

    this.setAlgo(algo)

    this._value = adapter?.parseInitial ? adapter.parseInitial(value) : value
    this.children = map(this._value, (_v, i) => new AnimatedValue(this, i))
  }

  get idle() {
    return this._movingChildren <= 0
  }
  get value() {
    return this.adapter?.format ? this.adapter.format(this._value) : this._value
  }

  setAlgo(algo: Algorithm = lerp) {
    this.fn = algo.update
    if (algo.setup) this.setup = algo.setup
    if (algo.memo) this.memo = algo.memo()
  }

  start(target: any, config = {}) {
    this.time.elapsed = 0
    this.target = this.parse ? this.parse(target) : target
    this._movingChildren = 0
    this.config = config

    if (!this.config.immediate) {
      this.setup?.()
    }
    each(this.children, (child) => {
      child.start()
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
