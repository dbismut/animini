/**
 * @jest-environment node
 */

import fs from 'fs-extra'
import path from 'path'
import microtime from 'microtime'
import { Table } from 'console-table-printer'
import si from 'systeminformation'

import { Animated } from '../../packages/core/src/animated/Animated'
import { spring } from '../../packages/core/src/algorithms'
import { color } from '../../packages/dom/src/adapters'

import { Animated as AnimatedLatest } from '@animini/core-latest/src/animated/Animated'

let sourceResults = {}
let latestResults = {}

function kFormat(num) {
  return Math.abs(num) > 999 ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'K' : Math.sign(num) * Math.abs(num)
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
  const source = { time: 0, iterations: 0, runs }
  const latest = { time: 0, iterations: 0, runs }

  for (let i = 0; i < runs; i++) {
    const useSourceFirst = Math.random() < 0.5
    ;[useSourceFirst, !useSourceFirst].forEach((useSource) => {
      const start = microtime.now()
      const iterations = cb(useSource)
      const time = microtime.now() - start
      const obj = useSource ? source : latest
      obj.iterations += iterations
      obj.time += time
    })
  }

  source.timePerItr = source.time / source.iterations
  latest.timePerItr = latest.time / latest.iterations

  const ratio = source.timePerItr / latest.timePerItr
  source.vs = ratio - 1

  Object.assign(sourceResults, { [label]: source })
  Object.assign(latestResults, { [label]: latest })
  return source.time
}

function bench(label, limit, runs, cb) {
  it(`${label} should run faster than ${limit}ms`, () => {
    expect(run(label, cb, runs)).toBeLessThan(limit * 1000)
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

// const suite = new Benchmark.Suite()
// suite
//   .add('spring int (10 itr.) true', function () {
//     animatedBench(true, undefined, { limit: 10 })
//   })
//   .add('spring int (10 itr.) false', function () {
//     animatedBench(false, undefined, { limit: 10 })
//   })
//   .on('complete', function () {
//     console.log('Fastest is ', this)
//   })
//   .run()

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

function formatResults(results) {
  const r = {}
  r['runs'] = kFormat(results.runs)
  r['iterations'] = kFormat(results.iterations)
  r['time (ms)'] = round(results.time / 1000, 1)
  r['t/itr (ns)'] = round(results.time / results.iterations)
  r['vs latest'] = round(results.vs * 100, 2) + (results.vs < 0 ? '% faster' : '% slower')
  return r
}

afterAll(async () => {
  const perfPath = path.resolve(__dirname, `logs/perf-${new Date().toISOString()}.log.json`)
  const cpu = await si.cpu()
  const p = new Table()

  Object.entries(sourceResults).forEach(([key, source]) => {
    const results = formatResults(source)

    p.addRow({ test: key, ...results }, { color: source.vs > 0.1 ? 'red' : source.vs < -0.1 ? 'green' : undefined })
  })

  p.printTable()
  fs.ensureFileSync(perfPath)
  fs.writeJSONSync(perfPath, { cpu, results: sourceResults }, { spaces: '  ' })
})
