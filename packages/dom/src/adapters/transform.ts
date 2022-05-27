import { Adapter } from 'packages/core/src'

export const transform: Adapter = {
  parse(value) {
    return parseFloat(value)
  }
}
