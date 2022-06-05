import React, { useEffect, useRef } from 'react'
import { animate, spring } from '@animini/dom'

const config = { easing: spring() }

export default function Box({ x, y, backgroundColor, scale, style }) {
  const ref = useRef()
  const apiRef = useRef()

  useEffect(() => {
    apiRef.current = apiRef.current || animate(ref.current)
    apiRef.current.start({ x, y, backgroundColor, scale }, config)
  }, [x, y, backgroundColor, scale])

  return <div ref={ref} style={style} />
}
