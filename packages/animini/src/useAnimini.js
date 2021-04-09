import { useRef, useCallback, useEffect, useMemo } from 'react'
import { AnimatedValue } from './AnimatedValue'
import { raf } from './raf'
import { getStyleValue, setStyle } from './style'
import { lerp } from './lerp'

export function useAnimini(fn = lerp) {
  const el = useRef(null)
  const rawStyle = useRef({})
  const computedStyle = useRef(null)

  const animations = useMemo(() => new Map(), [])

  const get = useCallback(() => rawStyle.current, [])

  const rafId = useRef()

  useEffect(() => {
    animations.forEach((animated) => animated.setFn(fn))
  }, [fn, animations])

  const update = useCallback(() => {
    if (!el.current) return

    let idle = 1
    animations.forEach((animated, key) => {
      animated.update()
      rawStyle.current[key] = animated.value
      idle &= animated.idle
    })
    setStyle(rawStyle.current, el.current)
    if (idle) raf.stop(update)
  }, [animations])

  const start = useCallback(
    (to, config) => {
      let idle = 1
      for (let key in to) {
        if (!animations.has(key)) {
          const initialValue = getStyleValue(computedStyle.current, key)
          const animated = new AnimatedValue(initialValue, fn)
          animations.set(key, animated)
        }
        const animated = animations.get(key)
        animated.start(to[key], typeof config === 'function' ? config(key) : config)
        idle &= animated.idle
      }
      if (!idle) rafId.current = raf.start(update)
    },
    [update, fn, animations]
  )

  useEffect(() => {
    computedStyle.current = window.getComputedStyle(el.current)
    return () => raf.stop(update)
  }, [])

  return [el, { get, start }]
}
