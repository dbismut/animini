import { useEffect } from 'react'
import { Config, GlobalLoop } from '@animini/core'
import { buildReactHook } from '@animini/core-react'
import { three, ElementType } from '@animini/target-three'
import { addEffect } from '@react-three/fiber'
import type { Object3D } from 'three'

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

export const useAniminiThree = buildReactHook(three)

export function useAnimini<Element extends ElementType = Object3D>(masterConfig?: Config) {
  useEffect(() => {
    return setGlobalLoopOnDemand()
  }, [])

  return useAniminiThree<Element>(undefined, masterConfig)
}
