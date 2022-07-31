import { useRef, useEffect, useState } from 'react'
import { ApiType, buildAnimate, ConfigWithOptionalEl, Payload, Target } from '@animini/core'

type HookReturnType<ElementType, Values, C extends ConfigWithOptionalEl<ElementType>> = C['el'] extends ElementType
  ? ApiType<Values>
  : [React.RefObject<ElementType>, ApiType<Values>]

export function buildReactHook<ElementType, BuildValues extends Payload>(target: Target<ElementType, BuildValues>) {
  const animate = buildAnimate(target)

  return function useAnimate<
    ElementType,
    C extends ConfigWithOptionalEl<ElementType>,
    Values extends BuildValues = BuildValues
  >(masterConfig?: C): HookReturnType<ElementType, Values, C> {
    const el = useRef<ElementType>(null)

    const [[_el, api]] = useState(() => {
      let _el
      let _config = masterConfig
      if (_config && 'el' in _config) {
        _el = _config.el
      } else {
        // @ts-ignore
        _config = { ...masterConfig, el }
      }
      return [_el, animate(_config as any)] as [ElementType | undefined, ApiType<Values>]
    })

    useEffect(() => {
      return () => api.clean()
    }, [api])

    if (_el) return api as any
    return [el, api] as any
  }
}
