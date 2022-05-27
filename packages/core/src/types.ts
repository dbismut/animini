import { AnimatedValue } from './animated/AnimatedValue'
import { FrameLoop } from './FrameLoop'

export type ParsedValue = number | number[] | Record<string, number>

export type AdapterFn<ElementType, ValueType extends Payload, R> = (
  value: any,
  key: string | number | symbol,
  target: ElementType | undefined | null,
  currentValues: any
) => R

export type Adapter<ElementType, ValueType extends Payload> = {
  parse?: AdapterFn<ElementType, ValueType, ParsedValue>
  parseInitial?: AdapterFn<ElementType, ValueType, ParsedValue>
  format?(value: ParsedValue): any
  onChange?: AdapterFn<ElementType, ValueType, void>
}

export type Algorithm = {
  wanders?: boolean
  update: (a: AnimatedValue) => number
}

export type Payload = Record<string, any>

export type Target<ElementType, ValueType extends Payload> = {
  loop?: FrameLoop
  setValues?(rawValues: ValueType, element: ElementType, payload: Partial<ValueType>): void
  getInitialValueAndAdapter<K extends keyof ValueType>(
    element: ElementType,
    key: K,
    currentValues?: any
  ): [ValueType[K], Adapter<ElementType, ValueType> | undefined]
}

export type ConfigValue = {
  immediate?: boolean
  easing?: Algorithm
}

export type Config = ConfigValue | ((key: string) => ConfigValue)
