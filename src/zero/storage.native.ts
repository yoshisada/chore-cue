import Constants, { ExecutionEnvironment } from 'expo-constants'
import type { opSQLiteStoreProvider } from '@rocicorp/zero/op-sqlite'

type StoreProvider = ReturnType<typeof opSQLiteStoreProvider>

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient

export function createKVStore(_userId: string | null): StoreProvider | 'mem' {
  if (isExpoGo) {
    return 'mem'
  }
  const { opSQLiteStoreProvider } = require('@rocicorp/zero/op-sqlite') as {
    opSQLiteStoreProvider: () => StoreProvider
  }
  return opSQLiteStoreProvider()
}
