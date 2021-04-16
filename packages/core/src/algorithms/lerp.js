import { lerp as lerpFn } from '../utils'

export const lerp = {
  defaultConfig: { factor: 0.05 },
  solver() {
    const value = lerpFn(this.progress, 1, this.config.factor ?? 0.05)
    return [value, () => value]
  },
}
