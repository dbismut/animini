import React from 'react'
import { useDrag } from '@use-gesture/react'
import { useControls, button } from 'leva'
import { spring as levaSpring } from '@leva-ui/plugin-spring'
import { useAnimini, spring, lerp } from '@animini/dom'

import styles from './styles.module.css'

export default function App() {
  const { method, factor, springConfig, stickToDrag } = useControls({
    stickToDrag: false,
    method: { value: spring, options: { lerp, spring } },
    factor: { value: 0.05, min: 0, max: 1, optional: true, render: (get) => get('method') === lerp },
    springConfig: levaSpring({ render: (get) => get('method') === spring }),
    'set width': button(async () => {
      await api.start({ width: 300 }, { tension: 120 })
      // await api.start({ width: 30 }, { tension: 120 })
    }),
    'set color': button(() => api.start({ backgroundColor: '#000' })),
    'set height': button(() => api.start({ height: 500 }, { factor: 0.01 })),
    'reset height': button(() => api.start({ height: 50 }, { factor: 0.01 })),
    stop: button(() => api.stop())
  })

  const [ref, api] = useAnimini()
  const easing = method(method === lerp ? { factor } : springConfig)

  useDrag(
    ({ active, movement: [x, y] }) => {
      api.start(
        {
          scale: active ? 1.2 : 1,
          x: active ? x : 0,
          y: active ? y : 0,
          opacity: active ? 0.5 : 1,
          backgroundColor: active ? '#5698cf' : '#ec625c'
        },
        (k) => ({
          easing,
          immediate: k !== 'scale' && active && stickToDrag
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
