// TODO hsl ?

import { substringMatch } from './string'

// benchmarks https://jsbench.me/cql3n9zjhp/1

export function parseColor(str: string) {
  let r: number, g: number, b: number, a: number | undefined, tmp: number | string[]
  if (str[0] === '#') {
    if ((str = str.substring(1)).length === 3) {
      str = str[0] + str[0] + str[1] + str[1] + str[2] + str[2] + 'FF'
    } else if (str.length === 6) {
      str += 'FF'
    }
    tmp = parseInt(str, 16)

    r = (tmp & 0xff000000) >>> 24
    g = (tmp & 0x00ff0000) >>> 16
    b = (tmp & 0x0000ff00) >>> 8
    a = (tmp & 0x000000ff) / 255
  } else {
    tmp = substringMatch(str, '(', ')').split(',')
    r = parseInt(tmp[0], 10)
    g = parseInt(tmp[1], 10)
    b = parseInt(tmp[2], 10)

    a = tmp.length > 3 ? parseFloat(tmp[3]) : 1
  }

  return [r, g, b, a]
}
