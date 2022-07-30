import { Adapter } from '@animini/core'
import type { Object3D, Material } from 'three'

export type ElementType = Object3D | Material

// TODO this also needs some love
export type ThreeValues<Element extends ElementType> = Record<
  keyof Element,
  string | number | Record<string, number> | number[]
>

export type ThreeAdapter = Adapter<ElementType>
