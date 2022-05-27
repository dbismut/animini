export function parseUnitValue(value: number | string): [number] | [number, string] {
  if (typeof value === 'number') return [value]
  const _value = parseFloat(value)
  const unit: string = value.substring(('' + _value).length)
  return [_value, unit]
}
