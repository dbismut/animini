import { Euler, Vector3 } from 'three'
import { ThreeAdapter } from '../types'

export const euler: ThreeAdapter = {
  parseInitial(euler: Euler) {
    const v = new Vector3()
    return v.setFromEuler(euler) as any as Record<string, number>
  },
  onChange(value, key, element) {
    // @ts-ignore
    element![key].setFromVector3(value)
  }
}
