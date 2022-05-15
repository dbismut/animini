import type { Object3D, Material } from 'three'

export type ElementType = Object3D | Material

// this also needs some love
export type Values<Element> = Record<
  keyof React.PropsWithoutRef<Element>,
  string | number | Record<string, number> | number[]
>
