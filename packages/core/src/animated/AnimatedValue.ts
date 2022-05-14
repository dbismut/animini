import type { Animated } from './Animated'

export class AnimatedValue {
  private previousValue?: number
  public startVelocity?: number
  private precision?: number
  public idle = true
  public distance = 0
  public velocity = 0

  constructor(public parent: Animated, private index: number | string) {}
  get fn() {
    return this.parent.fn
  }
  get config() {
    return this.parent.config
  }
  get time() {
    return this.parent.time
  }
  get target() {
    return this.index !== -1 ? this.parent.target[this.index] : this.parent.target
  }
  get value() {
    // @ts-expect-error
    return this.index !== -1 ? this.parent._value[this.index] : this.parent._value
  }
  set value(value) {
    // @ts-expect-error
    this.index !== -1 ? (this.parent._value[this.index] = value) : (this.parent._value = value)
  }

  start() {
    this.previousValue = this.value
    this.idle = this.target === this.value
    this.startVelocity = this.velocity

    if (this.config.immediate) {
      this.value = this.target
    } else if (!this.idle) {
      this.distance = this.target - this.value
      this.precision = Math.min(1, Math.abs(this.distance) * 0.001)
    }
  }

  update() {
    if (this.idle) return
    if (this.value === this.target) {
      this.idle = true
      return
    }

    this.previousValue = this.value
    this.value = this.fn()

    this.velocity = (this.value - this.previousValue!) / this.time.delta!

    const isMoving = Math.abs(this.velocity) > this.precision!
    const isTravelling = Math.abs(this.target - this.value) > this.precision!

    this.idle = !isMoving && !isTravelling

    if (this.idle) this.value = this.target
  }
}
