// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import { renderBoard } from './boardHarness'
import { buildMixedRows } from './fixtures'

vi.mock('~/zero/client', async () => (await import('./zeroMock')).zeroClientMock())
vi.mock('~/features/auth/client/useHouseholdContext', async () =>
  (await import('./zeroMock')).householdContextMock()
)

describe('useChoreBoard – default state and section ordering', () => {
  it('groups chores into overdue, dueSoon, and upcoming sections', () => {
    const { board } = renderBoard({ chores: buildMixedRows() })
    const { sections } = board()

    expect(sections.overdue).toHaveLength(1)
    expect(sections.dueSoon).toHaveLength(1)
    expect(sections.upcoming).toHaveLength(1)
  })

  it('returns sections in overdue → dueSoon → upcoming order', () => {
    const { visible } = renderBoard({ chores: buildMixedRows() })
    const allChores = visible()

    expect(allChores[0]?.dueBucket).toBe('overdue')
    expect(allChores[1]?.dueBucket).toBe('dueSoon')
    expect(allChores[2]?.dueBucket).toBe('upcoming')
  })

  it('returns empty sections when Zero has no rows yet', () => {
    const { board } = renderBoard({ chores: [] })
    const { sections } = board()

    expect(sections.overdue).toHaveLength(0)
    expect(sections.dueSoon).toHaveLength(0)
    expect(sections.upcoming).toHaveLength(0)
    expect(board().hasAnyChores).toBe(false)
  })

  it('starts with an empty composer, defaulted to the first member', () => {
    const { board } = renderBoard({ chores: buildMixedRows() })

    expect(board().composer.title).toBe('')
    expect(board().composer.tags).toEqual([])
    expect(board().composer.assigneeName).toBe('Sam')
  })

  it('starts with no editor active', () => {
    const { board } = renderBoard({ chores: buildMixedRows() })
    expect(board().editor.choreId).toBeNull()
  })

  it('starts with zero bumps spent today', () => {
    const { board } = renderBoard({ chores: buildMixedRows() })
    expect(board().bumpCount).toBe(0)
  })

  it('offers the whole roster as assignees, in join order', () => {
    const { board } = renderBoard({ chores: buildMixedRows() })
    expect(board().memberNames).toEqual(['Sam', 'Alex'])
  })
})
