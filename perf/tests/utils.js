import { Animated } from '../../packages/core/src/animated/Animated'
import { spring, lerp } from '../../packages/core/src/algorithms'
import { color } from '../../packages/dom/src/adapters'

import { Animated as AnimatedLatest } from '@animini/core-latest/src/animated/Animated'
import { spring as springLatest } from '@animini/core-latest/src/algorithms'
import { color as colorLatest } from '@animini/dom-latest/src/adapters'

const AdaptersSource = { color }
const AdaptersLatest = { color: colorLatest }

export function animateLatest({ motion, limit, from, to, config, adapter }) {
  const loop = { time: { elapsed: 0, delta: 16 } }
  const _motion = motion === 'spring' ? springLatest : undefined
  const animated = new AnimatedLatest(from, _motion, AdaptersLatest[adapter], loop)
  animated.start(to, config)
  let iterations = 0
  while (!animated.idle && iterations < limit) {
    iterations++
    loop.time.elapsed += loop.time.delta
    animated.update()
  }

  // console.log('LATEST', animated.value)

  return iterations
}

export function animateSource({ motion, limit, from, to, config, adapter }) {
  const loop = { time: { elapsed: 0, delta: 16 } }
  const _motion = { easing: motion === 'spring' ? spring(config) : lerp(config) }
  const animated = new Animated(from, AdaptersSource[adapter], loop)
  animated.start(to, _motion)
  let iterations = 0
  while (!animated.idle && iterations < limit) {
    iterations++
    loop.time.elapsed += loop.time.delta
    animated.update()
  }

  // console.log('SOURCE', animated.value)

  return iterations
}

export function animatedBench(
  useSource,
  { motion = 'lerp', limit = Infinity, from = 0, to = 1 + Math.random() * 1000, config = {}, adapter } = {}
) {
  if (useSource) return animateSource({ motion, limit, from, to, config, adapter })
  return animateLatest({ motion, limit, from, to, config, adapter })
}

export function round(number, dec = 3) {
  return Number(number.toFixed(dec))
}

export function kFormat(num) {
  return Math.abs(num) > 999 ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'K' : Math.sign(num) * Math.abs(num)
}
