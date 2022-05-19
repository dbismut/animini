import type { AnimatedValue } from '../animated/AnimatedValue'
import { Algorithm } from '../types'

type SpringConfig = {
  tension?: number
  friction?: number
  mass?: number
  velocity?: number
}

export function spring({ tension: k = 170, friction: c = 26, mass: m = 1, velocity }: SpringConfig = {}): Algorithm {
  const zeta = c / (2 * Math.sqrt(k * m))
  const w0 = Math.sqrt(k / m) * 0.001
  const w1 = w0 * Math.sqrt(1.0 - zeta * zeta)

  return function update(a: AnimatedValue) {
    const t = a.time.elapsed
    const v0 = velocity ?? a.startVelocity
    const { to, distance: x0 } = a

    let value

    if (zeta < 1) {
      const envelope = Math.exp(-zeta * w0 * t)
      value = to - envelope * (((-v0 + zeta * w0 * x0) / w1) * Math.sin(w1 * t) + x0 * Math.cos(w1 * t))
    } else {
      const envelope = Math.exp(-w0 * t)
      value = to - envelope * (x0 + (-v0 + w0 * x0) * t)
    }

    return value
  }
}
