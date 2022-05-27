import { parseUnitValue } from '@animini/core'
import { DomAdapter } from '../types'

const parse: DomAdapter['parse'] = (value, _key, el) => {
  let [_value, unit] = parseUnitValue(value)
  if (unit === '%') {
    // @ts-expect-error
    const parentWidth: number = el?.offsetParent?.offsetWidth
    _value *= parentWidth / 100
  }
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
