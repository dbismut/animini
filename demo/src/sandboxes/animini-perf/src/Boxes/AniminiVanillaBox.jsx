import React, { useEffect, useRef } from 'react'
import { animate, spring } from '@animini/dom'

const config = { easing: spring() }

export default function Box({ x, y, backgroundColor, scale, style }) {
  const ref = useRef()

  useEffect(() => {
    animate({ el: ref.current, x, y, backgroundColor, scale }, config)
  }, [x, y, backgroundColor, scale])

  return <div ref={ref} style={style} />
}
