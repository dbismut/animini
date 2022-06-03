import { useDrag } from '@use-gesture/react'
import { useControls } from 'leva'
import { spring as levaSpring } from '@leva-ui/plugin-spring'
import { useAnimini, spring, lerp } from '@animini/react-dom'
import styles from './styles.module.css'

export default function App() {
  const { easeMethod, factor, springConfig, stickToDrag } = useControls({
    stickToDrag: false,
    easeMethod: { value: lerp, options: { lerp, spring } },
    factor: { value: 0.05, min: 0, max: 1, optional: true, render: (get) => get('easeMethod') === lerp },
    springConfig: levaSpring({ render: (get) => get('easeMethod') === spring })
  })

  const [ref, api] = useAnimini<HTMLDivElement>()
  const easing = easeMethod(easeMethod === lerp ? { factor } : springConfig)

  useDrag(
    ({ active, movement: [x, y] }) => {
      api.start(
        {
          scale: active ? 1.2 : 1,
          x: active ? x : 0,
          y: active ? y : 0,
          backgroundColor: active ? '#5698cf50' : '#ec625c'
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
