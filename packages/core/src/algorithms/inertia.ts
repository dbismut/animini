import type { AnimatedValue } from '../animated/AnimatedValue'
import { Algorithm } from '../types'
import { rubberbandIfOutOfBounds } from '../utils/math'
import { spring } from './spring'

type InertiaConfig = { momentum?: number; min?: number; max?: number; rubberband?: number; velocity?: number }

export function inertia({
  momentum = 0.998,
  velocity,
  min = -Infinity,
  max = Infinity,
  rubberband = 0.15
}: InertiaConfig = {}): Algorithm {
  const springEase = spring()

  return {
    wanders: true,
    update(a: AnimatedValue) {
      const v0 = velocity ?? a.startVelocity

      if (!v0) return a.value

      if (a.value < min || a.value > max) {
        a.start(a.value < min ? min : max, { immediate: false, easing: springEase })
        return a.update()
      }

      const e = Math.exp(-(1 - momentum) * a.time.elapsed)
      const value = a.from + (v0 / (1 - momentum)) * (1 - e)

      return rubberbandIfOutOfBounds(value, min, max, rubberband)
    }
  }
}
