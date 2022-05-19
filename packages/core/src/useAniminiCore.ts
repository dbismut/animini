import { useRef, useCallback, useEffect, useMemo } from 'react'
import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'
import { Adapter, Config, Payload, Target } from './types'

type Animation = {
  animated: Animated
  adapter?: Adapter
}

export function useAniminiCore<ElementType, ValueType extends Payload>(
  target: Target<ElementType, ValueType>,
  initialStyle: any,
  masterConfig?: Config
) {
  const loop = target.loop || GlobalLoop

  const el = useRef<ElementType>(null)
  const rawValues = useRef<ValueType>({} as any)
  const animations = useMemo(() => new Map<keyof ValueType, Animation>(), [])
  const resolveRef = useRef<(value?: unknown) => void>()
  const rejectRef = useRef<(value?: unknown) => void>()
  const configRef = useRef(masterConfig)
  configRef.current = masterConfig

  const update = useCallback(() => {
    if (!el.current) return

    let idle = true
    animations.forEach(({ animated, adapter }, key) => {
      animated.update()

      const value = adapter?.format ? adapter.format(animated.value) : animated.value
      rawValues.current[key] = value
      adapter?.onUpdate?.(el.current, key as string, value)
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
          const animation = animations.get(key)
          let animated: Animated
          let adapter: Adapter | undefined

          if (!animation) {
            const [_value, _adapter] = target.getInitialValueAndAdapter(el.current!, key, initialStyle)
            const value = _adapter?.parseInitial ? _adapter?.parseInitial(_value) : _value
            animated = new Animated(value, loop)
            adapter = _adapter
            animations.set(key, { animated, adapter })
          } else {
            animated = animation.animated
            adapter = animation.adapter
          }

          const _to = adapter?.parse ? adapter.parse(to[key]) : to[key]

          animated.start(_to, typeof config === 'function' ? config(key) : config)
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
