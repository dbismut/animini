import { lerp } from './maths'

function parseColor(str) {
  if (str.indexOf('rgb') === 0) {
    const [r, g, b, a] = str.match(/\d+/g)
    return [r, g, b, a ?? 1]
  }
  if (str.indexOf('#') === 0) {
    const [r = 0, g = 0, b = 0, a] = str
      .substr(1)
      .replace('#', '')
      .match(/.{1,2}/g)
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), a ? parseInt(a, 16) / 255 : 1]
  }
  return false
}

export function format(c) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`
}

export function interpolator(v1, v2) {
  this.v1 = parseColor(v1)
  if (this.v1) return null
  this.v2 = parseColor(v2)
  if (this.v2) return null
  return function (t) {
    const color = []
    for (let i = 0; i < 3; i++) {
      color[i] = Math.round(lerp(this.v1[i], this.v2[i], t))
    }
    return color
  }
}
