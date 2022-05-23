// this needs some love
export type Styles = Record<keyof CSSStyleDeclaration, number | string> & {
  x: number
  y: number
  scale: number
}
