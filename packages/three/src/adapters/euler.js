import { Vector3 } from 'three'

function parseInitial(euler) {
  const v = new Vector3()
  return v.setFromEuler(euler)
}

function onUpdate(element, key) {
  element[key].setFromVector3(this.value)
}

export const euler = { parseInitial, onUpdate }
