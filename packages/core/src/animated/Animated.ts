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
  key?: string
  adapter?: Adapter<ElementType>
  el?: ElementType
}

export class Animated<ElementType> {
  public value: any
  public parsedValue: ParsedValue
  public to: any
  public time = {} as Time
  public key?: string
  public el?: ElementType
  private adapter?: Adapter<ElementType>
  private movingChildren = 0
  private children: AnimatedValue[]

  constructor({ value, adapter, el, key }: Props<ElementType>, private loop: FrameLoop = GlobalLoop) {
    this.el = el
    this.adapter = adapter
    this.key = key
    this.value = value

    this.onInit()

    this.parsedValue = adapter?.parseInitial ? adapter.parseInitial(value, this) : value
    this.children = map(this.parsedValue, (_v, i) => {
      return new AnimatedValue(this, i)
    })
  }

  private onInit() {
    let fn
    if ((fn = this.adapter?.onInit)) fn(this)
  }

  private onStart() {
    let fn
    if ((fn = this.adapter?.onStart)) fn(this)
  }

  private parse(v: any) {
    let fn
    return (fn = this.adapter?.parse) ? fn(v, this) : (v as ParsedValue)
  }

  private formatValue() {
    let fn
    this.value = (fn = this.adapter?.format) ? fn(this.parsedValue, this) : this.parsedValue
  }

  private onUpdate() {
    let fn
    this.formatValue()
    if ((fn = this.adapter?.onUpdate)) fn(this)
  }

  get idle() {
    return this.movingChildren <= 0
  }

  start(to: any, { immediate = false, easing = defaultLerp }: ConfigValue = {}) {
    this.to = to
    this.time.elapsed = 0
    this.movingChildren = 0

    this.onStart()
    const _to = this.parse(to)

    each(this.children, (child) => {
      child.start(_to, { immediate, easing })
      if (!child.idle) this.movingChildren++
    })
  }

  update() {
    this.time.elapsed += this.loop.time.delta
    this.time.delta = this.loop.time.delta

    each(this.children, (child) => {
      if (!child.idle) {
        child.update()
        if (child.idle) this.movingChildren--
      }
    })

    this.onUpdate()
  }
}
