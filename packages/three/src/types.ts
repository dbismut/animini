import { Adapter } from '@animini/core'
import type { Object3D, Material } from 'three'

export type ElementType = Object3D | Material

// this also needs some love
export type Values<Element extends ElementType> = Record<
  keyof React.PropsWithoutRef<Element>,
  string | number | Record<string, number> | number[]
>

export type ThreeAdapter = Adapter<ElementType, Values<ElementType>>
