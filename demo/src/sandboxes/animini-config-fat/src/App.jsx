import { useRef } from 'react'
import { useControls, button } from 'leva'
import fat from './fat'

import styles from './styles.module.css'

export default function App() {
  const ref = useRef(null)

  useControls({
    animate: button(async (get) => {
      fat.animate(ref.current, {
        translateX: '-10%'
        // backgroundColor: '#00FF00'
      })
    })
  })

  return (
    <div className="flex fill center">
      <div className={styles.square} ref={ref} />
    </div>
  )
}
