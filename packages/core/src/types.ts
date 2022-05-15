import { AnimatedValue } from './animated/AnimatedValue'
import { FrameLoop } from './FrameLoop'

export type ParsedValue = number | number[] | Record<string, number>

export type Adapter = {
  parse?(value: any): ParsedValue | undefined
  parseInitial?(value: any): ParsedValue | undefined
  format?(value: ParsedValue): any
  onUpdate?(target: any, key: string | number): void
}

export type Algorithm = (a: AnimatedValue) => number

export type Payload = Record<string, any>

export type Target<ElementType, ValueType extends Payload> = {
  loop?: FrameLoop
  setValues?(rawValues: ValueType, element: ElementType, payload: Partial<ValueType>): void
  getInitialValueAndAdapter<K extends keyof ValueType>(
    element: ElementType,
    key: K,
    initialStyle: any
  ): [ValueType[K], Adapter | undefined]
}

export type ConfigValue = {
  immediate?: boolean
  easing?: Algorithm
}

export type Config = ConfigValue | ((key: string) => ConfigValue)
