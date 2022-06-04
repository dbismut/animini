import { parseUnitValue } from '@animini/core'
import { DomAdapter } from '../types'

export const transform: DomAdapter = {
  parse(value, key, _target, cachedValues) {
    let [_value, unit] = parseUnitValue(value)
    switch (unit) {
      case '%':
        return (_value * parseFloat(cachedValues[key === 'x' ? 'width' : 'height'])) / 100
      case 'vw':
        return (_value * window.innerWidth) / 100
      case 'vh':
        return (_value * window.innerHeight) / 100
    }
    return _value
  }
}
