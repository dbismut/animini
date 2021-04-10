import { useRef, useCallback, useEffect, useMemo } from 'react'
import { Animated } from './Animated'
import { raf } from './raf'
import { getInitialValue, parseValue, setStyle } from './style'

export function useAnimini(fn) {
  const el = useRef(null)
  const rawValues = useRef({})
  const computedStyle = useRef(null)

  const animations = useMemo(() => new Map(), [])

  const get = useCallback(() => rawValues.current, [])

  const rafId = useRef()

  useEffect(() => {
    animations.forEach((animated) => animated.setFn(fn))
  }, [fn, animations])

  const update = useCallback(() => {
    if (!el.current) return

    let idle = true
    animations.forEach((animated, key) => {
      animated.update()
      rawValues.current[key] = animated.value
      idle &= animated.idle
    })
    setStyle(rawValues.current, el.current)
    if (idle) raf.stop(update)
  }, [animations])

  const start = useCallback(
    (to, config) => {
      let idle = 1
      for (let key in to) {
        if (!animations.has(key)) {
          const initialValue = getInitialValue(computedStyle.current, key)
          const animated = new Animated(initialValue, fn)
          animations.set(key, animated)
        }
        const animated = animations.get(key)
        animated.start(parseValue(to, key), typeof config === 'function' ? config(key) : config)
        idle &= animated.idle
      }
      if (!idle) rafId.current = raf.start(update)
    },
    [update, fn, animations]
  )

  useEffect(() => {
    computedStyle.current = window.getComputedStyle(el.current)
    return () => raf.stop(update)
  }, [update])

  return [el, { get, start }]
}
