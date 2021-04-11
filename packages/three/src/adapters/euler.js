function parseInitial(euler) {
  return euler.toVector3()
}

function onUpdate(element, key) {
  element[key].setFromVector3(this.value)
}

export const euler = { parseInitial, onUpdate }
