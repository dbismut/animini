import { Animated } from './animated/Animated'
import { AnimatedValue } from './animated/AnimatedValue'
import { FrameLoop } from './FrameLoop'

export type { Animated }

export type ParsedValue = number | number[] | Record<string, number>

export type AdapterFn<ElementType, R> = (value: any, animated: Animated<ElementType>) => R

export type Adapter<ElementType> = {
  setup?(animated: Animated<ElementType>): void
  parse?(value: any, animated: Animated<ElementType>): ParsedValue
  parseInitial?(value: any, animated: Animated<ElementType>): ParsedValue
  format?(value: any, animated: Animated<ElementType>): any
  onUpdate?(animated: Animated<ElementType>): void
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
  ): [ValueType[K], Adapter<ElementType> | undefined]
}

export type ConfigValue = {
  immediate?: boolean
  easing?: Algorithm
}

export type Config = ConfigValue | ((key: string) => ConfigValue)
