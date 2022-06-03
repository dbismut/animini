import { color, generic, transform } from './adapters'
import { DomAdapter, Styles } from './types'
import { Target } from '@animini/core'

const TRANSFORM_KEYS = { scale: 1, x: 1, y: 1 }

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
  y: transform
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

  getInitialValueAndAdapter(_element, key, styleRef: React.RefObject<CSSStyleDeclaration>) {
    let value
    const adapter = ADAPTERS[key as any] || (!NO_ADAPTER.includes(key as string) ? generic : undefined)
    if (key in TRANSFORM_KEYS) {
      value = getTranslateValues(styleRef.current!)[key as keyof Transform]
    } else {
      value = styleRef.current![key as any]
    }
    return [value, adapter] as [Styles[typeof key], DomAdapter | undefined]
  }
}

type Transform = { scale: number; x: number; y: number; z: number }

function getTranslateValues(style: CSSStyleDeclaration): Transform {
  const matrix = style.transform

  // No transform property. Simply return 0 values.
  if (matrix === 'none' || typeof matrix === 'undefined') {
    return { scale: 1, x: 0, y: 0, z: 0 }
  }

  // Can either be 2d or 3d transform
  const matrixType = matrix.includes('3d') ? '3d' : '2d'
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)![1].split(', ')

  if (matrixType === '2d') {
    return { scale: ~~matrixValues[0], x: ~~matrixValues[4], y: ~~matrixValues[5], z: 0 }
  }

  // if (matrixType === '3d') {
  return { scale: ~~matrixValues[0], x: ~~matrixValues[12], y: ~~matrixValues[13], z: ~~matrixValues[14] }
  // }
}
