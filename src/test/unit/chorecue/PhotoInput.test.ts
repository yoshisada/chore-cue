import { describe, expect, it } from 'vitest'

import { buildChoreRow } from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('PhotoInput – attach and clear behavior via board state', () => {
  it('new chore gets photo label from composer', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Clean oven')
    board.updateComposer('tags', ['Kitchen'])
    board.updateComposer('photoLabel', 'oven-before.jpg')
    await board.addChore()

    expect(board.chores[0]?.photoLabel).toBe('oven-before.jpg')
  })

  it('new chore has null photo when composer photo is empty', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Clean oven')
    board.updateComposer('tags', ['Kitchen'])
    board.updateComposer('photoLabel', '')
    await board.addChore()

    expect(board.chores[0]?.photoLabel).toBeNull()
  })

  it('editing adds a photo to an existing chore', async () => {
    const board = createBoardDriver([buildChoreRow({ id: 'c1', photoLabel: null })])
    board.beginEdit('c1')
    board.updateEditor('photoLabel', 'new-photo.jpg')
    await board.saveEdit()

    expect(board.chores.find((c) => c.id === 'c1')?.photoLabel).toBe('new-photo.jpg')
  })

  it('editing clears the photo from an existing chore', async () => {
    const board = createBoardDriver([
      buildChoreRow({ id: 'c1', photoLabel: 'old-photo.jpg' }),
    ])
    board.beginEdit('c1')
    board.updateEditor('photoLabel', '')
    await board.saveEdit()

    expect(board.chores.find((c) => c.id === 'c1')?.photoLabel).toBeNull()
  })

  it('editing replaces an existing photo', async () => {
    const board = createBoardDriver([buildChoreRow({ id: 'c1', photoLabel: 'old.jpg' })])
    board.beginEdit('c1')
    board.updateEditor('photoLabel', 'new.jpg')
    await board.saveEdit()

    expect(board.chores.find((c) => c.id === 'c1')?.photoLabel).toBe('new.jpg')
  })

  it('composer photo resets after adding a chore', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Task')
    board.updateComposer('tags', ['General'])
    board.updateComposer('photoLabel', 'photo.jpg')
    await board.addChore()

    expect(board.composer.photoLabel).toBe('')
  })
})
