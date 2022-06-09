import { interpolate, Animated } from '@animini/core'
import { DomAdapter } from '../types'

interface AnimatedWithInterpolator extends Animated<HTMLElement> {
  i: any
}

export const string: DomAdapter = {
  setup(a: AnimatedWithInterpolator) {
    a.i = interpolate(a.value, a.to)
    console.log(a.i(0.5))
  },
  format(c: number[]) {
    return 'hello'
  }
}
