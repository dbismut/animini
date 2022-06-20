import { useDrag } from '@use-gesture/react'
import { useAnimate, inertia } from '@animini/react-dom'
import { useControls } from 'leva'
import styles from './styles.module.css'

export default function App() {
  const [ref, api] = useAnimate<HTMLDivElement>()
  const { limitXY } = useControls({
    limitXY: {
      value: { x: 200, y: 200 },
      transient: false,
      onChange: (value) => {
        document.documentElement.style.setProperty('--limitX', value.x + 'px')
        document.documentElement.style.setProperty('--limitY', value.y + 'px')
      }
    }
  })

  useDrag(
    ({ active, offset: [x, y] }) => {
      api.start({ x, y }, (key) => ({
        //@ts-ignore
        easing: inertia({ min: -limitXY[key], max: limitXY[key] }),
        immediate: active
      }))
    },
    {
      target: ref,
      from: () => [api.get('x') || 0, api.get('y') || 0] as [number, number],
      bounds: { left: -limitXY.x, right: limitXY.x, top: -limitXY.y, bottom: limitXY.y },
      rubberband: true
    }
  )

  return (
    <div className="flex fill center">
      <div className={styles.bounds} />
      <div className={styles.drag} ref={ref} />
    </div>
  )
}
