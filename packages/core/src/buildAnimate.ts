import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'
import { Config, Payload, Target } from './types'

// TODO interpolator (medium)
// TODO chaining ? (hard)
// TODO from ? (easy)
// TODO staggering (hard)
// TODO extend target (easy)

export function buildAnimate<ElementType, ValueType extends Payload>(target: Target<ElementType, ValueType>) {
  return function animate(element: ElementType | { current: ElementType }, masterConfig?: Config) {
    const loop = target.loop || GlobalLoop
    const el = typeof element === 'object' && 'current' in element ? element : { current: element }
    const currentValues: any = {}
    const animations = new Map<keyof ValueType, Animated<ElementType>>()
    let resolveRef: (value?: unknown) => void
    let rejectRef: (value?: unknown) => void

    const update = () => {
      if (!el.current) return

      let idle = true
      animations.forEach((animated, key) => {
        animated.update()
        currentValues[key] = animated.value
        idle &&= animated.idle
      })
      target.setValues?.(currentValues, el.current)
      if (idle) {
        loop.stop(update)
        resolveRef()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    const start = (to: Partial<ValueType>, config = masterConfig) => {
      return new Promise((resolve, reject) => {
        resolveRef = resolve
        rejectRef = reject
        let idle = true
        for (let key in to) {
          let animated = animations.get(key)

          if (!animated) {
            const [value, adapter] = target.getInitialValueAndAdapter(el.current, key)
            animated = new Animated({ value, adapter, key, el: el.current }, loop)
            animations.set(key, animated)
          }
          animated.start(to[key], typeof config === 'function' ? config(key) : config)
          idle &&= animated.idle
        }
        if (!idle) loop.start(update)
        // if animation is already idle resolve promise right away
        else resolveRef()
      })
    }

    const stop = () => {
      loop.stop(update)
      rejectRef()
    }

    const clean = () => {
      loop.stop(update)
      resolveRef?.()
    }

    const get = (key: keyof ValueType) => currentValues[key]

    const api = { get, start, stop, clean }
    return api
  }
}
