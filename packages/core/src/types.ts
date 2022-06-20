import { Animated } from './animated/Animated'
import { AnimatedValue } from './animated/AnimatedValue'
import { FrameLoop } from './FrameLoop'

export type { Animated }

export type ParsedValue = number | number[] | Record<string, number>

export type AdapterFn<ElementType, R> = (value: any, animated: Animated<ElementType>) => R

export type Adapter<ElementType> = {
  parse?(value: any, animated: Animated<ElementType>): ParsedValue
  parseInitial?(value: any, animated: Animated<ElementType>): ParsedValue
  format?(value: any, animated: Animated<ElementType>): any
  onInit?(animated: Animated<ElementType>): void
  onStart?(animated: Animated<ElementType>): void
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

export type Target<ElementType, Values extends Payload> = {
  getElement?(element: any): ElementType
  loop?: FrameLoop
  setValues?(rawValues: Values, element: ElementType, initial?: any, idle?: boolean): void
  getInitialValueAndAdapter<K extends keyof Values>(
    element: ElementType,
    key: K,
    initial?: any
  ): [Values[K], Adapter<ElementType> | undefined]
}

export type ConfigValue = {
  immediate?: boolean
  easing?: Algorithm
}

export type ElementRef<ElementType> = { current: ElementType }
export type Config = ConfigValue | ((key: string) => ConfigValue)
export type ConfigWithEl<ElementType> = Config & { el: ElementType | ElementRef<ElementType> }
export type ConfigWithOptionalEl<ElementType> = Config & { el?: ElementType }

export type ApiType<Values> = {
  get: (key: keyof Values) => any
  start: (
    to: Partial<Values>,
    config?: {
      immediate?: boolean | undefined
      easing?: Algorithm | undefined
    }
  ) => Promise<unknown>
  stop: () => void
  clean: () => void
}
