import { useRef, useEffect } from 'react'
import { Config, useAniminiCore } from '@animini/core'
import target from './dom'
import { Styles } from './types'

export function useAnimini<Element extends HTMLElement = HTMLElement>(masterConfig?: Config) {
  const initialStyle = useRef<CSSStyleDeclaration>()
  const [el, api] = useAniminiCore<Element, Styles>(target, initialStyle, masterConfig)

  useEffect(() => {
    initialStyle.current = window.getComputedStyle(el.current!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [el, api] as [typeof el, typeof api]
}
