import { useAniminiCore } from '@animini/core'
import * as target from './three'

export function useAnimini(fn) {
  return useAniminiCore(target, undefined, fn)
}
