import React from 'react'
import { useDrag } from '@use-gesture/react'
import { useControls, button } from 'leva'
import { spring as levaSpring } from '@leva-ui/plugin-spring'
import { useAnimini, spring } from '@animini/dom'

import styles from './styles.module.css'

export default function App() {
  const { method, factor, config, stickToDrag } = useControls({
    stickToDrag: false,
    method: { value: spring, options: { lerp: undefined, spring } },
    factor: { value: 0.05, min: 0, max: 1, optional: true, render: (get) => !get('method') },
    config: levaSpring({ render: (get) => get('method') }),
    'set width': button(() => api.start({ width: 300 }, { tension: 120 })),
    'set color': button(() => api.start({ backgroundColor: '#000' })),
  })

  const [ref, api] = useAnimini(method)
  const _config = method ? config : { factor }

  useDrag(
    ({ active, movement: [x, y] }) => {
      api.start(
        {
          scale: active ? 1.2 : 1,
          x: active ? x : 0,
          y: active ? y : 0,
          opacity: active ? 0.5 : 1,
          backgroundColor: active ? '#5698cf' : '#ec625c',
        },
        (k) => ({
          ..._config,
          immediate: k !== 'scale' && active && stickToDrag,
        })
      )
    },
    { target: ref }
  )

  return (
    <div className="flex fill center">
      <div className={styles.drag} ref={ref} />
    </div>
  )
}
