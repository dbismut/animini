import { Color } from 'three'
import { color } from '../core/src/adapters'

const ADAPTERS = new Map([[Color, color]])

export function getInitialValue(element, key) {
  return element[key]
}

function setColor(color, value) {
  color.r = value[0]
  color.g = value[1]
  color.b = value[2]
}

export function setValues(rawValues, el) {
  for (let key in rawValues) {
    const value = rawValues[key]
    const elementValue = el[key]
    for (let valueKey in value) {
      elementValue[valueKey] = value[valueKey]
    }
  }
}

export function parseValue(value, key, el) {
  // const constructor = el[key].__proto__.constructor
  // const adapter = ADAPTERS.get(constructor)
  // if (adapter) return adapter.parse(value[key])
  return value[key]
}
