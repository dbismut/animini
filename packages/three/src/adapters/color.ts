import { ThreeAdapter } from '../types'
import { Color } from 'three'

const kk = new Color()

export const color: ThreeAdapter = {
  parse(str: string) {
    return kk.set(str) as unknown as Record<string, number>
  }
}
