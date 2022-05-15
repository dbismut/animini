// this needs some love
export type Styles = Record<keyof CSSStyleDeclaration, number | string> & {
  x: number | string
  y: number | string
  scale: number
}
