import { ConfigValue, NumberOrString, ParsedValue } from '../types'
import { clamp } from '../utils/math'
import { parseUnitValue } from '../utils/string'
import type { Animated } from './Animated'

export class AnimatedValue {
  private previousValue!: number
  public startVelocity!: number
  public from!: number
  public to!: number
  public _value: number
  private unit?: string
  private precision: number = 1
  private config!: Required<ConfigValue>
  public idle = true
  public distance = 0
  public velocity = 0

  constructor(public parent: Animated, private index: number | string, initialValue: ParsedValue) {
    initialValue = this.index !== -1 ? (initialValue as any)[this.index] : initialValue
    const [_value, unit] = parseUnitValue(initialValue as NumberOrString)
    this._value = _value
    this.unit = unit
  }
  get time() {
    return this.parent.time
  }
  get value() {
    return this._value
  }
  set value(valueWithoutUnit) {
    this._value = valueWithoutUnit
    const value = this.unit ? valueWithoutUnit + this.unit : valueWithoutUnit
    this.index !== -1 ? ((this.parent.value as any)[this.index] = value) : (this.parent.value = value)
  }
  parseUnitValue(value: NumberOrString) {
    if (typeof value === 'number') return [value]
    this._value = parseFloat(value)
    this.unit = value.substring(('' + this._value).length)
  }

  start(to: ParsedValue, config: Required<ConfigValue>) {
    to = this.index === -1 ? to : (to as any)[this.index]
    this.config = config
    this.from = this.value
    const [value, unit] = parseUnitValue(to as NumberOrString)
    this.to = value
    this.unit = unit
    this.distance = this.to - this.from
    this.startVelocity = this.velocity

    this.idle = config.immediate && this.to === this.value
    this.precision = clamp(Math.abs(this.distance) * 0.001, 0.01, 1)
  }

  update() {
    if (!this.idle) {
      this.previousValue = this.value
      this.value = this.config.immediate ? this.to : this.config.easing.update(this)

      this.velocity = (this.value - this.previousValue) / this.time.delta

      if (this.to === this.value) {
        this.idle = true
      } else {
        const isMoving = Math.abs(this.velocity) > 1e-6
        if (!isMoving) {
          this.idle = true
          const isTravelling = Math.abs(this.to - this.value) > this.precision
          if (!isTravelling) this.value = this.to
        }
      }
    }
    return this.value
  }
}
