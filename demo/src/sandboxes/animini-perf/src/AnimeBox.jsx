import React, { useRef, useEffect } from 'react'
import anime from 'animejs'

export default function Box({ x, y, backgroundColor, scale, style }) {
  const ref = useRef()

  useEffect(() => {
    anime({
      targets: ref.current,
      translateX: x,
      translateY: y,
      scale,
      background: backgroundColor,
      easing: 'spring(1, 170, 26, 0)',
    })
  }, [x, y, backgroundColor, scale])

  return <div ref={ref} style={style} />
}
