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

export function each<P>(array: P[], iterator: (v: P, i: number) => void) {
  if (Array.isArray(array)) {
    for (let i = 0; i < array.length; i++) iterator(array[i], i)
  } else {
    iterator(array, -1)
  }
}

export function map<P, K>(obj: P | P[] | Record<string, P>, iterator: (v: P, key: string | number) => K) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(iterator)
    }
    return Object.entries(obj).map(([key, value]) => iterator(value, key))
  }
  return iterator(obj, -1) as any
}
