import { invalidate, addEffect } from '@react-three/fiber'
import { FrameLoop } from '@animini/core'
import { Color, Euler } from 'three'
import { color, euler } from './adapters'

const ADAPTERS = new Map([
  [Color, color],
  [Euler, euler],
])

export function getInitialValue(element, key) {
  return element[key]
}

export function getInitialValueAndAdapter(element, key) {
  const value = element[key]
  const constructor = value.__proto__.constructor
  const adapter = ADAPTERS.get(constructor)
  return [value, adapter]
}

export const loop = new FrameLoop()
loop.tick = () => invalidate()

if (addEffect) {
  addEffect(() => {
    loop.update()
  })
}
