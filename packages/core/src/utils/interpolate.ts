// mostly stolen from https://github.com/d3/d3-interpolate/blob/main/src/string.js

const reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g

export function parseNumbers(v: string) {
  return v.match(reA)!.map((k) => +k)
}

export function interpolate(b: string) {
  let bi = (reA.lastIndex = 0), // scan index for next number in b
    bm, // current match in b
    bs, // string preceding current number in b, if any
    i = -1, // index in s
    s: (string | null)[] = [], // string constants and placeholders
    q: number[] = [] // number interpolators

  // Coerce inputs to strings.
  b = b + ''

  // Interpolate pairs of numbers in a & b.
  while ((bm = reA.exec(b))) {
    if ((bs = bm.index) > bi) {
      // a string precedes the next number in b
      bs = b.slice(bi, bs)
      if (s[i]) s[i] += bs // coalesce with previous string
      else s[++i] = bs
    }
    // interpolate non-matching numbers
    s[++i] = null
    q.push(+bm)
    bi = reA.lastIndex
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi)
    if (s[i]) s[i] += bs // coalesce with previous string
    else s[++i] = bs
  }

  return {
    values: q,
    compute(values: number[]) {
      i = 0
      return s.map((k) => (k === null ? values[i++] : k)).join('')
    }
  }
}
