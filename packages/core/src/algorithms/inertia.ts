import type { AnimatedValue } from '../animated/AnimatedValue'
import { Algorithm } from '../types'
import { rubberbandIfOutOfBounds } from '../utils/math'
import { spring } from './spring'

type InertiaConfig = { momentum?: number; min?: number; max?: number; rubberband?: number }

export function inertia({
  momentum = 0.998,
  min = -Infinity,
  max = Infinity,
  rubberband = 0.15
}: InertiaConfig = {}): Algorithm {
  const springEase = spring()

  return {
    update(a: AnimatedValue) {
      if (!a.startVelocity) return a.value

      if (a.value < min || a.value > max) {
        a.start(a.value < min ? min : max, { immediate: false, easing: springEase })
        return a.update()
      }

      const e = Math.exp(-(1 - momentum) * a.time.elapsed)
      const value = a.from + (a.startVelocity / (1 - momentum)) * (1 - e)

      return rubberbandIfOutOfBounds(value, min, max, rubberband)
    }
  }
}
