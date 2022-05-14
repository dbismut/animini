import { lerp as lerpFn } from '../utils'
import type { AnimatedValue } from '../animated/AnimatedValue'
import { Algorithm } from '../types'

// TODO ADD EASING

type LerpConfig = { factor?: number }

export function lerp({ factor = 0.05 }: LerpConfig = {}): Algorithm {
  return function update(a: AnimatedValue) {
    return lerpFn(a.value, a.target, factor)
  }
}
