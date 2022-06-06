import { buildAnimate } from '@animini/core'
import { dom } from '@animini/target-dom'
export * from '@animini/core/algorithms'

export const animate = buildAnimate(dom)
