import { Adapter } from '@animini/core'

export const transform: Adapter = {
  parse(value) {
    return parseFloat(value)
  }
}
