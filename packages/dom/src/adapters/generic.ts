import { parseUnitValue } from '@animini/core'
import { DomAdapter } from '../types'

function parse(value: any) {
  const [_value, unit] = parseUnitValue(value)
  return _value
}

export const generic: DomAdapter = {
  parse,
  format(value: number) {
    if (!isNaN(value as any)) return value + 'px'
    return value
  },
  parseInitial: parse
}
