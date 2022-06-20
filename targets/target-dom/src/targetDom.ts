import { color, generic, transform, string, rotate } from './adapters'
import { DomAdapter, Styles, Transform } from './types'
import { Target } from '@animini/core'
import {
  getSidesValues,
  getTransformStyle,
  getTransformValues,
  SCROLL_KEYS,
  SIDES_KEYS,
  someDefined,
  TRANSFORM_KEYS
} from './utils'

const ADAPTERS: Partial<Record<keyof Styles, DomAdapter>> = {
  color,
  backgroundColor: color,
  borderColor: color,
  borderTopColor: color,
  borderLeftColor: color,
  borderBottomColor: color,
  borderRightColor: color,
  fill: color,
  stroke: color,
  textDecorationColor: color,
  x: transform,
  y: transform,
  rotate,
  clipPath: string,
  boxShadow: string,
  padding: string,
  margin: string,
  inset: string,
  opacity: undefined,
  scale: undefined
}

const IDENTITY = 'matrix(1, 0, 0, 1, 0, 0)'

export const dom: Target<HTMLElement | Window, Styles> = {
  getElement(element) {
    if (typeof element !== string) return element
    return document.querySelector(element)
  },
  setValues(values, el, initial, idle) {
    const _el = el as HTMLElement

    const { x, y, zIndex, scale, scaleX, scaleY, skew, skewX, skewY, rotate, scrollTop, scrollLeft, ...rest } = values

    if (scrollLeft !== void 0 || scrollTop !== void 0) {
      const fallbackLeft = el === window ? el.scrollX : _el.scrollLeft
      const fallbackTop = el === window ? el.scrollY : _el.scrollTop
      el.scrollTo((scrollLeft as number) ?? fallbackLeft, (scrollTop as number) ?? fallbackTop)
    }

    if (el !== window) {
      for (let key in rest) {
        // @ts-expect-error
        _el.style[key] = rest[key]
      }

      const t = { x, y, scale, scaleX, scaleY, skew, skewX, skewY, rotate }
      if (!someDefined(Object.values(t))) return
      _el.style.transform = getTransformStyle(t as Transform, initial.transform)

      // TODO can potentially be optimized 👇
      if (idle && getComputedStyle(_el).transform === IDENTITY) _el.style.transform = 'none'
    }
  },

  getInitialValueAndAdapter(el, key, initial) {
    // element is the window
    if (el === window) {
      if (key === 'scrollTop') return [el.scrollY, generic]
      else if (key === 'scrollLeft') return [el.scrollX, generic]
      // TODO return type doesn't make any sense
      return [0, undefined]
    }

    // element is an HTMLElement
    const style = getComputedStyle(el as HTMLElement)
    const adapter = key in ADAPTERS ? ADAPTERS[key] : generic

    // @ts-expect-error
    if (SCROLL_KEYS.includes(key as string)) return [el[key], adapter]

    if (TRANSFORM_KEYS.includes(key as string)) {
      initial.transform ||= getTransformValues(style)
      return [initial.transform[key as string], adapter]
    }

    // @ts-expect-error
    if (SIDES_KEYS.includes(key as string)) return [getSidesValues(style[key]), adapter]

    // @ts-expect-error
    return [style[key], adapter]
  }
}
