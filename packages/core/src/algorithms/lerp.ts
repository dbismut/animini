import { Algorithm } from '../types'
import { lerp as lerpFn } from '../utils'

// TODO ADD EASING

export const lerp: Algorithm = {
  update(this) {
    return lerpFn(this.value, this.target, this.config.factor || 0.05)
  }
}
