import { Color } from 'three'
import { color } from './adapters'

const ADAPTERS = new Map([[Color, color]])

export function getInitialValue(element, key) {
  return element[key]
}

export function getInitialValueAndAdapter(element, key) {
  const value = element[key]
  const constructor = value.__proto__.constructor
  const adapter = ADAPTERS.get(constructor)
  return [value, adapter]
}
