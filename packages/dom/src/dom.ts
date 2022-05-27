import { color, transform } from './adapters'
import { Styles } from './types'
import { Adapter, Target } from '@animini/core'

const TRANSFORM_KEYS = { scale: 1, x: 1, y: 1 }

const ADAPTERS: Partial<Record<keyof Styles, Adapter>> = {
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
const NO_PX = ['opacity']

const dom: Target<HTMLElement, Styles> = {
  setValues(rawStyle, el) {
    const { x, y, scale, ...rest } = rawStyle
    for (let key in rest) {
      const adapter = ADAPTERS[key]
      let value = rest[key]
      if (!adapter && !NO_PX.includes(key) && !isNaN(value as any)) {
        value += 'px'
      }
      // @ts-expect-error
      el.style[key] = value
    }
    if (x === undefined && y === undefined && scale === undefined) return
    if (!x && !y && (scale === void 0 || scale === 1)) el.style.removeProperty('transform')
    el.style.transform = `matrix(${scale !== void 0 ? scale : 1}, 0, 0, ${scale !== void 0 ? scale : 1}, ${x || 0}, ${
      y || 0
    })`
  },

  getInitialValueAndAdapter(_element, key, styleRef: React.RefObject<CSSStyleDeclaration>) {
    let value
    const adapter = ADAPTERS[key as any]
    if (key in TRANSFORM_KEYS) {
      value = getTranslateValues(styleRef.current!)[key as keyof Transform]
    } else {
      value = styleRef.current![key as any]
    }
    return [value, adapter] as [Styles[typeof key], Adapter | undefined]
  }
}

export default dom

type Transform = { scale: number; x: number; y: number; z: number }

const matrixRegexp = /matrix.*\((.+)\)/

function getTranslateValues(style: CSSStyleDeclaration): Transform {
  const matrix = style.transform

  // No transform property. Simply return 0 values.
  if (matrix === 'none' || typeof matrix === 'undefined') {
    return { scale: 1, x: 0, y: 0, z: 0 }
  }

  // Can either be 2d or 3d transform
  const matrixType = matrix.includes('3d') ? '3d' : '2d'
  const matrixValues = matrix.match(matrixRegexp)![1].split(', ')

  if (matrixType === '2d') {
    return { scale: ~~matrixValues[0], x: ~~matrixValues[4], y: ~~matrixValues[5], z: 0 }
  }

  return { scale: ~~matrixValues[0], x: ~~matrixValues[12], y: ~~matrixValues[13], z: ~~matrixValues[14] }
}
