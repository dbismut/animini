function getSpringConfig(k, c, m, v0) {
  const zeta = c / (2 * Math.sqrt(k * m))
  const w0 = Math.sqrt(k / m) * 0.001
  const w1 = w0 * Math.sqrt(1.0 - zeta * zeta)
  return { k, c, m, zeta, w0, w1, v0 }
}

export const spring = {
  defaultConfig: { tension: 170, friction: 26, mass: 1 },
  setup() {
    const { tension = 170, friction = 26, mass = 1, velocity } = this.config
    this._config = getSpringConfig(tension, friction, mass, velocity)
  },
  solver() {
    const t = this._internalTime.elapsed
    const { zeta, w1, w0 } = this._config

    let value, fn

    if (zeta < 1) {
      // value = to - envelope * (((-v0 + zeta * w0 * x0) / w1) * Math.sin(w1 * t) + x0 * Math.cos(w1 * t))
      const envelope = Math.exp(-zeta * w0 * t)
      value = 1 - envelope * (((zeta * w0) / w1) * Math.sin(w1 * t) + Math.cos(w1 * t))
      fn = (v) => v * (envelope / w1) * Math.sin(w1 * t)
    } else {
      // value = to - envelope * (x0 + (-v0 + w0 * x0) * t)
      const envelope = Math.exp(-w0 * t)
      value = 1 - envelope * (1 + w0 * t)
      fn = (v) => v * envelope * t
    }

    return [value, (animatedValue) => value + fn(animatedValue.v0 / animatedValue.x0)]
  },
}
