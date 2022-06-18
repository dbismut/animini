import { ConfigWithOptionalEl } from '@animini/core'
import { buildReactHook } from '@animini/core-react'
import { dom } from '@animini/target-dom'

export const useAniminiDom = buildReactHook(dom)

export function useAnimate<
  Element extends HTMLElement | Window,
  C extends ConfigWithOptionalEl<Element> = ConfigWithOptionalEl<Element>
>(masterConfig?: C) {
  return useAniminiDom<Element, C>(masterConfig)
}
