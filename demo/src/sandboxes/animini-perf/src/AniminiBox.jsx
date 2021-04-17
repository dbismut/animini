import React, { useEffect } from 'react'
import { useAnimini } from '@animini/dom'

export default function Box({ x, y, backgroundColor, scale, style }) {
  const [ref, api] = useAnimini('spring')

  useEffect(() => {
    api.start({ x, y, backgroundColor, scale })
  }, [x, y, backgroundColor, scale, api])

  return <div ref={ref} style={style} />
}
