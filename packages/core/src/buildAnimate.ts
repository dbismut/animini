import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'
import { Config, Payload, Target } from './types'

// TODO chaining (hard)
// TODO from (easy)
// TODO staggering (hard)
// TODO extend target (easy)
// TODO scroll (medium)

type AnimationMap<Values, ElementType> = Map<keyof Values, Animated<ElementType>>
const elementAnimationsMap = new Map<any, any>()

type ElementOrElementRef<ElementType> = ElementType | { current: ElementType }
type ElementOrTo<ElementType, Values> = Partial<Values> & { el: ElementOrElementRef<ElementType> }

export function buildAnimate<ElementType, Values extends Payload>(target: Target<ElementType, Values>) {
  return function animate(elementOrTo: ElementOrTo<ElementType, Values>, masterConfig?: Config) {
    const loop = target.loop || GlobalLoop
    let resolveRef: (value?: unknown) => void
    let rejectRef: (value?: unknown) => void

    let element: ElementOrElementRef<ElementType>
    let globalTo: Partial<Values> | undefined

    if ('el' in elementOrTo) {
      const { el, ...rest } = elementOrTo
      element = el
      globalTo = rest as any
    } else {
      element = elementOrTo
    }

    const el = typeof element === 'object' && 'current' in element ? element : { current: element }

    let animations: AnimationMap<Values, ElementType> = elementAnimationsMap.get(element)
    if (!animations) {
      animations = new Map()
      elementAnimationsMap.set(element, animations)
    }

    const update = () => {
      const currentValues: any = {}
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

    const start = (to: Partial<Values>, config = masterConfig) => {
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
      elementAnimationsMap.delete(element)
    }

    const get = (key: keyof Values) => animations.get(key)?.value

    const api = { get, start, stop, clean }
    if (globalTo) {
      start(globalTo)
    }
    return api
  }
}
