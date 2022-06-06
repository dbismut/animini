/**
 * @jest-environment node
 */

import fs from 'fs-extra'
import path from 'path'
import microtime from 'microtime'
import { Table } from 'console-table-printer'
import si from 'systeminformation'
import { animatedBench, round, kFormat } from './utils'

let sourceResults = {}
let latestResults = {}

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

bench('lerp int (10 itr.)', 600, 5000, (useSource) => animatedBench(useSource, { limit: 10 }))
bench('spring int (10 itr.)', 600, 5000, (useSource) => animatedBench(useSource, { motion: 'spring', limit: 10 }))
bench('spring array (10 itr.)', 600, 5000, (useSource) =>
  animatedBench(useSource, { motion: 'spring', limit: 10, from: [0, 0, 0], to: [100, 200, 300] })
)
// bench('spring color (10 itr.)', 600, 5000, (useSource) =>
//   animatedBench(useSource, { motion: 'spring', limit: 10, from: '#ff0000', to: '#000eac', adapter: 'color' })
// )
bench('lerp int', 1500, 5000, (useSource) => animatedBench(useSource, { to: 10 }))
bench('spring int', 600, 5000, (useSource) => animatedBench(useSource, { motion: 'spring', to: 10 }))
bench('spring array', 1800, 5000, (useSource) =>
  animatedBench(useSource, { motion: 'spring', from: [0, 0, 0], to: [100, 200, 300] })
)
// bench('spring color', 1800, 5000, (useSource) =>
//   animatedBench(useSource, { motion: 'spring', from: '#ff0000', to: '#000eac', adapter: 'color' })
// )

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
