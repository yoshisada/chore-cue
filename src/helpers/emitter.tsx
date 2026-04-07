import { dequal } from 'dequal'
import * as React from 'react'
import { useLayoutEffect, useState } from 'react'

type EmitterOptions<T> = {
  name: string
  silent?: boolean
  comparator?: (a: T, b: T) => boolean
}

type CreateEmitterOpts<T> = {
  silent?: boolean
  comparator?: (a: T, b: T) => boolean
}

export class Emitter<const T> {
  private disposables = new Set<(cb: any) => void>()
  value: T
  options?: EmitterOptions<T>

  constructor(value: T, options?: EmitterOptions<T>) {
    this.value = value
    this.options = options
  }

  listen = (disposable: (cb: T) => void): (() => void) => {
    this.disposables.add(disposable)
    return (): void => {
      this.disposables.delete(disposable)
    }
  }

  emit = (next: T): void => {
    if (process.env.NODE_ENV === 'development') {
      setCache(this, next)
    }
    const compare = this.options?.comparator
    if (compare) {
      if (this.value && compare(this.value, next)) {
        return
      }
    } else {
      if (this.value === next) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[emitter] ${this.options?.name} no comparator option but received same value!`
          )
        }
      }
    }
    this.value = next
    this.disposables.forEach((cb) => cb(next))
  }

  nextValue = (): Promise<T> => {
    return new Promise<T>((res) => {
      const dispose = this.listen((val) => {
        dispose()
        res(val)
      })
    })
  }
}

export function createEmitter<T>(
  name: string,
  defaultValue: T,
  options?: CreateEmitterOpts<T>
): Emitter<T> {
  const existing = createOrUpdateCache(name, defaultValue) as T
  return new Emitter<T>(existing || defaultValue, { name, ...options })
}

export type EmitterType<E extends Emitter<any>> =
  E extends Emitter<infer Val> ? Val : never

function useGet<A>(currentValue: A): () => A {
  const curRef = React.useRef<any>(currentValue)

  useLayoutEffect(() => {
    curRef.current = currentValue
  })

  // oxlint-disable-next-line exhaustive-deps
  return React.useCallback(() => curRef.current, [curRef])
}

export const useEmitter = <E extends Emitter<any>>(
  emitter: E,
  cb: (cb: EmitterType<E>) => void
): void => {
  const getCallback = useGet(cb)

  useLayoutEffect(() => {
    return emitter.listen((val) => {
      getCallback()(val)
    })
  }, [emitter, getCallback])
}

export const useEmitterValue = <E extends Emitter<any>>(
  emitter: E,
  options?: { disable?: boolean }
): EmitterType<E> => {
  const disabled = options?.disable

  const [state, setState] = useState<EmitterType<E>>(() => emitter.value)

  useLayoutEffect(() => {
    if (disabled) return

    if (emitter.value !== state) {
      setState(emitter.value)
    }

    return emitter.listen(setState)
  }, [state, disabled, emitter])

  return state
}

export const isEqualNever = (_a: any, _b: any) => false

const HMRCache =
  process.env.NODE_ENV === 'development'
    ? new Map<string, { originalDefaultValue: unknown; currentValue: unknown }>()
    : null

function setCache(emitter: Emitter<any>, value: unknown) {
  const name = emitter.options?.name
  if (!name) return
  const cache = HMRCache?.get(name)
  if (!cache) return
  cache.currentValue = value
}

function createOrUpdateCache(name: string, defaultValueProp: unknown) {
  const existing = HMRCache?.get(name)
  const defaultValue = dequal(existing?.originalDefaultValue, defaultValueProp)
    ? existing?.currentValue
    : defaultValueProp

  if (!existing) {
    HMRCache?.set(name, {
      originalDefaultValue: defaultValueProp,
      currentValue: defaultValue,
    })
  }

  return defaultValue
}
