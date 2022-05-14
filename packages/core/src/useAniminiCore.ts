import { useRef, useCallback, useEffect, useMemo } from 'react'
import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'
import { Algorithm, Payload, Target } from './types'

// TODO move algo inside config

export function useAniminiCore(target: Target, elementPayload: Payload, algo: Algorithm) {
  const loop = target.loop || GlobalLoop

  const el = useRef(null)
  const rawValues = useRef<Payload>({})
  const animations = useMemo(() => new Map<string, Animated>(), [])
  const resolveRef = useRef<(value?: unknown) => void>()

  useEffect(() => {
    animations.forEach((animated) => animated.setAlgo(algo))
  }, [algo, animations])

  const update = useCallback(() => {
    if (!el.current) return

    let idle = true
    animations.forEach((animated, key) => {
      animated.update()
      rawValues.current[key] = animated.value
      animated.onUpdate?.(el.current, key)
      idle &&= animated.idle
    })
    target.setValues?.(rawValues.current, el.current, elementPayload)
    if (idle) {
      loop.stop(update)
      resolveRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animations])

  const start = useCallback(
    (to, config) =>
      new Promise((resolve) => {
        resolveRef.current = resolve
        let idle = true
        for (let key in to) {
          if (!animations.has(key)) {
            const [value, adapter] = target.getInitialValueAndAdapter(el.current, key, elementPayload)
            const animated = new Animated(value, algo, adapter, loop)
            animations.set(key, animated)
          }
          const animated = animations.get(key)!
          animated.start(to[key], typeof config === 'function' ? config(key) : config)
          idle &&= animated.idle
        }
        if (!idle) loop.start(update)
        // if animation is already idle resolve promise right away
        else resolveRef.current()
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [update, algo, animations]
  )

  const stop = useCallback(
    () => {
      loop.stop(update)
      resolveRef.current?.()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [update]
  )

  useEffect(() => {
    return stop
  }, [stop])

  const get = useCallback((key: string) => rawValues.current[key], [])
  return [el, { get, start, stop }]
}
