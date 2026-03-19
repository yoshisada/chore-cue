// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'

import { buildMockBoardState, renderWithProviders } from './componentHelpers'
import { buildOverdueChore, buildDueChore } from './fixtures'
import { createSections, sortVisibleChores } from '~/features/chorecue/boardState'

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

describe('ChoreHomePage – completion controls and refreshed labels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const chores = [
      buildOverdueChore({ id: 'o1', lastCompletedLabel: 'Last done yesterday' }),
      buildDueChore({ id: 'd1', lastCompletedLabel: null }),
    ]
    const sorted = sortVisibleChores(chores)
    Object.assign(mockBoardState, buildMockBoardState({
      sections: createSections(sorted),
    }))
  })

  it('renders Complete buttons for each visible chore', () => {
    renderWithProviders(<ChoreHomePage />)
    const completeButtons = screen.getAllByText('Complete')
    expect(completeButtons.length).toBe(2)
  })

  it('calls completeChore with the chore id when Complete is clicked', () => {
    renderWithProviders(<ChoreHomePage />)
    const completeButtons = screen.getAllByText('Complete')
    fireEvent.click(completeButtons[0]!)
    expect(mockBoardState.completeChore).toHaveBeenCalledWith('o1')
  })

  it('shows last completed label when present', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText(/Last done yesterday/)).toBeTruthy()
  })

  it('omits completion info when last completed is null', () => {
    renderWithProviders(<ChoreHomePage />)
    // When lastCompletedLabel is null, the metadata line omits it
    expect(screen.queryByText(/No completion history/)).toBeNull()
  })
})
