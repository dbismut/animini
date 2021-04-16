import React from 'react'
import { useDrag } from 'react-use-gesture'
import { useControls, button } from 'leva'
import { spring } from '@leva-ui/plugin-spring'
import { useAnimini } from '@animini/dom'

import styles from './styles.module.css'

export default function App() {
  const { motion, factor, config, stickToDrag } = useControls({
    stickToDrag: true,
    motion: { value: 'spring', options: ['lerp', 'spring'] },
    factor: { value: 0.05, min: 0, max: 1, optional: true, render: (get) => get('motion') === 'lerp' },
    config: spring({ render: (get) => get('motion') === 'spring' }),
    'set width': button(() => api.start({ width: 300 }, { motion: 'lerp' })),
    'set color': button(() => api.start({ backgroundColor: '#000' })),
  })

  const [ref, api] = useAnimini(motion)
  const _config = motion === 'spring' ? config : { factor }

  useDrag(
    ({ active, movement: [x, y] }) => {
      api.start(
        {
          scale: active ? 1.2 : 1,
          x: active ? x : 0,
          y: active ? y : 0,
          backgroundColor: active ? '#5698cf' : '#ec625c',
        },
        (k) => ({
          ..._config,
          immediate: k !== 'scale' && active && stickToDrag,
        })
      )
    },
    { domTarget: ref }
  )

  return (
    <div className="flex fill center">
      <div className={styles.drag} ref={ref} />
    </div>
  )
}
