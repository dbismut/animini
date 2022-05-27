import { ConfigValue, ParsedValue } from '../types'
import type { Animated } from './Animated'

export class AnimatedValue {
  private previousValue!: number
  public startVelocity!: number
  public from!: number
  public to!: number
  private precision: number = 1
  private config!: Required<ConfigValue>
  public idle = true
  public distance = 0
  public velocity = 0

  constructor(public parent: Animated, private index: number | string) {}
  get time() {
    return this.parent.time
  }
  get value() {
    return this.index !== -1 ? (this.parent.value as any)[this.index] : this.parent.value
  }
  set value(value) {
    this.index !== -1 ? ((this.parent.value as any)[this.index] = value) : (this.parent.value = value)
  }

  start(to: ParsedValue, config: Required<ConfigValue>) {
    this.config = config
    this.from = this.value
    this.to = this.index === -1 ? to : (to as any)[this.index]
    this.distance = this.to - this.from
    this.startVelocity = this.velocity

    this.idle = config.immediate && this.to === this.value
    this.precision = Math.min(Math.abs(this.distance) * 1e-4, 1)
  }

  update() {
    if (!this.idle) {
      this.previousValue = this.value
      this.value = this.config.immediate ? this.to : this.config.easing.update(this)

      this.velocity = (this.value - this.previousValue) / this.time.delta

      if (this.to === this.value) {
        this.idle = true
      } else {
        const isMoving = Math.abs(this.velocity) > this.precision
        if (!isMoving) {
          if (!this.config.easing.wanders) {
            const isTravelling = Math.abs(this.to - this.value) > this.precision
            if (!isTravelling) {
              this.idle = true
              this.value = this.to
            }
          } else {
            this.idle = true
          }
        }
      }
    }

    return this.value
  }
}
