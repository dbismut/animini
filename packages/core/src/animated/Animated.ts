import type { FrameLoop } from '../FrameLoop'
import { AnimatedValue } from './AnimatedValue'
import { each, map } from '../utils/object'
import { lerp } from '../algorithms'
import { ConfigValue, Adapter, ParsedValue } from '../types'
import { GlobalLoop } from '../FrameLoop'

const defaultLerp = lerp()

type Time = {
  elapsed: number
  delta: number
}

type Props<ElementType> = {
  value: any
  key?: string | number | symbol
  adapter?: Adapter<ElementType>
  el?: ElementType
}

export class Animated<ElementType> {
  public value: ParsedValue
  public time = {} as Time
  private key?: string | number | symbol
  private el?: ElementType
  private adapter?: Adapter<ElementType>
  private _movingChildren = 0
  private children: AnimatedValue[]

  constructor({ value, adapter, el, key }: Props<ElementType>, private loop: FrameLoop = GlobalLoop) {
    this.el = el
    this.adapter = adapter
    this.key = key
    this.value = adapter?.parseInitial ? adapter.parseInitial(value) : value
    this.children = map(this.value, (_v, i) => {
      return new AnimatedValue(this, i)
    })
  }

  parse(v: any) {
    let fn
    return (fn = this.adapter?.parse) ? fn(v, this.key, this.el) : (v as ParsedValue)
  }

  onChange() {
    let fn
    if ((fn = this.adapter?.onChange)) fn(this.value, this.key, this.el)
  }

  public get formattedValue() {
    let fn
    return (fn = this.adapter?.format) ? fn(this.value) : this.value
  }

  get idle() {
    return this._movingChildren <= 0
  }

  start(to: any, { immediate = false, easing = defaultLerp }: ConfigValue = {}) {
    const _to = this.parse(to)
    this.time.elapsed = 0
    this._movingChildren = 0

    each(this.children, (child) => {
      child.start(_to, { immediate, easing })
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

    this.onChange()
  }
}
