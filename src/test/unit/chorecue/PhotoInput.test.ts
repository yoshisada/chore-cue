// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import { renderBoard } from './boardHarness'
import { buildChoreRow } from './fixtures'

vi.mock('~/zero/client', async () => (await import('./zeroMock')).zeroClientMock())
vi.mock('~/features/auth/client/useHouseholdContext', async () =>
  (await import('./zeroMock')).householdContextMock()
)

describe('PhotoInput – attach and clear behavior via board state', () => {
  it('new chore gets photo label from composer', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Clean oven')
    await board.setComposer('tags', ['Kitchen'])
    await board.setComposer('photoLabel', 'oven-before.jpg')
    await board.addChore()

    expect(board.visible()[0]?.photoLabel).toBe('oven-before.jpg')
  })

  it('new chore has null photo when composer photo is empty', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Clean oven')
    await board.setComposer('tags', ['Kitchen'])
    await board.setComposer('photoLabel', '')
    await board.addChore()

    expect(board.visible()[0]?.photoLabel).toBeNull()
  })

  it('the attach and clear actions drive the composer photo label', async () => {
    const board = renderBoard({ chores: [] })

    await board.run((current) => current.attachComposerPhoto())
    expect(board.board().composer.photoLabel).toBe('kitchen-reference.jpg')

    await board.run((current) => current.clearComposerPhoto())
    expect(board.board().composer.photoLabel).toBe('')
  })

  it('the attach and clear actions drive the editor photo label', async () => {
    const board = renderBoard({ chores: [buildChoreRow({ id: 'c1' })] })
    await board.beginEdit('c1')

    await board.run((current) => current.attachEditorPhoto())
    expect(board.board().editor.photoLabel).toBe('updated-reference.jpg')

    await board.run((current) => current.clearEditorPhoto())
    expect(board.board().editor.photoLabel).toBe('')
  })

  it('editing adds a photo to an existing chore', async () => {
    const board = renderBoard({ chores: [buildChoreRow({ id: 'c1', photoLabel: null })] })
    await board.beginEdit('c1')
    await board.setEditor('photoLabel', 'new-photo.jpg')
    await board.saveEdit()

    expect(board.card('c1')?.photoLabel).toBe('new-photo.jpg')
  })

  it('editing clears the photo from an existing chore', async () => {
    const board = renderBoard({
      chores: [buildChoreRow({ id: 'c1', photoLabel: 'old-photo.jpg' })],
    })
    await board.beginEdit('c1')
    await board.setEditor('photoLabel', '')
    await board.saveEdit()

    expect(board.card('c1')?.photoLabel).toBeNull()
  })

  it('editing replaces an existing photo', async () => {
    const board = renderBoard({
      chores: [buildChoreRow({ id: 'c1', photoLabel: 'old.jpg' })],
    })
    await board.beginEdit('c1')
    await board.setEditor('photoLabel', 'new.jpg')
    await board.saveEdit()

    expect(board.card('c1')?.photoLabel).toBe('new.jpg')
  })

  it('composer photo resets after adding a chore', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Task')
    await board.setComposer('tags', ['General'])
    await board.setComposer('photoLabel', 'photo.jpg')
    await board.addChore()

    expect(board.board().composer.photoLabel).toBe('')
  })
})
