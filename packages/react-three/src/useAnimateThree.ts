import { useEffect } from 'react'
import { ConfigWithOptionalEl, GlobalLoop } from '@animini/core'
import { buildReactHook } from '@animini/core-react'
import { three, ElementType } from '@animini/target-three'
import { addEffect } from '@react-three/fiber'

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

export const useAnimateThree = buildReactHook(three)

export function useAnimate<
  Element extends ElementType,
  C extends ConfigWithOptionalEl<Element> = ConfigWithOptionalEl<Element>
>(masterConfig?: C) {
  useEffect(() => {
    return setGlobalLoopOnDemand()
  }, [])

  return useAnimateThree<Element, C>(masterConfig)
}
