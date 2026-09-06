import { screen, fireEvent } from '@testing-library/react'
// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createSections, sortVisibleChores } from '~/features/chorecue/boardState'

import { buildMockBoardState, renderWithProviders } from './componentHelpers'
import { buildDueChore, buildEditor } from './fixtures'

// ---------- Mocks ----------
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

const mockBoardState = buildMockBoardState()
vi.mock('~/features/chorecue/useChoreBoard', () => ({
  useChoreBoard: () => mockBoardState,
}))

vi.mock('~/features/auth/client/useHouseholdContext', () => ({
  useHouseholdContext: () => ({
    userId: 'test-user',
    householdId: 'household-test1234',
    householdName: 'My Household',
    displayName: 'Test Member',
    isAuthenticated: true,
  }),
}))

vi.mock('~/features/members/useMemberBoard', () => ({
  useMemberBoard: () => ({
    memberNames: ['Sam', 'Alex'],
  }),
}))

import { ChoreHomePage } from '~/features/chorecue/ChoreHomePage'

describe('ChoreHomePage – edit-mode UI and archive actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const chores = [buildDueChore({ id: 'd1' })]
    const sorted = sortVisibleChores(chores)
    Object.assign(
      mockBoardState,
      buildMockBoardState({
        sections: createSections(sorted),
      })
    )
  })

  it('renders Edit button on each chore card', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Edit')).toBeTruthy()
  })

  it('calls beginEdit with chore id when Edit is clicked', () => {
    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Edit'))
    expect(mockBoardState.beginEdit).toHaveBeenCalledWith('d1')
  })

  it('does not show the edit panel when no editor is active', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.queryByText('Edit chore')).toBeNull()
  })

  it('shows the edit panel when editor has a choreId', () => {
    Object.assign(
      mockBoardState,
      buildMockBoardState({
        editor: buildEditor({ choreId: 'd1', title: 'Due chore', tags: ['Test'] }),
        sections: mockBoardState.sections,
      })
    )

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Edit chore')).toBeTruthy()
  })

  it('renders Save changes and Archive chore buttons in editor', () => {
    Object.assign(
      mockBoardState,
      buildMockBoardState({
        editor: buildEditor({ choreId: 'd1' }),
        sections: mockBoardState.sections,
      })
    )

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Save changes')).toBeTruthy()
    expect(screen.getByText('Archive chore')).toBeTruthy()
  })

  it('calls saveEdit when Save changes is clicked', () => {
    Object.assign(
      mockBoardState,
      buildMockBoardState({
        editor: buildEditor({ choreId: 'd1' }),
        sections: mockBoardState.sections,
      })
    )

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Save changes'))
    expect(mockBoardState.saveEdit).toHaveBeenCalledOnce()
  })

  it('calls archiveChore when Archive chore is clicked in editor', () => {
    Object.assign(
      mockBoardState,
      buildMockBoardState({
        editor: buildEditor({ choreId: 'd1' }),
        sections: mockBoardState.sections,
      })
    )

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Archive chore'))
    expect(mockBoardState.archiveChore).toHaveBeenCalledWith('d1')
  })

  it('renders Archive button on chore cards in the list', () => {
    renderWithProviders(<ChoreHomePage />)
    // Archive button appears on the chore card
    expect(screen.getByText('Archive')).toBeTruthy()
  })

  it('calls archiveChore from the card Archive button', () => {
    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Archive'))
    expect(mockBoardState.archiveChore).toHaveBeenCalledWith('d1')
  })
})
