import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function Box({ x, y, backgroundColor, scale, style }) {
  const ref = useRef()

  useEffect(() => {
    gsap.to(ref.current, {
      x,
      y,
      scale,
      backgroundColor
    })
  }, [x, y, backgroundColor, scale])

  return <div ref={ref} style={style} />
}
