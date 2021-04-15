import { useRef, useCallback, useEffect, useMemo } from 'react'
import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'

export function useAniminiCore(target, elementPayload, fn) {
  const loop = target.loop || GlobalLoop

  const el = useRef(null)
  const rawValues = useRef({})
  const animations = useMemo(() => new Map(), [])

  useEffect(() => {
    animations.forEach((animated) => animated.setFn(fn))
  }, [fn, animations])

  const update = useCallback(() => {
    if (!el.current) return

    let idle = true
    animations.forEach((animated, key) => {
      animated.update()
      rawValues.current[key] = animated.value
      animated.onUpdate?.(el.current, key)
      idle &= animated.idle
    })
    target.setValues?.(rawValues.current, el.current, elementPayload)
    if (idle) loop.stop(update)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animations])

  const start = useCallback(
    (to, config) => {
      let idle = true
      for (let key in to) {
        if (!animations.has(key)) {
          const [value, adapter] = target.getInitialValueAndAdapter(el.current, key, elementPayload)
          const animated = new Animated(value, fn, adapter, loop)
          animations.set(key, animated)
        }
        const animated = animations.get(key)
        animated.start(to[key], typeof config === 'function' ? config(key) : config)
        idle &= animated.idle
      }
      if (!idle) loop.start(update)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [update, fn, animations]
  )

  useEffect(() => {
    return () => loop.stop(update)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update])

  const get = useCallback(() => rawValues.current, [])
  return [el, { get, start }]
}
