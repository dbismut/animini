import { Transform } from './types'

export const TRANSFORM_KEYS = ['x', 'y', 'scale', 'rotate', 'scaleX', 'scaleY', 'skew', 'skewX', 'skewY']
export const SIDES_KEYS = ['inset', 'margin', 'padding']
export const SCROLL_KEYS = ['scrollLeft', 'scrollTop']

const RAD_TO_DEG = 180 / Math.PI

function round(n: number, d = 0) {
  const e = 10 ** d
  return Math.round(n * 1 * e) / e
}

export function someDefined(...args: any[]) {
  return args.some((v) => v !== void 0)
}

export function getSidesValues(value: string) {
  const n = value.split(' ')
  switch (n.length) {
    case 3:
      return value + ' ' + n[2]
    case 2:
      return value + ' ' + value
    case 1:
      return value + ' ' + value + ' ' + value + ' ' + value
  }
  return value
}

export function getTransformValues(style: CSSStyleDeclaration): Transform {
  const matrix = new DOMMatrixReadOnly(style.transform)
  const scaleX = round(Math.sqrt(matrix.a ** 2 + matrix.b ** 2), 3)

  // const skewX = Math.atan2(matrix.d, matrix.c) * RAD_TO_DEG - 90
  // const skewY = Math.atan2(matrix.b, matrix.a) * RAD_TO_DEG

  // console.log(
  //   {
  //     x: matrix.e,
  //     y: matrix.f,
  //     scale: scaleX,
  //     scaleX,
  //     scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
  //     skew: skewX,
  //     skewX,
  //     skewY,
  //     rotate: Math.atan2(matrix.b, matrix.a) * RAD_TO_DEG
  //   },
  //   matrix
  // )

  return {
    x: matrix.e,
    y: matrix.f,
    scale: scaleX,
    scaleX,
    scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
    // skew: skewX,
    // skewX,
    // skewY,
    rotate: Math.atan2(matrix.b, matrix.a) * RAD_TO_DEG
  }
}

export function getTransformStyle(t: Transform, i: Transform) {
  let s = ''
  if (someDefined(t.x, t.y, i.x, i.y)) s += `translate(${t.x ?? i.x}px, ${t.y ?? i.y}px)`
  if (someDefined(t.scale)) s += ` scale(${t.scale})`
  else if (someDefined(t.scaleX, t.scaleY, i.scaleX, i.scaleY))
    s += ` scale(${t.scaleX ?? i.scaleX}, ${t.scaleY ?? i.scaleY})`
  if (someDefined(t.rotate, i.rotate)) s += ` rotate(${t.rotate ?? i.rotate}deg)`
  // if (someDefined(t.skew, i.skew)) s += ` skew(${t.skew ?? i.skew}deg)`
  return s
}
