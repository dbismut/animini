import React, { useRef, useEffect } from 'react'
import { animate, spring } from 'motion'

const easing = spring({ damping: 26, stiffness: 170 })

export default function Box({ x, y, backgroundColor, scale, style }) {
  const ref = useRef()

  useEffect(() => {
    animate(
      ref.current,
      {
        x,
        y,
        scale,
        backgroundColor
      },
      { easing }
    )
  }, [x, y, backgroundColor, scale])

  return <div ref={ref} style={style} />
}
