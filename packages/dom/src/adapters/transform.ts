import { parseUnitValue } from '@animini/core'
import { DomAdapter } from '../types'

export const transform: DomAdapter = {
  parse(value, key, target, styleRef) {
    let [_value, unit] = parseUnitValue(value)
    if (unit === '%') {
      if (key === 'x') _value *= parseFloat(styleRef.current.width) / 100
      else if (key === 'y') _value *= parseFloat(styleRef.current.height) / 100
    }
    return _value
  }
}
