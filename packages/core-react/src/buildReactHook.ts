import { useRef, useEffect, useState } from 'react'
import { ApiType, buildAnimate, ConfigWithOptionalEl, Payload, Target } from '@animini/core'

type HookReturnType<ElementType, Values, C extends ConfigWithOptionalEl<ElementType>> = C['el'] extends ElementType
  ? ApiType<Values>
  : [React.RefObject<ElementType>, ApiType<Values>]

export function buildReactHook<ElementType, Values extends Payload>(target: Target<ElementType, Values>) {
  const animate = buildAnimate(target)

  return function useAnimate<ElementType, C extends ConfigWithOptionalEl<ElementType>>(
    masterConfig?: C
  ): HookReturnType<ElementType, Values, C> {
    const el = useRef<ElementType>(null)

    const [[api, _el]] = useState(() => {
      let _el
      let _config = masterConfig
      if (_config && 'el' in _config) {
        _el = _config.el
      } else {
        // @ts-ignore
        _config = { ...masterConfig, el }
      }
      return [animate(_config as any), _el] as [ApiType<Values>, ElementType | undefined]
    })

    useEffect(() => {
      return () => api.clean()
    }, [api])

    if (_el) return api as any
    return [el, api] as any
  }
}
