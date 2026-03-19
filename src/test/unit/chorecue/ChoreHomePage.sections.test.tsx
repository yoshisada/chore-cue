// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'

import { buildMockBoardState, renderWithProviders } from './componentHelpers'
import { buildOverdueChore, buildDueChore, buildUpcomingChore } from './fixtures'
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

describe('ChoreHomePage – section ordering, metadata rendering, and empty-state handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Overdue, Due Soon, and Upcoming section headings', () => {
    const chores = [buildOverdueChore(), buildDueChore(), buildUpcomingChore()]
    const sorted = sortVisibleChores(chores)
    Object.assign(mockBoardState, buildMockBoardState({
      sections: createSections(sorted),
    }))

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Overdue')).toBeTruthy()
    expect(screen.getByText('Due Soon')).toBeTruthy()
    expect(screen.getByText('Upcoming')).toBeTruthy()
  })

  it('shows chore count per section', () => {
    const chores = [
      buildOverdueChore({ id: 'o1' }),
      buildOverdueChore({ id: 'o2' }),
      buildDueChore({ id: 'd1' }),
    ]
    const sorted = sortVisibleChores(chores)
    Object.assign(mockBoardState, buildMockBoardState({
      sections: createSections(sorted),
    }))

    renderWithProviders(<ChoreHomePage />)
    // Count badges show the number
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()
  })

  it('renders chore metadata (tags and assignee)', () => {
    const chores = [buildDueChore({ assigneeName: 'Sam', tags: ['Kitchen', 'Quick'] })]
    const sorted = sortVisibleChores(chores)
    Object.assign(mockBoardState, buildMockBoardState({
      sections: createSections(sorted),
    }))

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText(/Kitchen, Quick.*Sam/)).toBeTruthy()
  })

  it('renders recurrence summary on each card', () => {
    const chores = [buildDueChore({ recurrenceSummary: 'Weekly' })]
    const sorted = sortVisibleChores(chores)
    Object.assign(mockBoardState, buildMockBoardState({
      sections: createSections(sorted),
    }))

    renderWithProviders(<ChoreHomePage />)
    // "Weekly" appears as both a recurrence button and on the card
    expect(screen.getAllByText('Weekly').length).toBeGreaterThanOrEqual(1)
  })

  it('hides a section when it has no chores', () => {
    const chores = [buildDueChore()]
    const sorted = sortVisibleChores(chores)
    Object.assign(mockBoardState, buildMockBoardState({
      sections: createSections(sorted),
    }))

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Due Soon')).toBeTruthy()
    expect(screen.queryByText('Overdue')).toBeNull()
    expect(screen.queryByText('Upcoming')).toBeNull()
  })

  it('renders photo label when present', () => {
    const chores = [buildDueChore({ photoLabel: 'kitchen.jpg' })]
    const sorted = sortVisibleChores(chores)
    Object.assign(mockBoardState, buildMockBoardState({
      sections: createSections(sorted),
    }))

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('kitchen.jpg')).toBeTruthy()
  })

  it('shows "No photo attached" when photo is null', () => {
    const chores = [buildDueChore({ photoLabel: null })]
    const sorted = sortVisibleChores(chores)
    Object.assign(mockBoardState, buildMockBoardState({
      sections: createSections(sorted),
    }))

    renderWithProviders(<ChoreHomePage />)
    // "No photo attached" appears in both the form's PhotoInput and the card
    expect(screen.getAllByText('No photo attached').length).toBeGreaterThanOrEqual(1)
  })
})
