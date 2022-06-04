import { useRef, useEffect, useState } from 'react'
import { buildAnimate, Config, Payload, Target } from '@animini/core'

export function buildReactHook<ElementType, ValueType extends Payload>(target: Target<ElementType, ValueType>) {
  const animate = buildAnimate(target)

  return function useAnimini<ElementType>(masterConfig?: Config) {
    const el = useRef<ElementType>(null)
    const [api] = useState(() => animate(el as any, masterConfig))

    useEffect(() => {
      api.setCachedValues()
      return () => api.clean()
    }, [api])

    return [el, api] as [typeof el, typeof api]
  }
}
