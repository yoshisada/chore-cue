import { useMemo, useState } from 'react'

import {
  addChoreToBoard,
  archiveChoreInBoard,
  beginEditForBoard,
  completeChoreInBoard,
  createSections,
  emptyComposer,
  emptyEditorState,
  initialChores,
  saveEditedChore,
  sendBumpForBoard,
  sortVisibleChores,
} from './boardState'
import type { ChoreCard, ChoreComposerState, ChoreEditorState } from './types'


export function useChoreBoard() {
  const [chores, setChores] = useState<ChoreCard[]>(initialChores)
  const [composer, setComposer] = useState<ChoreComposerState>(emptyComposer)
  const [editor, setEditor] = useState<ChoreEditorState>(emptyEditorState)
  const [bumpCount, setBumpCount] = useState(2)

  const sorted = useMemo(() => sortVisibleChores(chores), [chores])
  const sections = useMemo(() => createSections(sorted), [sorted])

  function updateComposer<Key extends keyof ChoreComposerState>(
    key: Key,
    value: ChoreComposerState[Key]
  ) {
    setComposer((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function addChore() {
    setChores((current) => addChoreToBoard(current, composer))
    setComposer(emptyComposer)
  }

  function completeChore(choreId: string) {
    setChores((current) => completeChoreInBoard(current, choreId))
  }

  function sendBump(choreId: string) {
    const result = sendBumpForBoard(chores, choreId, bumpCount)
    setBumpCount(result.bumpCount)
    setChores(result.chores)
    return result.accepted
  }

  function beginEdit(choreId: string) {
    setEditor(beginEditForBoard(chores, choreId))
  }

  function updateEditor<Key extends keyof ChoreEditorState>(
    key: Key,
    value: ChoreEditorState[Key]
  ) {
    setEditor((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function saveEdit() {
    const result = saveEditedChore(chores, editor)
    setChores(result.chores)
    setEditor(result.editor)
  }

  function archiveChore(choreId: string) {
    const result = archiveChoreInBoard(chores, choreId, editor)
    setChores(result.chores)
    setEditor(result.editor)
  }

  function attachComposerPhoto() {
    setComposer((current) => ({
      ...current,
      photoLabel: 'kitchen-reference.jpg',
    }))
  }

  function clearComposerPhoto() {
    setComposer((current) => ({
      ...current,
      photoLabel: '',
    }))
  }

  function attachEditorPhoto() {
    setEditor((current) => ({
      ...current,
      photoLabel: 'updated-reference.jpg',
    }))
  }

  function clearEditorPhoto() {
    setEditor((current) => ({
      ...current,
      photoLabel: '',
    }))
  }

  return {
    sections,
    composer,
    editor,
    bumpCount,
    updateComposer,
    addChore,
    completeChore,
    sendBump,
    beginEdit,
    updateEditor,
    saveEdit,
    archiveChore,
    attachComposerPhoto,
    clearComposerPhoto,
    attachEditorPhoto,
    clearEditorPhoto,
  }
}
