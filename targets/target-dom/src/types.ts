import { Adapter } from '@animini/core'

// this needs some love
export type Styles = Record<keyof CSSStyleDeclaration, number | string> & {
  x: number | string
  y: number | string
  scale: number
  scrollTop: number | string
  scrollLeft: number | string
}

export type Transform = { scale: number; x: number; y: number; z: number }

export type DomAdapter = Adapter<HTMLElement>
