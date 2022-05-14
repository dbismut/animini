import { AnimatedValue } from './animated/AnimatedValue'
import { Animated } from './animated/Animated'
import { FrameLoop } from './FrameLoop'

export type ParsedValue = number | number[] | Record<string, number>

export type Adapter = {
  parse(value: any): ParsedValue
  parseInitial(value: any): ParsedValue
  format(value: ParsedValue): any
  onUpdate(target: any, key: string | number): void
}

export type Algorithm = {
  update(this: AnimatedValue): number
  memo?(): any
  setup?(this: Animated): void
}

export type Payload = Record<string, any>

export type Target = {
  loop?: FrameLoop
  setValues?(rawValues: Payload, element: any, payload: Payload): void
  getInitialValueAndAdapter(element: any, key: string, payload: Payload): [any, Adapter]
}
