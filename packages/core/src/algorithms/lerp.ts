import { lerp as lerpFn } from '../utils'
import type { AnimatedValue } from '../animated/AnimatedValue'
import { Algorithm } from '../types'

type LerpConfig = { factor?: number }

export function lerp({ factor = 0.05 }: LerpConfig = {}): Algorithm {
  return {
    update(a: AnimatedValue) {
      return lerpFn(a.value, a.to, factor)
    }
  }
}
