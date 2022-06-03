import { parseColor } from '@animini/core'
import { DomAdapter } from '../types'

export const color: DomAdapter = {
  parse: parseColor,
  format(c: number[]) {
    return `rgba(${~~c[0]}, ${~~c[1]}, ${~~c[2]}, ${c[3]})`
  },
  parseInitial: parseColor
}
