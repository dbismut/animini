import { useRef, useEffect, useMemo } from 'react'
import { buildAnimate, Config, Payload, Target } from '@animini/core'

export function buildReactHook<ElementType, ValueType extends Payload>(target: Target<ElementType, ValueType>) {
  const animate = buildAnimate(target)

  return function useAnimini<ElementType>(currentValues: any, masterConfig?: Config) {
    const el = useRef<ElementType>(null)
    // @ts-ignore
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const api = useMemo(() => animate(el, currentValues, masterConfig), [currentValues, target])

    useEffect(() => {
      return () => api.clean()
    }, [api])

    return [el, api] as [typeof el, typeof api]
  }
}
