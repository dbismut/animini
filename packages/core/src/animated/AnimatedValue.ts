import { ConfigValue, ParsedValue } from '../types'
import type { Animated } from './Animated'

export class AnimatedValue {
  private previousValue!: number
  public startVelocity!: number
  public from!: number
  public to!: number
  private na: boolean // non applicable transition
  private velocityPrecision: number = 1
  private distancePrecision: number = 1
  private config!: Required<ConfigValue>
  public idle = true
  public distance = 0
  public velocity = 0

  constructor(public parent: Animated<any>, private key: number | string) {
    this.na = typeof this.value === 'string'
  }
  get time() {
    return this.parent.time
  }
  get value() {
    return this.key !== -1 ? (this.parent.parsedValue as any)[this.key] : this.parent.parsedValue
  }
  set value(value) {
    this.key !== -1 ? ((this.parent.parsedValue as any)[this.key] = value) : (this.parent.parsedValue = value)
  }

  start(to: string | ParsedValue, config: Required<ConfigValue>) {
    this.to = this.key === -1 ? to : (to as any)[this.key]
    this.config = config
    this.from = this.value
    if (!this.na) {
      this.distance = this.to - this.from
      this.startVelocity = this.velocity
      this.distancePrecision = config.easing.wanders ? 0.01 : Math.min(Math.abs(this.distance) * 1e-3, 1)
      this.velocityPrecision = this.distancePrecision ** 2
    }
    this.idle = config.immediate && this.to === this.value
  }

  update() {
    if (this.na) {
      this.value = this.to
      this.idle = true
    }
    if (this.idle) return this.value

    this.previousValue = this.value
    this.value = this.config.immediate ? this.to : this.config.easing.update(this)
    this.velocity = (this.value - this.previousValue) / this.time.delta

    if (this.to === this.value) {
      this.idle = true
      return this.value
    }

    const isMoving = Math.abs(this.velocity) > this.velocityPrecision
    if (!isMoving) {
      if (!this.config.easing.wanders) {
        const isTravelling = Math.abs(this.to - this.value) > this.distancePrecision
        if (!isTravelling) {
          this.idle = true
          this.value = this.to
        }
      } else {
        this.idle = true
      }
    }

    return this.value
  }
}
