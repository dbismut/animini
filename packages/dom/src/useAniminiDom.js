import { useRef, useEffect } from 'react'
import { useAniminiCore } from '@animini/core'
import * as target from './dom'

export function useAnimini(motion) {
  const computedStyle = useRef(null)
  const [el, api] = useAniminiCore(motion, target, computedStyle)

  useEffect(() => {
    computedStyle.current = window.getComputedStyle(el.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [el, api]
}
