import { useRef, useCallback, useEffect, useMemo } from 'react'
import { Animated } from './animated/Animated'
import { Motion } from './animated/Motion'
import { GlobalLoop } from './FrameLoop'

export function useAniminiCore(target, elementPayload, fn) {
  const loop = target.loop || GlobalLoop

  const el = useRef(null)
  const rawValues = useRef({})
  const animations = useMemo(() => new Map(), [])
  const motions = useMemo(() => new Map(), [])

  const update = useCallback(() => {
    if (!el.current) return

    let idle = true
    motions.forEach((motion) => {
      motion.update()
    })
    animations.forEach((animated, key) => {
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
          const animated = new Animated(value, adapter)
          animations.set(key, animated)
        }
        const animated = animations.get(key)
        animated.to = to[key]

        const _config = typeof config === 'function' ? config(key) : config
        const configKey = JSON.stringify(_config)
        if (!motions.has(configKey)) {
          motions.set(configKey, new Motion(fn, _config, loop))
        }
        const motion = motions.get(configKey)
        motion.attach(animated)
        motion.start()
        idle &= animated.idle
      }
      loop.start(update)
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
