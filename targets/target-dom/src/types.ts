import { Adapter } from '@animini/core'

// this needs some love
export type Styles = Record<keyof CSSStyleDeclaration, number | string> & {
  x: number | string
  y: number | string
  scale: number
}

export type DomAdapter = Adapter<HTMLElement>
