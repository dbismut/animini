import { Adapter } from '@animini/core'
import { Euler, Vector3 } from 'three'

export const euler: Adapter = {
  parseInitial(euler: Euler) {
    const v = new Vector3()
    return v.setFromEuler(euler) as any as Record<string, number>
  },
  onUpdate(element, key) {
    element[key].setFromVector3(this.value)
  }
}
