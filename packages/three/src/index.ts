import { buildAnimate, ConfigWithEl } from '@animini/core'
import { three, ThreeElementType, ThreeValues } from '@animini/target-three'
export * from '@animini/core/algorithms'

const animateThree = buildAnimate(three)

export function animate<AnimateElementType extends ThreeElementType>(
  masterConfigWithEl: ConfigWithEl<AnimateElementType>,
  globalTo?: Partial<ThreeValues<AnimateElementType>>
) {
  return animateThree(masterConfigWithEl, globalTo)
}
