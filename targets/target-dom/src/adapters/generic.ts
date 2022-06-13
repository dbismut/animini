import { parseUnitValue } from '@animini/core'
import { DomAdapter } from '../types'
import { SCROLL_KEYS } from '../utils'

const parse: DomAdapter['parse'] = (value, animated) => {
  let [_value, unit] = parseUnitValue(value)
  if (isNaN(_value)) return value
  switch (unit) {
    case '%':
      const parent = animated.el?.offsetParent
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
  format(value: number, animated) {
    if (!isNaN(value as any) && !SCROLL_KEYS.includes(animated.key!)) return value + 'px'
    return value
  },
  parseInitial: parse
}
