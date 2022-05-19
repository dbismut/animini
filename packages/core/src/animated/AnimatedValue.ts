import { ConfigValue } from '../types'
import type { Animated } from './Animated'

export class AnimatedValue {
  private previousValue!: number
  public startVelocity!: number
  public from!: number
  private precision: number = 1
  private config!: Required<ConfigValue>
  public idle = true
  public distance = 0
  public velocity = 0

  constructor(public parent: Animated, private index: number | string) {}
  get time() {
    return this.parent.time
  }
  get to() {
    return this.index !== -1 ? this.parent.to[this.index] : this.parent.to
  }
  get value() {
    // @ts-expect-error
    return this.index !== -1 ? this.parent.value[this.index] : this.parent.value
  }
  set value(value) {
    // @ts-expect-error
    this.index !== -1 ? (this.parent.value[this.index] = value) : (this.parent.value = value)
  }

  start(config: Required<ConfigValue>) {
    this.config = config
    this.previousValue = this.from = this.value
    this.idle = this.to === this.value
    this.startVelocity = this.velocity

    if (config.immediate) {
      this.value = this.to
    } else if (!this.idle) {
      this.distance = this.to - this.value
      this.precision = Math.min(1, Math.abs(this.distance) * 0.001)
    }
  }

  update() {
    if (this.idle) return
    if (this.value === this.to) {
      this.idle = true
      return
    }

    this.previousValue = this.value
    this.value = this.config.easing(this)

    this.velocity = (this.value - this.previousValue) / this.time.delta

    const isMoving = Math.abs(this.velocity) > this.precision
    const isTravelling = Math.abs(this.to - this.value) > this.precision

    this.idle = !isMoving && !isTravelling

    if (this.idle) this.value = this.to
  }
}
