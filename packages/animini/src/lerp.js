export function lerp() {
  const t = this.config.factor ?? 0
  const v0 = this.value
  const v1 = this.target
  return !t ? v1 : v0 * (1 - t) + v1 * t
}
