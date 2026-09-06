import { useMemo, useState } from 'react'

import {
  addChoreToBoard,
  archiveChoreInBoard,
  beginEditForBoard,
  collectAllTags,
  completeChoreInBoard,
  createSections,
  emptyComposer,
  emptyEditorState,
  filterBySearch,
  filterByTags,
  initialBumpCount,
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
  const [bumpCount, setBumpCount] = useState(initialBumpCount)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const sorted = useMemo(() => sortVisibleChores(chores), [chores])
  const afterSearch = useMemo(
    () => filterBySearch(sorted, searchQuery),
    [sorted, searchQuery]
  )
  const allTags = useMemo(() => collectAllTags(afterSearch), [afterSearch])
  const filtered = useMemo(
    () => filterByTags(afterSearch, selectedTags),
    [afterSearch, selectedTags]
  )
  const sections = useMemo(() => createSections(filtered), [filtered])

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

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      const next = new Set(current)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }

  function clearTagFilter() {
    setSelectedTags(new Set())
  }

  return {
    sections,
    allTags,
    selectedTags,
    searchQuery,
    setSearchQuery,
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
    toggleTag,
    clearTagFilter,
  }
}
