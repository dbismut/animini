[![npm (tag)](https://img.shields.io/npm/v/animini?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/animini) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/animini?style=flat&colorA=000000&colorB=000000&label=gzipped)](https://bundlephobia.com/result?p=animini)

## Installation

### For the DOM

```bash
yarn add @animini/dom
```

### For Three

```bash
yarn add @animini/three
```

### Instructions

```js
import { useDrag } from 'react-use-gesture'
import { useAnimini, spring } from '@animini/dom'

export default function App() {
  const [ref, api] = useAnimini(spring) // leave useAnimini() to use default Lerp

  useDrag(
    ({ active, movement: [x, y] }) => {
      api.start({ scale: active ? 1.2 : 1, x: active ? x : 0, y: active ? y : 0 }, (k) => ({
        immediate: k !== 'scale' && active,
      }))
    },
    { domTarget: ref }
  )

  return <div ref={ref} />
}
```
