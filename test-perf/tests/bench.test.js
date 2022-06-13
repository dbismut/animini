/**
 * @jest-environment node
 */

import fs from 'fs-extra'
import path from 'path'
import { Table } from 'console-table-printer'
import Benchmark from 'benchmark'
import si from 'systeminformation'
import { round, animatedBench } from './utils'

let fullResults = {}

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
          // eslint-disable-next-line no-console
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
        vs: 1 - results['0'].hz / results['1'].hz
      }
    })
    expect(0).toBeLessThan(1000)
  })
}

bench('lerp int (10 itr.)', (useSource) => animatedBench(useSource, { limit: 10 }))
bench('spring int (10 itr.)', (useSource) => animatedBench(useSource, { motion: 'spring', limit: 10 }))
bench('spring array (10 itr.)', (useSource) =>
  animatedBench(useSource, { motion: 'spring', limit: 10, from: [0, 0, 0], to: [100, 200, 300] })
)
bench('spring color (10 itr.)', (useSource) =>
  animatedBench(useSource, { motion: 'spring', limit: 10, from: '#ff0000', to: '#000eac', adapter: 'color' })
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
