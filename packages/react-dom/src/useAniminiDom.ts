import { Config } from '@animini/core'
import { buildReactHook } from '@animini/core-react'
import { dom } from '@animini/target-dom'

export const useAniminiDom = buildReactHook(dom)

export function useAnimini<Element extends HTMLElement = HTMLElement>(masterConfig?: Config) {
  return useAniminiDom<Element>(masterConfig)
}
