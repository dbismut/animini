import { useAniminiCore, Config } from '@animini/core'
import { Object3D } from 'three'
import target from './three'
import { ElementType, Values } from './types'

export function useAnimini<Element extends ElementType = Object3D>(masterConfig?: Config) {
  return useAniminiCore<Element, Values<Element>>(target, undefined, masterConfig)
}
