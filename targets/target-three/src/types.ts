import { Adapter } from '@animini/core'
import type { Object3D, Material } from 'three'

export type ThreeElementType = Object3D | Material

// TODO this also needs some love
export type ThreeValues<Element extends ThreeElementType> = Record<
  keyof Element,
  string | number | Record<string, number> | number[]
>

export type ThreeAdapter = Adapter<ThreeElementType>
