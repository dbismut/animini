import { Adapter } from '@animini/core'

function parse(str: string) {
  if (str.indexOf('rgb') === 0) {
    const [r, g, b, a = 1] = str.match(/\d+/g)!
    return [~~r, ~~g, ~~b, ~~a]
  }
  if (str.indexOf('#') === 0) {
    const [r = '0', g = '0', b = '0', a] = str.substring(1).match(/.{1,2}/g)!
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), a ? parseInt(a, 16) / 255 : 1]
  }
}

export function format(c: number[]) {
  return `rgba(${~~c[0]}, ${~~c[1]}, ${~~c[2]}, ${~~c[3]})`
}

export const color: Adapter = { parse, parseInitial: parse, format }