import { AnimatedValue } from './animated/AnimatedValue'
import { FrameLoop } from './FrameLoop'

export type ParsedValue = number | number[] | Record<string, number>

export type AdapterFn<ElementType, R> = (
  value: any,
  key: string | number | symbol,
  target: ElementType | undefined | null
) => R

// TODO fix ValueType
export type Adapter<ElementType, ValueType extends Payload> = {
  parse?: AdapterFn<ElementType, ParsedValue>
  parseInitial?: AdapterFn<ElementType, ParsedValue>
  format?(value: string | ParsedValue): any
  onChange?: AdapterFn<ElementType, void>
}

export type Algorithm = {
  /**
   * When true, the algorithm doesn't always reach its destination (ie inertia).
   * @note should probably be renamed.
   */
  wanders?: boolean
  update: (a: AnimatedValue) => number
}

export type Payload = Record<string, any>

export type Target<ElementType, ValueType extends Payload> = {
  loop?: FrameLoop
  setValues?(rawValues: ValueType, element: ElementType): void
  getInitialValueAndAdapter<K extends keyof ValueType>(
    element: ElementType,
    key: K
  ): [ValueType[K], Adapter<ElementType, ValueType> | undefined]
}

export type ConfigValue = {
  immediate?: boolean
  easing?: Algorithm
}

export type Config = ConfigValue | ((key: string) => ConfigValue)
