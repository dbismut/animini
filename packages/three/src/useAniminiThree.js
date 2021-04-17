import { useAniminiCore } from '@animini/core'
import * as target from './three'

export function useAnimini(motion) {
  return useAniminiCore(motion, target)
}
