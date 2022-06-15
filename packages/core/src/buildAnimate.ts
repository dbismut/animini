import { Animated } from './animated/Animated'
import { GlobalLoop } from './FrameLoop'
import { Config, ConfigWithEl, Payload, Target } from './types'

// TODO chaining (hard)
// TODO from (easy)
// TODO staggering (hard)
// TODO extend target (easy)
// TODO scroll (medium)

type AnimationMap<ElementType, Values> = Map<keyof Values, Animated<ElementType>>
const elementAnimationsMap = new Map<any, any>()

type ElementOrElementRef<ElementType> = ElementType | { current: ElementType }

type ToOrConfigWithEl<ElementType, Values> = Partial<Values> | ConfigWithEl<ElementType>

export function buildAnimate<ElementType, Values extends Payload>(target: Target<ElementType, Values>) {
  return function animate(
    masterConfigWithElOrTo: ToOrConfigWithEl<ElementType, Values>,
    masterConfigWithEl?: ConfigWithEl<ElementType>
  ) {
    const loop = target.loop || GlobalLoop
    let resolveRef: (value?: unknown) => void
    let rejectRef: (value?: unknown) => void

    let element: ElementOrElementRef<ElementType>
    let globalTo: Partial<Values> | undefined
    let masterConfig: Config

    if (masterConfigWithEl) {
      const { el, ...rest } = masterConfigWithEl
      element = el
      masterConfig = rest
      globalTo = masterConfigWithElOrTo as any
    } else {
      const { el, ...rest } = masterConfigWithElOrTo
      element = el!
      masterConfig = rest
    }

    const tElement = target.getElement?.(element) || element
    let el = typeof tElement === 'object' && 'current' in tElement ? tElement : { current: tElement }

    let animations: AnimationMap<ElementType, Values> = elementAnimationsMap.get(element)
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

    // TODO discuss this 👇
    // when `to` is passed to the function then promise-based functionality
    // wouldn't work.
    if (globalTo) start(globalTo)

    const api = { get, start, stop, clean }
    return api
  }
}
