import { parseUnitValue } from '@animini/core'
import { DomAdapter } from '../types'

const parse: DomAdapter['parse'] = (value, key, el) => {
  let [_value, unit] = parseUnitValue(value)
  if (isNaN(_value)) return value
  switch (unit) {
    case '%':
      const parent = el?.offsetParent
      // @ts-expect-error
      const size = (key === 'top' ? parent?.offsetHeight : parent?.offsetWidth) || 0
      return (_value * size) / 100
    case 'vw':
      return (_value * window.innerWidth) / 100
    case 'vh':
      return (_value * window.innerHeight) / 100
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
