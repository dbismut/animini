import React, { useEffect } from 'react'
import { useAnimini } from 'animini'
import { spring } from 'animini/spring'

export default function Box({ x, y, style }) {
  const [ref, api] = useAnimini(spring)

  useEffect(() => {
    api.start({ x, y })
  }, [x, y])

  return <div ref={ref} style={style} />
}
