import { parseUnitValue } from '@animini/core'
import { DomAdapter } from '../types'

export const transform: DomAdapter = {
  parse(value, animated) {
    const [_value, unit] = parseUnitValue(value)
    switch (unit) {
      case '%':
        return (
          (_value *
            parseFloat(getComputedStyle(animated.el as HTMLElement)[animated.key === 'x' ? 'width' : 'height'])) /
          100
        )
      case 'vw':
        return (_value * window.innerWidth) / 100
      case 'vh':
        return (_value * window.innerHeight) / 100
    }
    return _value
  }
}

export const rotate: DomAdapter = {
  parse(value) {
    const [_value, unit] = parseUnitValue(value)
    switch (unit) {
      case 'rad':
        return (_value / 180) * Math.PI
      case 'turn':
        return _value * 360
    }
    return _value
  }
}
