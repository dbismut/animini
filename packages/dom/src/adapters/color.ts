import { Adapter } from '@animini/core'

// TODO hsl ?

// stolen from https://github.com/nextapps-de/fat
// bench shows it's 20% faster https://jsbench.me/cql3n9zjhp/1
// old function for reference 👇

/*
function parse(str: string) {
  if (str.indexOf('rgb') === 0) {
    const [r, g, b, a = '1'] = str.match(/\d+(?:\.\d+)?/g)!
    return [~~r, ~~g, ~~b, parseFloat(a)]
  }
  if (str.indexOf('#') === 0) {
    const [r = '0', g = '0', b = '0', a] = str.substring(1).match(/.{1,2}/g)!
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), a ? parseInt(a, 16) / 255 : 1]
  }
  return parseFloat(str)
}
*/

const hexToIntTable: Record<string, number> = {}
// const intToHexTable = new Array<string>(255)

for (let i = 0; i < 256; i++) {
  let hex = i.toString(16)

  if (hex.length % 2) {
    hex = '0' + hex
  }

  hexToIntTable[hex] = i
  // intToHexTable[i] = hex
}

function substringMatch(str: string, from: string, to?: string) {
  const pos = str.indexOf(from)
  if (pos !== -1) {
    if (to) {
      return str.substring(pos + from.length, str.indexOf(to))
    }
    return str.substring(0, pos)
  }

  return ''
}

function parse(str: string) {
  let r: number, g: number, b: number, a: number | undefined, tmp: string | string[]

  if (str[0] === '#') {
    str = str.toLowerCase()

    if (str.length === 4) {
      r = hexToIntTable[(tmp = str[1]) + tmp]
      g = hexToIntTable[(tmp = str[2]) + tmp]
      b = hexToIntTable[(tmp = str[3]) + tmp]
    } else {
      r = hexToIntTable[str[1] + str[2]]
      g = hexToIntTable[str[3] + str[4]]
      b = hexToIntTable[str[5] + str[6]]
      if (str.length === 9) {
        a = hexToIntTable[str[7] + str[8]] / 255
      }
    }
  } else {
    tmp = substringMatch(str, '(', ')').split(',')
    r = parseInt(tmp[0], 10)
    g = parseInt(tmp[1], 10)
    b = parseInt(tmp[2], 10)

    if (tmp.length > 3) {
      a = parseFloat(tmp[3])
    }
  }

  return [r, g, b, a ?? 1]
}

export const color: Adapter = {
  parse,
  format(c: number[]) {
    return `rgba(${~~c[0]}, ${~~c[1]}, ${~~c[2]}, ${c[3]})`
  },
  parseInitial: parse
}
