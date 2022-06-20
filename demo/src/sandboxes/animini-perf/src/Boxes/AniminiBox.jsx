import React, { useEffect } from 'react'
import { useAnimate, spring } from '@animini/react-dom'

const config = { easing: spring() }

export default function Box({ x, y, backgroundColor, scale, style }) {
  const [ref, api] = useAnimate()

  useEffect(() => {
    api.start({ x, y, backgroundColor, scale }, config)
  }, [x, y, backgroundColor, scale, api])

  return <div ref={ref} style={style} />
}
