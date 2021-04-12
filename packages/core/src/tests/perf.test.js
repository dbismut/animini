import { Animated } from '../animated/Animated'
import { spring } from '../algorithms'

function round(number, dec = 3) {
  return Number(number.toFixed(dec))
}

function run(label, cb, runs = 100) {
  const start = performance.now()
  let iterations = 0
  for (let i = 0; i < runs; i++) {
    iterations += cb()
  }
  const time = performance.now() - start
  const timePerRun = round(time / runs)
  const iterationsPerRun = iterations / runs
  console.log(label, { time: round(time, 1), timePerRun, iterations, iterationsPerRun })
  return time
}

function bench(label, limit, runs, cb) {
  it(`${label} should run faster than ${limit}ms`, () => {
    expect(run(label, cb, runs)).toBeLessThan(limit)
  })
}

function animatedBench(algo, { limit = Infinity, from = 0, to = 1 + Math.random() * 1000, config }) {
  const loop = { time: { elapsed: 0, delta: 16 } }
  const animated = new Animated(from, algo, undefined, loop)
  animated.start(to, config)
  let iterations = 0
  while (!animated.idle && iterations < limit) {
    iterations++
    loop.elasped += loop.delta
    animated.update()
  }
  return iterations
}

bench('lerp', 600, 10000, () => animatedBench(undefined, { limit: 10 }))
bench('spring', 600, 10000, () => animatedBench(spring, { limit: 10 }))
