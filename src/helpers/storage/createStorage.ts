import { getStorageDriver } from './driver'

const namespaces = new Set<string>()

export interface Storage<K extends string = string, V = unknown> {
  get(key: K): V | undefined
  set(key: K, value: V): void
  remove(key: K): void
  has(key: K): boolean
  keys(): K[]
  clear(): void
  getItem(key: K): string | null
  setItem(key: K, value: string): void
}

export function createStorage<K extends string, V>(namespace: string): Storage<K, V> {
  if (namespaces.has(namespace)) {
    throw new Error(`storage namespace already exists: ${namespace}`)
  }
  namespaces.add(namespace)

  const prefix = `${namespace}:`
  const prefixKey = (key: string) => `${prefix}${key}`

  return {
    get(key: K): V | undefined {
      const driver = getStorageDriver()
      if (!driver) return undefined
      const raw = driver.getItem(prefixKey(key))
      if (raw == null) return undefined
      try {
        return JSON.parse(raw)
      } catch {
        return undefined
      }
    },

    set(key: K, value: V): void {
      const driver = getStorageDriver()
      if (!driver) return
      driver.setItem(prefixKey(key), JSON.stringify(value))
    },

    remove(key: K): void {
      const driver = getStorageDriver()
      if (!driver) return
      driver.removeItem(prefixKey(key))
    },

    has(key: K): boolean {
      const driver = getStorageDriver()
      if (!driver) return false
      return driver.getItem(prefixKey(key)) != null
    },

    keys(): K[] {
      const driver = getStorageDriver()
      if (!driver) return []
      return driver
        .getAllKeys()
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length) as K)
    },

    clear(): void {
      const driver = getStorageDriver()
      if (!driver) return
      for (const key of this.keys()) {
        driver.removeItem(prefixKey(key))
      }
    },

    getItem(key: K): string | null {
      const driver = getStorageDriver()
      if (!driver) return null
      return driver.getItem(prefixKey(key)) ?? null
    },

    setItem(key: K, value: string): void {
      const driver = getStorageDriver()
      if (!driver) return
      driver.setItem(prefixKey(key), value)
    },
  }
}

export interface StorageValue<T> {
  get(): T | undefined
  set(value: T): void
  remove(): void
  has(): boolean
}

export function createStorageValue<T>(key: string): StorageValue<T> {
  const storage = createStorage<'value', T>(`_v:${key}`)
  return {
    get: (): T | undefined => storage.get('value'),
    set: (value: T): void => storage.set('value', value),
    remove: (): void => storage.remove('value'),
    has: (): boolean => storage.has('value'),
  }
}
