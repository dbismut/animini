import { color, generic, transform, string } from './adapters'
import { DomAdapter, Styles, Transform } from './types'
import { Target } from '@animini/core'
import { getSidesValues, getTransformValues, SCROLL_KEYS, SIDES_KEYS, TRANSFORM_KEYS } from './utils'

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
  clipPath: string,
  boxShadow: string,
  padding: string,
  margin: string,
  inset: string
}

const NO_ADAPTER = ['opacity', 'scale']

export const dom: Target<HTMLElement | Window, Styles> = {
  getElement(element) {
    if (typeof element !== string) return element
    return document.querySelector(element)
  },
  setValues(values, el) {
    const { x, y, scale, scrollTop, scrollLeft, ...rest } = values
    for (let key in rest) {
      // @ts-expect-error
      el.style[key] = rest[key]
    }

    if (scrollLeft !== void 0 || scrollTop !== void 0) {
      const fallbackLeft = el === window ? el.scrollX : (el as HTMLElement).scrollLeft
      const fallbackTop = el === window ? el.scrollY : (el as HTMLElement).scrollTop
      el.scrollTo((scrollLeft as number) ?? fallbackLeft, (scrollTop as number) ?? fallbackTop)
    }

    if (el !== window) {
      if (x === undefined && y === undefined && scale === undefined) return
      if (!x && !y && (scale === void 0 || scale === 1)) {
        ;(el as HTMLElement).style.removeProperty('transform')
      } else {
        const s = scale !== void 0 ? scale : 1
        ;(el as HTMLElement).style.transform = `matrix(${s}, 0, 0, ${s}, ${x || 0}, ${y || 0})`
      }
    }
  },

  getInitialValueAndAdapter(element, key) {
    if (element === window) {
      if (key === 'scrollTop') return [element.scrollY, generic]
      else if (key === 'scrollLeft') return [element.scrollX, generic]
      // TODO return type doesn't make any sense
      return [0, undefined]
    }
    const style = getComputedStyle(element as HTMLElement)
    let value
    const adapter = ADAPTERS[key as any] || (!NO_ADAPTER.includes(key as string) ? generic : undefined)
    if (SCROLL_KEYS.includes(key as string)) {
      // @ts-expect-error
      value = element[key]
    } else if (TRANSFORM_KEYS.includes(key as string)) {
      value = getTransformValues(style.transform)[key as keyof Transform]
    } else if (SIDES_KEYS.includes(key as string)) {
      value = getSidesValues(style[key as any])
    } else {
      value = style[key as any]
    }
    return [value, adapter] as [Styles[typeof key], DomAdapter | undefined]
  }
}
