import type { AnimatedValue } from '../animated/AnimatedValue'
import { Algorithm } from '../types'

type InertiaConfig = { momentum?: number }

export function inertia({ momentum = 0.998 }: InertiaConfig = {}): Algorithm {
  return {
    update(a: AnimatedValue) {
      if (!a.startVelocity) return a.value
      const e = Math.exp(-(1 - momentum) * a.time.elapsed)
      return a.from + (a.startVelocity / (1 - momentum)) * (1 - e)
    }
  }
}
