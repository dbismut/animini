import { Target } from '@animini/core'
import { Color, Euler } from 'three'
import { color, euler } from './adapters'
import { ElementType, ThreeAdapter, Values } from './types'

const ADAPTERS = new Map<any, ThreeAdapter>([
  [Color, color],
  [Euler, euler]
])

export const three: Target<ElementType, Values<ElementType>> = {
  getInitialValueAndAdapter(element, key) {
    const value = element[key]
    const constructor = value.__proto__.constructor
    const adapter = ADAPTERS.get(constructor)
    return [value, adapter]
  }
}
