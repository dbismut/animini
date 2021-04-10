// https://github.com/mattdesl/lerp

export function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}

export function equal(v0, v1) {
  if (Array.isArray(v0)) {
    return v0.every((val, index) => val === v1[index])
  }
  return v0 === v1
}

export function each(array, iterator) {
  if (Array.isArray(array)) {
    for (let i = array.length; i > 0; i--) iterator(array[i], i)
  } else {
    iterator(array, -1)
  }
}

export function map(array, iterator) {
  if (Array.isArray(array)) {
    return array.map(iterator)
  }
  return iterator(array, -1)
}

export function getset(self, key, getter, setter) {
  const obj = {}
  if (getter) obj.get = getter
  if (setter) obj.set = setter
  if (getter) Object.defineProperty(self, key, obj)
}
