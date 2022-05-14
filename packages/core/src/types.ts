import { AnimatedValue } from './animated/AnimatedValue'
import { FrameLoop } from './FrameLoop'

export type ParsedValue = number | number[] | Record<string, number>

export type Adapter = {
  parse(value: any): ParsedValue
  parseInitial(value: any): ParsedValue
  format(value: ParsedValue): any
  onUpdate(target: any, key: string | number): void
}

export type Algorithm = (a: AnimatedValue) => number

export type Payload = Record<string, any>

export type Target = {
  loop?: FrameLoop
  setValues?(rawValues: Payload, element: any, payload: Payload): void
  getInitialValueAndAdapter(element: any, key: string, payload: Payload): [any, Adapter]
}

export type ConfigValue = {
  immediate?: boolean
  easing?: Algorithm
}

export type Config = ConfigValue | ((key: string) => ConfigValue)
