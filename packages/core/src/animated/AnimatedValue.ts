import { ConfigValue } from '../types'
import { clamp } from '../utils/math'
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
  set to(value) {
    this.index !== -1 ? (this.parent.to[this.index] = value) : (this.parent.to = value)
  }
  get value() {
    return this.index !== -1 ? (this.parent.value as any)[this.index] : this.parent.value
  }
  set value(value) {
    this.index !== -1 ? ((this.parent.value as any)[this.index] = value) : (this.parent.value = value)
  }

  start(config: Required<ConfigValue>) {
    this.config = config
    this.from = this.value

    this.idle = config.immediate && this.to === this.value

    this.startVelocity = this.velocity

    this.distance = this.to - this.from
    this.precision = clamp(Math.abs(this.distance) * 0.001, 0.01, 1)
  }

  update() {
    if (this.idle) return

    this.previousValue = this.value
    this.value = this.config.immediate ? this.to : this.config.easing.update(this)

    this.velocity = (this.value - this.previousValue) / this.time.delta

    if (this.to === this.value) {
      this.idle = true
    } else {
      const isMoving = Math.abs(this.velocity) > this.precision / 100
      const isTravelling = Math.abs(this.to - this.value) > this.precision

      if (!isMoving) {
        this.idle = true
        if (!isTravelling) this.value = this.to
      }
    }
  }
}
