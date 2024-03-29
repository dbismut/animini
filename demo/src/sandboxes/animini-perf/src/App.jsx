import { useState } from 'react'
import { useControls, button } from 'leva'
import tinycolor from 'tinycolor2'
import Animini from './Boxes/AniminiBox'
import AniminiVanilla from './Boxes/AniminiVanillaBox'
import ReactSpring from './Boxes/SpringBox'
import Motion from './Boxes/MotionBox'
import Gsap from './Boxes/GsapBox'
import FramerMotion from './Boxes/FramerMotionBox'
import FatJS from './Boxes/FatBox'
import AnimeJS from './Boxes/AnimeBox'

const COUNT = 4000

const styles = Array(COUNT)
  .fill(1)
  .map(() => ({
    position: 'absolute',
    top: Math.random() * 100 + 'vh',
    left: Math.random() * 100 + 'vw',
    width: 10,
    height: 10,
    backgroundColor: tinycolor.random().toHexString()
  }))

const stillStyles = Array(COUNT).fill({
  x: 0,
  y: 0,
  scale: 1,
  backgroundColor: tinycolor.random().toHexString()
})
const moveStyles = stillStyles.map(() => ({
  x: Math.random() * 500 - 250,
  y: Math.random() * 500 - 250,
  scale: 1 + Math.random(),
  backgroundColor: tinycolor.random().toHexString()
}))

export default function Perf() {
  const [move, setMove] = useState(false)
  const [clicked, setClicked] = useState(false)
  const { count, Model: Box } = useControls({
    count: { value: 1000, min: 100, max: 4000 },
    Model: {
      options: { Animini, AniminiVanilla, AnimeJS, ReactSpring, Motion, FramerMotion, Gsap, FatJS }
    },
    Shuffle: button(() => {
      const ts = performance.now()
      setClicked(true)
      setMove((m) => !m)
      const raf = window.requestIdleCallback || window.requestAnimationFrame
      raf(() => {
        setClicked(false)
        // eslint-disable-next-line no-console
        console.log('TIME:', performance.now() - ts)
      })
    })
  })

  const motionStyles = move ? moveStyles : stillStyles

  return (
    <div className="flex fill center">
      <b
        style={{
          fontSize: 80,
          color: '#f00',
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#fff'
        }}
      >
        {clicked && 'CLICKED'}
      </b>
      {styles.slice(0, count).map((style, i) => (
        <Box key={i} {...motionStyles[i]} style={style} />
      ))}
    </div>
  )
}
