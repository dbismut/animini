import { interpolate, Animated, parseNumbers } from '@animini/core'
import { DomAdapter } from '../types'
import { getSidesValues, SIDES_KEYS } from '../utils'

interface AnimatedWithInterpolator extends Animated<HTMLElement> {
  i: ReturnType<typeof interpolate>
}

export const string: DomAdapter = {
  onInit(a: AnimatedWithInterpolator) {
    a.i = interpolate(a.value)
  },
  parse(value, a) {
    if (SIDES_KEYS.includes(a.key!)) {
      value = getSidesValues(value)
    }
    return parseNumbers(value)!
  },
  parseInitial(_value, a: AnimatedWithInterpolator) {
    return a.i.values
  },
  format(value, a: AnimatedWithInterpolator) {
    return a.i.compute(value)
  }
}
