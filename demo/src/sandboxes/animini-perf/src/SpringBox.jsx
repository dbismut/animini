import React from 'react'
import { a, useSpring } from '@react-spring/web'

export default function Box({ x, y, style }) {
  const spring = useSpring({ x, y })

  return <a.div style={{ ...style, ...spring }} />
}
