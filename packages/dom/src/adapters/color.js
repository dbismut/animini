import { lerp } from '@animini/core'

function parse(str) {
  if (str.indexOf('rgb') === 0) {
    const [r, g, b, a = 1] = str.match(/\d+/g)
    return [~~r, ~~g, ~~b, ~~a]
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

export function interpolate(v1, v2) {
  this.v1 = parse(v1)
  if (this.v1) return null
  this.v2 = parse(v2)
  if (this.v2) return null
  return function (t) {
    const color = []
    for (let i = 0; i < 3; i++) {
      color[i] = Math.round(lerp(this.v1[i], this.v2[i], t))
    }
    return color
  }
}

export const color = { parse, format, interpolate }
