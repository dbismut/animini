import { useRef, useCallback, useEffect, useMemo } from 'react'
import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'
import { Config, Payload, Target } from './types'

export function useAniminiCore<ElementType, ValueType extends Payload>(
  target: Target<ElementType, ValueType>,
  initialStyle: any,
  masterConfig?: Config
) {
  const loop = target.loop || GlobalLoop

  const el = useRef<ElementType>(null)
  const rawValues = useRef<ValueType>({} as any)
  const animations = useMemo(() => new Map<keyof ValueType, Animated>(), [])
  const resolveRef = useRef<(value?: unknown) => void>()
  const rejectRef = useRef<(value?: unknown) => void>()
  const configRef = useRef(masterConfig)
  configRef.current = masterConfig

  const update = useCallback(() => {
    if (!el.current) return

    let idle = true
    animations.forEach((animated, key) => {
      animated.update()
      rawValues.current[key] = animated.value
      animated.onUpdate?.(el.current, key as string)
      idle &&= animated.idle
    })
    target.setValues?.(rawValues.current, el.current, initialStyle)
    if (idle) {
      loop.stop(update)
      resolveRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animations])

  const start = useCallback(
    (to: Partial<ValueType>, config = configRef.current) => {
      return new Promise((resolve, reject) => {
        resolveRef.current = resolve
        rejectRef.current = reject
        let idle = true
        for (let key in to) {
          if (!animations.has(key)) {
            const [value, adapter] = target.getInitialValueAndAdapter(el.current!, key, initialStyle)
            const animated = new Animated(value, adapter, loop)
            animations.set(key, animated)
          }
          const animated = animations.get(key)!
          animated.start(to[key], typeof config === 'function' ? config(key) : config)
          idle &&= animated.idle
        }
        if (!idle) loop.start(update)
        // if animation is already idle resolve promise right away
        else resolveRef.current()
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [update, animations]
  )

  const stop = useCallback(
    () => {
      loop.stop(update)
      rejectRef.current?.()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [update]
  )

  useEffect(() => {
    return () => {
      loop.stop(update)
      resolveRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update])

  const get = useCallback((key: keyof ValueType) => rawValues.current[key], [])
  const api = { get, start, stop }
  return [el, api] as [typeof el, typeof api]
}
