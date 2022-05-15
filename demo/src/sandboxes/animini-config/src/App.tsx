import React from 'react'
import { useControls, button } from 'leva'
import { spring as levaSpring } from '@leva-ui/plugin-spring'
import { bezier } from '@leva-ui/plugin-bezier'
import { useAnimini, spring, lerp, ease } from '@animini/dom'

import styles from './styles.module.css'
export default function App() {
  useControls({
    easeMethod: { value: spring, options: { lerp, spring, ease } },
    factor: { value: 0.05, min: 0, max: 1, optional: true, render: (get) => get('easeMethod') === lerp },
    springConfig: levaSpring({ render: (get) => get('easeMethod') === spring }),
    easeConfig: bezier({ render: (get) => get('easeMethod') === ease }),
    duration: { value: 300, render: (get) => get('easeMethod') === ease },
    'set width': button(async (get) => {
      const method = get('easeMethod')
      let easing
      switch (method) {
        case lerp:
          easing = method({ factor: get('factor') })
          break
        case spring:
          easing = method(get('springConfig'))
          break
        default:
          easing = method(get('duration'), get('easeConfig'))
      }
      await api.start({ width: 300 }, { easing })
      await api.start({ width: 100 }, { easing })
    }),
    stop: button(() => api.stop())
  })

  const [ref, api] = useAnimini<HTMLDivElement>()

  return (
    <div className="flex fill center">
      <div className={styles.square} ref={ref} />
    </div>
  )
}
