import { lerp as lerpFn } from '../utils'

export const lerp = {
  update() {
    return lerpFn(this.value, this.target, this.config.factor || 0.05)
  },
}
