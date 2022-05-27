import { NumberOrString } from '../types'

export function parseUnitValue(value: NumberOrString): [number] | [number, string] {
  if (typeof value === 'number') return [value]
  const _value = parseFloat(value)
  const unit: string = value.substring(('' + _value).length)
  return [_value, unit]
}
