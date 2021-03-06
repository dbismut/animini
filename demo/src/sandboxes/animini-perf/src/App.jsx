import { useState } from 'react'
import { useControls, button } from 'leva'
import tinycolor from 'tinycolor2'
import AniminiBox from './Boxes/AniminiBox'
import AniminiVanillaBox from './Boxes/AniminiVanillaBox'
import SpringBox from './Boxes/SpringBox'
import MotionBox from './Boxes/MotionBox'
import GsapBox from './Boxes/GsapBox'
import FramerMotionBox from './Boxes/FramerMotionBox'
import FatBox from './Boxes/FatBox'
import AnimeBox from './Boxes/AnimeBox'

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
      options: { AniminiBox, AniminiVanillaBox, AnimeBox, SpringBox, MotionBox, FramerMotionBox, GsapBox, FatBox }
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
