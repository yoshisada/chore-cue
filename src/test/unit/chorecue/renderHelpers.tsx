import {
  addChoreToBoard,
  archiveChoreInBoard,
  beginEditForBoard,
  completeChoreInBoard,
  createSections,
  emptyComposer,
  emptyEditorState,
  initialBumpCount,
  saveEditedChore,
  sendBumpForBoard,
  sortVisibleChores,
} from '~/features/chorecue/boardState'

import type {
  ChoreCard,
  ChoreComposerState,
  ChoreEditorState,
} from '~/features/chorecue/types'

/**
 * Simulates the useChoreBoard hook as a plain object for testing
 * without React rendering infrastructure.
 */
export function createBoardDriver(initialChores: ChoreCard[]) {
  let chores = initialChores
  let composer: ChoreComposerState = { ...emptyComposer }
  let editor: ChoreEditorState = { ...emptyEditorState }
  let bumpCount = initialBumpCount

  function getSections() {
    const sorted = sortVisibleChores(chores)
    return createSections(sorted)
  }

  return {
    get chores() {
      return chores
    },
    get composer() {
      return composer
    },
    get editor() {
      return editor
    },
    get bumpCount() {
      return bumpCount
    },
    get sections() {
      return getSections()
    },
    updateComposer<K extends keyof ChoreComposerState>(
      key: K,
      value: ChoreComposerState[K]
    ) {
      composer = { ...composer, [key]: value }
    },
    addChore() {
      chores = addChoreToBoard(chores, composer)
      composer = { ...emptyComposer }
    },
    completeChore(choreId: string) {
      chores = completeChoreInBoard(chores, choreId)
    },
    sendBump(choreId: string) {
      const result = sendBumpForBoard(chores, choreId, bumpCount)
      bumpCount = result.bumpCount
      chores = result.chores
      return result.accepted
    },
    beginEdit(choreId: string) {
      editor = beginEditForBoard(chores, choreId)
    },
    updateEditor<K extends keyof ChoreEditorState>(key: K, value: ChoreEditorState[K]) {
      editor = { ...editor, [key]: value }
    },
    saveEdit() {
      const result = saveEditedChore(chores, editor)
      chores = result.chores
      editor = result.editor
    },
    archiveChore(choreId: string) {
      const result = archiveChoreInBoard(chores, choreId, editor)
      chores = result.chores
      editor = result.editor
    },
  }
}
