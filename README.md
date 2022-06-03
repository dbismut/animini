[![npm (tag)](https://img.shields.io/npm/v/@animini/dom?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@animini/dom) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@animini/dom?style=flat&colorA=000000&colorB=000000&label=gzipped)](https://bundlephobia.com/result?p=@animini/dom)

## Demo

https://animini.vercel.app/

## Installation

### For the React DOM

```bash
yarn add @animini/react-dom
```

### For React Three Fiber

```bash
yarn add @animini/react-three
```

### Instructions

```js
import { useDrag } from '@use-gesture/react'
import { useAnimini, spring } from '@animini/react-dom'

const easing = spring()

export default function App() {
  const [ref, api] = useAnimini()

  useDrag(
    ({ active, movement: [x, y] }) => {
      api.start({ scale: active ? 1.2 : 1, x: active ? x : 0, y: active ? y : 0 }, (k) => ({
        immediate: k !== 'scale' && active,
        easing
      }))
    },
    { target: ref }
  )

  return <div ref={ref} />
}
```

## Easings

### Lerp

Lerp is the lightest, fastest and default easing algorithm for Animini. It supports a `factor` attribute that will change the momentum of the lerp.

```js
import { useAnimini, lerp } from '@animini/react-dom'

const easing = lerp({ factor: 0.05 })
api.start({ x: 100 }, { easing })
```

### Spring

```js
import { useAnimini, spring } from '@animini/react-dom'

const easing = spring({
  tension: 170, // spring tension
  friction: 26, // spring friction
  mass: 1, // target mass
  velocity // initial velocity
})

api.start({ x: 100 }, { easing })
```

### Ease (Bezier)

```js
import { useAnimini, ease } from '@animini/react-dom'

const easing = ease(
  300, // duration of the ease in ms
  [0.25, 0.1, 0.25, 1] // coordinates of the bezier curve
)

api.start({ x: 100 }, { easing })
```

### Inertia

Inertia aims at emulating a thrown object. Inertia will not reach its destination and only works if the value is already moving or if the easing is given an initial velocity.

Inertia supports `min` and `max` bounds which the element will bounce against as a rubberband bouncing on a wall.

```js
import { useAnimini, inertia } from '@animini/react-dom'

const easing = inertia({
  momentum: 0.998,     // momentum of the inertia
  velocity: undefined, // initial velocity (leave it undefined to use the current velocity of the value)
  min: -100,           // min bound
  max: 100,            // max bound
  rubberband = 0.15    // elasticity factor when reaching bounds defined by min / max
})

api.start({ x: 100 }, { easing })
```
