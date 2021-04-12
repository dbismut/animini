import { Animated } from '../animated/Animated'
import { spring } from '../algorithms'
import { color } from '../../../dom/src/adapters'

function round(number, dec = 3) {
  return Number(number.toFixed(dec))
}

let results = {}

beforeAll(() => {
  results = {}
})

function run(label, cb, runs = 100) {
  const start = performance.now()
  let iterations = 0
  for (let i = 0; i < runs; i++) {
    iterations += cb()
  }
  const time = performance.now() - start
  const timePerRun = round(time / runs)
  const iterationsPerRun = iterations / runs
  Object.assign(results, { [label]: { time: round(time, 1), timePerRun, iterations, iterationsPerRun } })
  return time
}

function bench(label, limit, runs, cb) {
  it(`${label} should run faster than ${limit}ms`, () => {
    expect(run(label, cb, runs)).toBeLessThan(limit)
  })
}

function animatedBench(algo, { limit = Infinity, from = 0, to = 1 + Math.random() * 1000, config, adapter } = {}) {
  const loop = { time: { elapsed: 0, delta: 16 } }
  const animated = new Animated(from, algo, adapter, loop)
  animated.start(to, config)
  let iterations = 0
  while (!animated.idle && iterations < limit) {
    iterations++
    loop.elasped += loop.delta
    animated.update()
  }
  return iterations
}

bench('lerp int (10 itr.)', 600, 10000, () => animatedBench(undefined, { limit: 10 }))
bench('spring int (10 itr.)', 600, 10000, () => animatedBench(spring, { limit: 10 }))
bench('spring array (10 itr.)', 600, 10000, () =>
  animatedBench(spring, { limit: 10, from: [0, 0, 0], to: [100, 200, 300] })
)
bench('spring color (10 itr.)', 600, 10000, () =>
  animatedBench(spring, { limit: 10, from: '#ff0000', to: '#000eac', adapter: color })
)
bench('lerp int', 1500, 10000, () => animatedBench(undefined))
bench('spring int', 600, 10000, () => animatedBench(spring))
bench('spring array', 1800, 10000, () => animatedBench(spring, { from: [0, 0, 0], to: [100, 200, 300] }))
bench('spring color', 1800, 10000, () => animatedBench(spring, { from: '#ff0000', to: '#000eac', adapter: color }))

afterAll(() => {
  console.table(results)
})
