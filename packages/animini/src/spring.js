import memoizeOne from 'memoize-one'

function getSpringConfig(k, c, m) {
  const zeta = c / (2 * Math.sqrt(k * m))
  const w0 = Math.sqrt(k / m) * 0.001
  const w1 = w0 * Math.sqrt(1.0 - zeta * zeta)
  return { k, c, m, zeta, w0, w1 }
}

const memoFn = memoizeOne(getSpringConfig)

export const spring = {
  onStart() {
    const { tension = 170, friction = 26, mass = 1, velocity } = this.config
    const config = memoFn(tension, friction, mass)

    const v0 = velocity ?? this.velocity ?? 0
    this.springConfig = { ...config, v0 }
  },

  update() {
    const t = this.time.elapsed
    const { zeta, w1, w0, v0 } = this.springConfig
    const { target: to, distance: x0 } = this

    let value

    if (zeta < 1) {
      const envelope = Math.exp(-zeta * w0 * t)
      value = to - envelope * (((-v0 + zeta * w0 * x0) / w1) * Math.sin(w1 * t) + x0 * Math.cos(w1 * t))
    } else {
      const envelope = Math.exp(-w0 * t)
      value = to - envelope * (x0 + (-v0 + w0 * x0) * t)
    }

    return value
  },
}
