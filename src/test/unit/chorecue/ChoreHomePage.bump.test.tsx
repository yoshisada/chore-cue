import { screen, fireEvent } from '@testing-library/react'
// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createSections, sortVisibleChores } from '~/features/chorecue/boardState'

import { buildMockBoardState, renderWithProviders } from './componentHelpers'
import { buildDueChore } from './fixtures'

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

describe('ChoreHomePage – bump buttons, disabled states, and reminder labels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Bump" for bump-eligible chores', () => {
    const chores = [buildDueChore({ canBump: true })]
    const sorted = sortVisibleChores(chores)
    Object.assign(
      mockBoardState,
      buildMockBoardState({
        sections: createSections(sorted),
      })
    )

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Bump')).toBeTruthy()
  })

  it('renders "No bump" for non-eligible chores', () => {
    const chores = [buildDueChore({ canBump: false })]
    const sorted = sortVisibleChores(chores)
    Object.assign(
      mockBoardState,
      buildMockBoardState({
        sections: createSections(sorted),
      })
    )

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('No bump')).toBeTruthy()
  })

  it('calls sendBump with chore id when Bump is clicked', () => {
    const chores = [buildDueChore({ id: 'bump-me', canBump: true })]
    const sorted = sortVisibleChores(chores)
    Object.assign(
      mockBoardState,
      buildMockBoardState({
        sections: createSections(sorted),
      })
    )

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Bump'))
    expect(mockBoardState.sendBump).toHaveBeenCalledWith('bump-me')
  })

  it('displays the daily bump count', () => {
    Object.assign(mockBoardState, buildMockBoardState({ bumpCount: 4 }))

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText(/4 of 5 daily bumps used/)).toBeTruthy()
  })
})
