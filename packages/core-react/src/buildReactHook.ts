import { useRef, useEffect, useState } from 'react'
import { buildAnimate, ConfigWithOptionalEl, Payload, Target } from '@animini/core'

type AnimateFunction = ReturnType<typeof buildAnimate>
type ApiType = ReturnType<AnimateFunction>

type HookReturnType<ElementType, C extends ConfigWithOptionalEl<ElementType>> = C['el'] extends ElementType
  ? ApiType
  : [React.RefObject<ElementType>, ApiType]

export function buildReactHook<ElementType, Values extends Payload>(target: Target<ElementType, Values>) {
  const animate = buildAnimate(target)

  return function useAnimini<ElementType, C extends ConfigWithOptionalEl<ElementType>>(
    masterConfig?: C
  ): HookReturnType<ElementType, C> {
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
      return [animate(_config as any), _el] as [ApiType, ElementType | undefined]
    })

    useEffect(() => {
      return () => api.clean()
    }, [api])

    if (_el) return api as any
    return [el, api] as any
  }
}
