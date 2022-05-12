// https://github.com/mattdesl/lerp

export function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function equal<P>(v0: P, v1: P) {
  if (Array.isArray(v0)) {
    return v0.every((val, index) => val === (v1 as any)[index])
  }
  return v0 === v1
}

export function each(array: unknown[], iterator: (v: unknown, i: number) => void) {
  if (Array.isArray(array)) {
    for (let i = 0; i < array.length; i++) iterator(array[i], i)
  } else {
    iterator(array, -1)
  }
}

export function map(obj: Record<string, unknown>, iterator: (v: unknown, key: string | number) => void) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(iterator)
    }
    return Object.entries(obj).map(([key, value]) => iterator(value, key))
  }
  return iterator(obj, -1)
}
