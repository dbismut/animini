import { Transform } from './types'

export const TRANSFORM_KEYS = ['scale', 'x', 'y']
export const SIDES_KEYS = ['inset', 'margin', 'padding']
export const SCROLL_KEYS = ['scrollLeft', 'scrollTop']

export function getSidesValues(value: string) {
  const n = value.split(' ')
  switch (n.length) {
    case 3:
      return value + ' ' + n[2]
    case 2:
      return value + ' ' + value
    case 1:
      return value + ' ' + value + ' ' + value + ' ' + value
    default:
      return value
  }
}

export function getTransformValues(matrix: string): Transform {
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

  // matrixType === '3d'
  return { scale: ~~matrixValues[0], x: ~~matrixValues[12], y: ~~matrixValues[13], z: ~~matrixValues[14] }
}
