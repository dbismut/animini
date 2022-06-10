import { color, generic, transform, string } from './adapters'
import { DomAdapter, Styles, Transform } from './types'
import { Target } from '@animini/core'
import { getSidesValues, getTransformValues, SIDES_KEYS, TRANSFORM_KEYS } from './utils'

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
  margin: string
}

const NO_ADAPTER = ['opacity', 'scale']

export const dom: Target<HTMLElement, Styles> = {
  setValues(values, el) {
    const { x, y, scale, ...rest } = values
    for (let key in rest) {
      // @ts-expect-error
      el.style[key] = rest[key]
    }
    if (x === undefined && y === undefined && scale === undefined) return
    if (!x && !y && (scale === void 0 || scale === 1)) el.style.removeProperty('transform')
    el.style.transform = `matrix(${scale !== void 0 ? scale : 1}, 0, 0, ${scale !== void 0 ? scale : 1}, ${x || 0}, ${
      y || 0
    })`
  },

  getInitialValueAndAdapter(element, key) {
    const style = getComputedStyle(element)
    let value
    const adapter = ADAPTERS[key as any] || (!NO_ADAPTER.includes(key as string) ? generic : undefined)
    if (TRANSFORM_KEYS.includes(key as string)) {
      value = getTransformValues(style.transform)[key as keyof Transform]
    } else if (SIDES_KEYS.includes(key as string)) {
      value = getSidesValues(style[key as any])
    } else {
      value = style[key as any]
    }
    return [value, adapter] as [Styles[typeof key], DomAdapter | undefined]
  }
}
