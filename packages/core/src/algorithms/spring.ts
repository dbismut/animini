import type { AnimatedValue } from '../animated/AnimatedValue'
import { Algorithm } from '../types'

function getSpringConfig(k: number, c: number, m: number, v0?: number) {
  const zeta = c / (2 * Math.sqrt(k * m))
  const w0 = Math.sqrt(k / m) * 0.001
  const w1 = w0 * Math.sqrt(1.0 - zeta * zeta)
  return { k, c, m, zeta, w0, w1, v0 }
}

type SpringConfig = {
  tension?: number
  friction?: number
  mass?: number
  velocity?: number
}

export function spring({ tension = 170, friction = 26, mass = 1, velocity }: SpringConfig = {}): Algorithm {
  const config = getSpringConfig(tension, friction, mass, velocity)
  return function update(a: AnimatedValue) {
    const t = a.time.elapsed!
    const { zeta, w1, w0, v0 = a.startVelocity ?? 0 } = config
    const { target: to, distance: x0 } = a

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
