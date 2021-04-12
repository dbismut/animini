import fs from 'fs-extra'
import path from 'path'
import { Table } from 'console-table-printer'
import si from 'systeminformation'

import { Animated } from '../../core/src/animated/Animated'
import { spring } from '../../core/src/algorithms'
import { color } from '../../dom/src/adapters'

import { Animated as AnimatedLatest } from '../../../node_modules/@animini/core-latest/src/animated/Animated'

let sourceResults = {}
let latestResults = {}

function getResults(useSource) {
  return useSource ? sourceResults : latestResults
}

function getAnimated(useSource, ...args) {
  if (useSource) return new Animated(...args)
  return new AnimatedLatest(...args)
}

function round(number, dec = 3) {
  return Number(number.toFixed(dec))
}

beforeAll(() => {
  sourceResults = {}
  latestResults = {}
})

function run(label, cb, runs = 100) {
  let timeSource
  ;[false, true].forEach((useSource) => {
    const start = performance.now()
    let iterations = 0
    for (let i = 0; i < runs; i++) {
      iterations += cb(useSource)
    }
    const time = performance.now() - start
    if (useSource) timeSource = time
    const timePerRun = round(time / runs)
    const iterationsPerRun = iterations / runs
    Object.assign(getResults(useSource), {
      [label]: { time: round(time, 1), timePerRun, iterations, iterationsPerRun },
    })
  })
  return timeSource
}

function bench(label, limit, runs, cb) {
  it(`${label} should run faster than ${limit}ms`, () => {
    expect(run(label, cb, runs)).toBeLessThan(limit)
  })
}

function animatedBench(
  useSource,
  algo,
  { limit = Infinity, from = 0, to = 1 + Math.random() * 1000, config, adapter } = {}
) {
  const loop = { time: { elapsed: 0, delta: 16 } }
  const animated = getAnimated(useSource, from, algo, adapter, loop)
  animated.start(to, config)
  let iterations = 0
  while (!animated.idle && iterations < limit) {
    iterations++
    loop.elasped += loop.delta
    animated.update()
  }
  return iterations
}

bench('lerp int (10 itr.)', 600, 5000, (useSource) => animatedBench(useSource, undefined, { limit: 10 }))

bench('spring int (10 itr.)', 600, 5000, (useSource) => animatedBench(useSource, spring, { limit: 10 }))
bench('spring array (10 itr.)', 600, 5000, (useSource) =>
  animatedBench(useSource, spring, { limit: 10, from: [0, 0, 0], to: [100, 200, 300] })
)
bench('spring color (10 itr.)', 600, 5000, (useSource) =>
  animatedBench(useSource, spring, { limit: 10, from: '#ff0000', to: '#000eac', adapter: color })
)
bench('lerp int', 1500, 5000, (useSource) => animatedBench(useSource, undefined))
bench('spring int', 600, 5000, (useSource) => animatedBench(useSource, spring))
bench('spring array', 1800, 5000, (useSource) =>
  animatedBench(useSource, spring, { from: [0, 0, 0], to: [100, 200, 300] })
)
bench('spring color', 1800, 5000, (useSource) =>
  animatedBench(useSource, spring, { from: '#ff0000', to: '#000eac', adapter: color })
)

const perfPath = path.resolve(__dirname, `perf-${Date.now()}.log.json`)

afterAll(async () => {
  const cpu = await si.cpu()
  const p = new Table()

  Object.entries(sourceResults).forEach(([key, value]) => {
    const latest = latestResults[key]
    let comp = 0
    const ratio = value.time / latest.time
    comp = ratio - 1
    let suffix = comp < 0 ? '% faster' : '% slower'
    const vs = round(comp * 100, 2) + suffix

    p.addRow(
      { test: key, ...value, 'vs latest': vs },
      { color: comp > 0.1 ? 'red' : comp < -0.1 ? 'green' : undefined }
    )
  })

  p.printTable()
  fs.writeJSONSync(perfPath, { cpu, results: sourceResults }, { spaces: '  ' })
})
