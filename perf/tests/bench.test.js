/**
 * @jest-environment node
 */

import fs from 'fs-extra'
import path from 'path'
import { Table } from 'console-table-printer'
import Benchmark from 'benchmark'
import si from 'systeminformation'

import { Animated } from '../../packages/core/src/animated/Animated'
import { color } from '../../packages/dom/src/adapters'

import { Animated as AnimatedLatest } from '@animini/core-latest/src/animated/Animated'
import { spring } from '@animini/core-latest/src/algorithms'

let fullResults = {}

function round(number, dec = 3) {
  return Number(number.toFixed(dec))
}

beforeAll(() => {
  fullResults = {}
})

async function bench(label, cb) {
  await it(`${label} should run faster than $ms`, async () => {
    const results = await new Promise((resolve) => {
      const suite = new Benchmark.Suite()
      suite
        .add('source', () => void cb(true))
        .add('latest', () => void cb(false))
        .on('cycle', function (event) {
          console.log(String(event.target))
        })
        .on('complete', function () {
          resolve(this)
        })
        .run()
    })

    Object.assign(fullResults, {
      [label]: {
        latest: results['1'].hz,
        source: results['0'].hz,
        vs: 1 - results['0'].hz / results['1'].hz,
      },
    })
    expect(0).toBeLessThan(1000)
  })
}

function animateLatest({ motion, limit, from, to, config, adapter }) {
  const loop = { time: { elapsed: 0, delta: 16 } }
  const _motion = motion === 'spring' ? spring : undefined
  const animated = new AnimatedLatest(from, _motion, adapter, loop)
  animated.start(to, config)
  let iterations = 0
  while (!animated.idle && iterations < limit) {
    iterations++
    loop.time.elapsed += loop.time.delta
    animated.update()
  }

  return iterations
}

function animateSource({ motion = 'lerp', limit, from, to, config, adapter }) {
  const loop = { time: { elapsed: 0, delta: 16 } }
  const animated = new Animated(from, adapter, loop)
  config.motion = motion
  animated.start(to, config)
  let iterations = 0
  while (!animated.idle && iterations < limit) {
    iterations++
    loop.time.elapsed += loop.time.delta
    animated.update()
  }
  // console.log('SOURCE', animated.value)

  return iterations
}

function animatedBench(
  useSource,
  { motion, limit = Infinity, from = 0, to = 1 + Math.random() * 1000, config = {}, adapter } = {}
) {
  if (useSource) return animateSource({ motion, limit, from, to, config, adapter })
  return animateLatest({ motion, limit, from, to, config, adapter })
}

bench('lerp int (10 itr.)', (useSource) => animatedBench(useSource, { limit: 10 }))
bench('spring int (10 itr.)', (useSource) => animatedBench(useSource, { motion: 'spring', limit: 10 }))
bench('spring array (10 itr.)', (useSource) =>
  animatedBench(useSource, { motion: 'spring', limit: 10, from: [0, 0, 0], to: [100, 200, 300] })
)
bench('spring color (10 itr.)', (useSource) =>
  animatedBench(useSource, { motion: 'spring', limit: 10, from: '#ff0000', to: '#000eac', adapter: color })
)

function formatResults(results) {
  const r = {}
  r['latest'] = Benchmark.formatNumber(~~results.latest) + 'ops/s'
  r['source'] = Benchmark.formatNumber(~~results.source) + 'ops/s'
  r['vs'] = round(results.vs * 100, 2) + '%'
  return r
}

afterAll(async () => {
  const perfPath = path.resolve(__dirname, `logs/bench-${new Date().toISOString()}.log.json`)
  const cpu = await si.cpu()
  const p = new Table()

  Object.entries(fullResults).forEach(([key, source]) => {
    const results = formatResults(source)
    p.addRow({ test: key, ...results }, { color: source.vs > 0.1 ? 'red' : source.vs < -0.1 ? 'green' : undefined })
  })

  p.printTable()
  fs.ensureFileSync(perfPath)
  fs.writeJSONSync(perfPath, { cpu, results: fullResults }, { spaces: '  ' })
})
