// https://github.com/mattdesl/lerp

export function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function rubberband(distance: number, dimension: number, constant: number) {
  if (dimension === 0 || Math.abs(dimension) === Infinity) return Math.pow(distance, constant * 5)
  return (distance * dimension * constant) / (dimension + constant * distance)
}

export function rubberbandIfOutOfBounds(position: number, min: number, max: number, constant = 0.15) {
  if (constant === 0) return clamp(position, min, max)
  if (position < min) return -rubberband(min - position, max - min, constant) + min
  if (position > max) return +rubberband(position - max, max - min, constant) + max
  return position
}
