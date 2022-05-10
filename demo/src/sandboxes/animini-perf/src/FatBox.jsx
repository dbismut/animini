import React, { useRef, useEffect } from 'react'
import fat from './fat'

export default function Box({ x, y, backgroundColor, scale, style }) {
  const ref = useRef()

  useEffect(() => {
    fat.animate(ref.current, {
      translateX: x + 'px',
      translateY: y + 'px',
      scaleX: scale,
      scaleY: scale,
      backgroundColor,
    })
  }, [x, y, backgroundColor, scale])

  return <div ref={ref} style={style} />
}
