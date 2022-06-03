import { useRef, useEffect } from 'react'
import { Config } from '@animini/core'
import { buildReactHook } from '@animini/core-react'
import { dom } from '@animini/target-dom'

export const useAniminiDom = buildReactHook(dom)

export function useAnimini<Element extends HTMLElement = HTMLElement>(masterConfig?: Config) {
  const currentValues = useRef<CSSStyleDeclaration>()
  const [el, api] = useAniminiDom<Element>(currentValues, masterConfig)

  useEffect(() => {
    currentValues.current = window.getComputedStyle(el.current!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [el, api] as [typeof el, typeof api]
}
