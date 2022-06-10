import { Euler, Vector3 } from 'three'
import { ThreeAdapter } from '../types'

export const euler: ThreeAdapter = {
  parseInitial(euler: Euler) {
    const v = new Vector3()
    return v.setFromEuler(euler) as any as Record<string, number>
  },
  onUpdate(animated) {
    // @ts-ignore
    animated.el[animated.key].setFromVector3(animated.value)
  }
}
