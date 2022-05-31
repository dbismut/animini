import { useAniminiCore, Config, GlobalLoop } from '@animini/core'
import { addEffect } from '@react-three/fiber'
import type { Object3D } from 'three'
import target from './three'
import { ElementType, Values } from './types'
import { useEffect } from 'react'

let count = 0

function setGlobalLoopOnDemand() {
  let unsub: () => void | undefined
  if (count++ === 0) {
    GlobalLoop.onDemand = true
    unsub = addEffect(() => {
      GlobalLoop.update()
    })
  }
  return () => {
    if (--count === 0) {
      GlobalLoop.onDemand = false
      unsub?.()
    }
  }
}

export function useAnimini<Element extends ElementType = Object3D>(masterConfig?: Config) {
  useEffect(() => {
    return setGlobalLoopOnDemand()
  }, [])
  return useAniminiCore<Element, Values<Element>>(target, undefined, masterConfig)
}
