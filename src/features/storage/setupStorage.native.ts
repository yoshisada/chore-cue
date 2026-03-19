import Constants, { ExecutionEnvironment } from 'expo-constants'
import { setStorageDriver } from '@take-out/helpers'

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient

if (isExpoGo) {
  // NitroModules (e.g. react-native-mmkv) are not supported in Expo Go.
  // Use in-memory storage so the app still runs; data does not persist.
  const memory = new Map<string, string>()
  setStorageDriver({
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => {
      memory.set(key, value)
    },
    removeItem: (key) => memory.delete(key),
    getAllKeys: () => Array.from(memory.keys()),
  })
} else {
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv')
  const mmkv = createMMKV({ id: 'app-storage-2' })
  setStorageDriver({
    getItem: (key) => mmkv.getString(key) ?? null,
    setItem: (key, value) => mmkv.set(key, value),
    removeItem: (key) => mmkv.remove(key),
    getAllKeys: () => mmkv.getAllKeys(),
  })
}
