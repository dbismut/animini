import React from 'react'
import { a, useSpring } from '@react-spring/web'

export default function Box({ x, y, backgroundColor, scale, style }) {
  const spring = useSpring({ x, y, backgroundColor, scale })

  return <a.div style={{ ...style, ...spring }} />
}
