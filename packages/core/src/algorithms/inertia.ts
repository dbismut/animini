import type { AnimatedValue } from '../animated/AnimatedValue'
import { Algorithm } from '../types'
import { spring } from './spring'

type InertiaConfig = { momentum?: number; min?: number; max?: number }

export function inertia({ momentum = 0.998, min = -Infinity, max = Infinity }: InertiaConfig = {}): Algorithm {
  const springEase = spring()

  return {
    update(a: AnimatedValue) {
      let value: number
      if (!a.startVelocity) value = a.value
      else {
        const e = Math.exp(-(1 - momentum) * a.time.elapsed)
        value = a.from + (a.startVelocity / (1 - momentum)) * (1 - e)
      }

      if (value < min || value > max) {
        a.start(value < min ? min : max, { immediate: false, easing: springEase })
      }
      return value
    }
  }
}
