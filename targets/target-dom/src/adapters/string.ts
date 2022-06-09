import { interpolate, Animated, parseNumbers } from '@animini/core'
import { DomAdapter } from '../types'

interface AnimatedWithInterpolator extends Animated<HTMLElement> {
  i: ReturnType<typeof interpolate>
}

export const string: DomAdapter = {
  setup(a: AnimatedWithInterpolator) {
    a.i = interpolate(a.value)
  },
  parse(value) {
    return parseNumbers(value)!
  },
  parseInitial(_value, a: AnimatedWithInterpolator) {
    return a.i.values
  },
  format(value, a: AnimatedWithInterpolator) {
    return a.i.compute(value)
  }
}
