import { useRef, useCallback, useEffect, useMemo } from 'react'
import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'

export function useAniminiCore(motion = 'lerp', target, elementPayload) {
  const loop = target.loop || GlobalLoop

  const el = useRef(null)
  const rawValues = useRef({})
  const animations = useMemo(() => new Map(), [])

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
    (to, config = {}) => {
      let idle = true
      for (let key in to) {
        if (!animations.has(key)) {
          const [value, adapter] = target.getInitialValueAndAdapter(el.current, key, elementPayload)
          const animated = new Animated(value, adapter, loop)
          animations.set(key, animated)
        }

        const animated = animations.get(key)
        const _config = typeof config === 'function' ? config(key) : { ...config }
        if (!_config.motion) _config.motion = motion
        animated.start(to[key], _config)
        idle &= animated.idle
      }
      loop.start(update)
      if (!idle) loop.start(update)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [motion, update, animations]
  )

  useEffect(() => {
    return () => loop.stop(update)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update])

  const get = useCallback(() => rawValues.current, [])
  return [el, { get, start }]
}
