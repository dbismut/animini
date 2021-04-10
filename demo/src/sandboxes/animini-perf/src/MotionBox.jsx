import React from 'react'
import { motion } from 'framer-motion'

const spring = {
  type: 'spring',
  damping: 26,
  stiffness: 170,
}

export default function Box({ x, y, backgroundColor, scale, style }) {
  return <motion.div transition={spring} animate={{ x, y, backgroundColor, scale }} style={style} />
}
