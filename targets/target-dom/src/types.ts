import { Adapter } from '@animini/core'

// this needs some love
export type Styles = Record<keyof CSSStyleDeclaration, number | string> & {
  x: number | string
  y: number | string
  scale: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  skew: number
  rotation: number
  scrollTop: number | string
  scrollLeft: number | string
}

export type Transform = {
  scale: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  skew: number
  rotate: number
  x: number
  y: number
}

export type DomAdapter = Adapter<HTMLElement | Window>
