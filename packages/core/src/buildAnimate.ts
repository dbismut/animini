import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'
import { Adapter, Config, ParsedValue, Payload, Target } from './types'

type Animation<ElementType, ValueType extends Payload> = {
  animated: Animated
  adapter?: Adapter<ElementType, ValueType>
}

// TODO interpolator
// TODO chaining ?
// TODO from ?
// TODO staggering

export function buildAnimate<ElementType, ValueType extends Payload>(target: Target<ElementType, ValueType>) {
  return function animate(element: ElementType | { current: ElementType }, currentValues: any, masterConfig?: Config) {
    const loop = target.loop || GlobalLoop
    const el = typeof element === 'object' && 'current' in element ? element : { current: element }
    const values: any = {}
    const animations = new Map<keyof ValueType, Animation<ElementType, ValueType>>()
    let resolveRef: (value?: unknown) => void
    let rejectRef: (value?: unknown) => void

    const update = () => {
      if (!el.current) return

      let idle = true
      animations.forEach(({ animated, adapter }, key) => {
        animated.update()

        const value = adapter?.format ? adapter.format(animated.value) : animated.value
        values[key] = value
        adapter?.onChange?.(value, key, el.current, currentValues)
        idle &&= animated.idle
      })
      target.setValues?.(values, el.current, currentValues)
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
          const animation = animations.get(key)
          let animated: Animated
          let adapter: Adapter<ElementType, ValueType> | undefined

          if (!animation) {
            const [_value, _adapter] = target.getInitialValueAndAdapter(el.current, key, currentValues)
            const value = _adapter?.parseInitial
              ? _adapter?.parseInitial(_value, key, el.current, currentValues)
              : _value
            animated = new Animated(value, loop)
            adapter = _adapter
            animations.set(key, { animated, adapter })
          } else {
            animated = animation.animated
            adapter = animation.adapter
          }

          const _to = adapter?.parse ? adapter.parse(to[key], key, el.current, currentValues) : (to[key] as ParsedValue)
          animated.start(_to, typeof config === 'function' ? config(key) : config)
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

    const get = (key: keyof ValueType) => values[key]
    const api = { get, start, stop, clean }
    return api
  }
}
