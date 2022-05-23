import { AnimatedValue } from './animated/AnimatedValue'
import { FrameLoop } from './FrameLoop'

export type ParsedValue = number | number[] | Record<string, number>

export type Adapter = {
  parse?(value: any): ParsedValue
  parseInitial?(value: any): ParsedValue
  format?(value: ParsedValue): any
  onChange?(target: any, key: string | number, value: any): void
}

export type Algorithm = {
  update: (a: AnimatedValue) => number
}

export type Payload = Record<string, any>

export type Target<ElementType, ValueType extends Payload> = {
  loop?: FrameLoop
  setValues?(rawValues: ValueType, element: ElementType, payload: Partial<ValueType>): void
  getInitialValueAndAdapter<K extends keyof ValueType>(
    element: ElementType,
    key: K,
    initialStyle?: any
  ): [ValueType[K], Adapter | undefined]
}

export type ConfigValue = {
  immediate?: boolean
  easing?: Algorithm
}

export type Config = ConfigValue | ((key: string) => ConfigValue)
