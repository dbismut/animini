export function parseUnitValue(value: number | string): [number] | [number, string] {
  if (typeof value === 'number') return [value]
  const _value = parseFloat(value)
  const unit: string = value.substring(('' + _value).length)
  return [_value, unit]
}

export function substringMatch(str: string, from: string, to?: string) {
  const pos = str.indexOf(from)
  if (pos !== -1) {
    if (to) {
      return str.substring(pos + from.length, str.indexOf(to))
    }
    return str.substring(0, pos)
  }

  return ''
}
