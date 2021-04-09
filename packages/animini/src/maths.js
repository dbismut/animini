// https://github.com/mattdesl/lerp

export function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}
