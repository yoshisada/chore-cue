import { act, renderHook } from '@testing-library/react'

import { useChoreBoard } from '~/features/chorecue/useChoreBoard'

import { FIXED_NOW } from './fixtures'
import { resetZeroMock, zero } from './zeroMock'

import type { Row } from './fakeZero'
import type { ZeroMockOptions } from './zeroMock'
import type { ChoreRow } from '~/features/chorecue/choreMapping'
import type {
  ChoreCard,
  ChoreComposerState,
  ChoreEditorState,
} from '~/features/chorecue/types'

/**
 * mounts the REAL `useChoreBoard` against the mocked Zero client.
 *
 * every action goes through `act`, so the assertions that follow read the
 * board after React has flushed the state the mutation produced — the same
 * ordering the UI sees. `board()` always returns the latest hook result rather
 * than a snapshot, because the hook's callbacks are recreated per render.
 */

export type Board = ReturnType<typeof useChoreBoard>

/**
 * a chore row as it sits in the store: the columns the card is mapped from,
 * plus the bookkeeping ones (`createdByMemberId`, `lastCompletedByMemberId`)
 * that only the mutators write.
 */
export type StoredChoreRow = ChoreRow & Row

export interface BoardHarnessOptions extends ZeroMockOptions {
  now?: number
}

export function renderBoard(options: BoardHarnessOptions = {}) {
  const { now = FIXED_NOW, ...mockOptions } = options
  const store = resetZeroMock(mockOptions)

  const view = renderHook(({ now: at }: { now: number }) => useChoreBoard({ now: at }), {
    initialProps: { now },
  })

  const board = (): Board => view.result.current

  async function run<T>(fn: (current: Board) => T | Promise<T>): Promise<T> {
    let out!: T
    await act(async () => {
      out = await fn(view.result.current)
    })
    return out
  }

  function visible(): ChoreCard[] {
    const { sections } = board()
    return [...sections.overdue, ...sections.dueSoon, ...sections.upcoming]
  }

  function rows(): StoredChoreRow[] {
    return store.rows('chore') as StoredChoreRow[]
  }

  return {
    store,
    zero,
    board,
    run,
    unmount: view.unmount,

    /** every chore the board is currently showing, in section order */
    visible,
    card: (choreId: string) => visible().find((chore) => chore.id === choreId),
    rows,
    row: (choreId: string) => rows().find((row) => row.id === choreId),
    bumps: () => store.rows('bumpEvent'),

    /** re-render the board at a different instant, as the clock tick would */
    setNow: async (next: number) => {
      await act(async () => {
        view.rerender({ now: next })
      })
    },

    setComposer: <Key extends keyof ChoreComposerState>(
      key: Key,
      value: ChoreComposerState[Key]
    ) => run((current) => current.updateComposer(key, value)),
    setEditor: <Key extends keyof ChoreEditorState>(
      key: Key,
      value: ChoreEditorState[Key]
    ) => run((current) => current.updateEditor(key, value)),

    addChore: () => run((current) => current.addChore()),
    completeChore: (choreId: string) => run((current) => current.completeChore(choreId)),
    sendBump: (choreId: string) => run((current) => current.sendBump(choreId)),
    beginEdit: (choreId: string) => run((current) => current.beginEdit(choreId)),
    cancelEdit: () => run((current) => current.cancelEdit()),
    saveEdit: () => run((current) => current.saveEdit()),
    archiveChore: (choreId: string) => run((current) => current.archiveChore(choreId)),
    search: (query: string) => run((current) => current.setSearchQuery(query)),
    toggleTag: (tag: string) => run((current) => current.toggleTag(tag)),
    clearTagFilter: () => run((current) => current.clearTagFilter()),
  }
}

export type BoardHarness = ReturnType<typeof renderBoard>
