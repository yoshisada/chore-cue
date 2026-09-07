import { useSyncExternalStore } from 'react'
import { vi } from 'vitest'

import { mutate as bumpMutators } from '~/data/models/bumpEvent'
import { mutate as choreMutators } from '~/data/models/chore'
import { bumpsSentOnDate } from '~/data/queries/bump'
import { choreBoard } from '~/data/queries/chore'
import { membersByHouseholdId } from '~/data/queries/household'

import { createFakeZero } from './fakeZero'
import {
  buildMemberRows,
  HOUSEHOLD_ID,
  householdRow,
  VIEWER_MEMBER_ID,
  VIEWER_USER_ID,
} from './fixtures'

import type { FakeZero, Row } from './fakeZero'
import type { BumpSendInput } from '~/data/models/bumpEvent'
import type {
  ChoreArchiveInput,
  ChoreCompleteInput,
  ChoreCreateInput,
  ChoreEditInput,
} from '~/data/models/chore'
import type { ChoreRow } from '~/features/chorecue/choreMapping'

/**
 * the two modules `useChoreBoard` talks to the outside world through, replaced
 * by an in-memory pair that behaves like the real ones.
 *
 * reads: `useQuery` recognises the three query builders the board subscribes to
 * and serves the rows the real ZQL would return for them (household scope,
 * status filter, ordering), out of the same `fakeZero` store the writes land in.
 * it re-renders subscribers after every write, so a mutation is visible to the
 * next render exactly as a synced Zero query would be.
 *
 * writes: `zero.mutate.*` are spies over the REAL mutator bodies from
 * `~/data/models/chore` and `~/data/models/bumpEvent`, so a test that drives the
 * hook exercises the production write path — validation, derived identity,
 * compare-and-swap, the bump quota and the schema constraints included.
 */

export interface HouseholdContextValue {
  userId: string
  householdId: string
  householdName: string
  displayName: string
  isAuthenticated: boolean
  memberId: string
  role: 'admin' | 'member'
  timezone: string
}

export interface ZeroMockOptions {
  /** chore rows the board query serves */
  chores?: ChoreRow[]
  /** roster rows; defaults to Sam (the viewer) and Alex */
  members?: Row[]
  /** bump rows already spent today */
  bumps?: Row[]
  /** the authenticated user the mutators run as; `null` means signed out */
  userId?: string | null
  household?: Partial<HouseholdContextValue>
  /** keep the chore query in its pre-sync `unknown` state */
  loading?: boolean
}

interface MockState {
  store: FakeZero
  household: HouseholdContextValue
  userId: string | null
  loading: boolean
}

function defaultHousehold(): HouseholdContextValue {
  return {
    userId: VIEWER_USER_ID,
    householdId: HOUSEHOLD_ID,
    householdName: 'Test Household',
    displayName: 'Sam',
    isAuthenticated: true,
    memberId: VIEWER_MEMBER_ID,
    role: 'admin',
    timezone: 'UTC',
  }
}

function createState(options: ZeroMockOptions): MockState {
  return {
    store: createFakeZero({
      household: [householdRow],
      householdMember: options.members ?? buildMemberRows(),
      chore: options.chores ?? [],
      bumpEvent: options.bumps ?? [],
    }),
    household: { ...defaultHousehold(), ...options.household },
    userId: options.userId === undefined ? VIEWER_USER_ID : options.userId,
    loading: options.loading ?? false,
  }
}

let state = createState({})
let version = 0
const listeners = new Set<() => void>()
const rowCache = new Map<string, Row[]>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getVersion() {
  return version
}

/** a write landed: invalidate the cached query results and re-render readers */
function notify() {
  version += 1
  rowCache.clear()
  for (const listener of listeners) listener()
}

function compareIds(a: Row, b: Row): number {
  return String(a.id).localeCompare(String(b.id))
}

function queryRows(queryFn: unknown, props: Record<string, unknown>): Row[] {
  const { store } = state

  if (queryFn === choreBoard) {
    return store
      .rows('chore')
      .filter((row) => row.householdId === props.householdId && row.status === 'active')
      .sort((a, b) => a.nextDueAt - b.nextDueAt || compareIds(a, b))
  }

  if (queryFn === membersByHouseholdId) {
    return store
      .rows('householdMember')
      .filter((row) => row.householdId === props.householdId)
      .sort((a, b) => a.joinedAt - b.joinedAt || compareIds(a, b))
  }

  if (queryFn === bumpsSentOnDate) {
    return store
      .rows('bumpEvent')
      .filter(
        (row) =>
          row.senderMemberId === props.senderMemberId &&
          row.sentOnDate === props.sentOnDate
      )
      .sort((a, b) => a.dailySequence - b.dailySequence)
  }

  throw new Error('zeroMock: the board subscribed to an unexpected query')
}

/**
 * results are cached per (query, props, store version) so a re-render that
 * changed nothing hands the hook the same array identity a live Zero query
 * would — otherwise every `useMemo` downstream would recompute on every render.
 */
function cachedRows(queryFn: unknown, props: Record<string, unknown>): Row[] {
  const key = `${String((queryFn as { name?: string }).name)}:${JSON.stringify(props)}`
  const hit = rowCache.get(key)
  if (hit) return hit

  const rows = queryRows(queryFn, props)
  rowCache.set(key, rows)
  return rows
}

export type QueryInfo = { type: 'unknown' | 'complete' }

export function useQuery(
  queryFn: unknown,
  props: Record<string, unknown>,
  options?: { enabled?: boolean }
): [Row[] | undefined, QueryInfo] {
  useSyncExternalStore(subscribe, getVersion, getVersion)

  // a disabled query has nothing to say yet — the same shape Zero reports
  // before it knows anything about the result
  if (options?.enabled === false) return [undefined, { type: 'unknown' }]

  return [cachedRows(queryFn, props), { type: state.loading ? 'unknown' : 'complete' }]
}

export function useHouseholdContext(): HouseholdContextValue {
  useSyncExternalStore(subscribe, getVersion, getVersion)
  return state.household
}

async function applyMutation(run: () => Promise<void>): Promise<void> {
  try {
    await run()
  } finally {
    // a rejected write still re-renders: the board must be able to show the
    // rows as they actually are after a failure
    notify()
  }
}

export const zero = {
  mutate: {
    chore: {
      create: vi.fn((input: ChoreCreateInput) =>
        applyMutation(() =>
          choreMutators.create(state.store.context(state.userId), input)
        )
      ),
      edit: vi.fn((input: ChoreEditInput) =>
        applyMutation(() => choreMutators.edit(state.store.context(state.userId), input))
      ),
      complete: vi.fn((input: ChoreCompleteInput) =>
        applyMutation(() =>
          choreMutators.complete(state.store.context(state.userId), input)
        )
      ),
      archive: vi.fn((input: ChoreArchiveInput) =>
        applyMutation(() =>
          choreMutators.archive(state.store.context(state.userId), input)
        )
      ),
    },
    bumpEvent: {
      send: vi.fn((input: BumpSendInput) =>
        applyMutation(() => bumpMutators.send(state.store.context(state.userId), input))
      ),
    },
  },
}

const spies = [
  zero.mutate.chore.create,
  zero.mutate.chore.edit,
  zero.mutate.chore.complete,
  zero.mutate.chore.archive,
  zero.mutate.bumpEvent.send,
]

/** fresh store, fresh household, fresh spies — call before mounting the hook */
export function resetZeroMock(options: ZeroMockOptions = {}): FakeZero {
  state = createState(options)
  version += 1
  rowCache.clear()
  // hooks left mounted by an earlier board in the same test must not be woken
  // by the next board's store
  listeners.clear()
  for (const spy of spies) spy.mockClear()
  return state.store
}

/** the module factory for `vi.mock('~/zero/client', ...)` */
export function zeroClientMock() {
  return { useQuery, zero }
}

/** the module factory for `vi.mock('.../useHouseholdContext', ...)` */
export function householdContextMock() {
  return { useHouseholdContext }
}
