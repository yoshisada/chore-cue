// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'

import { buildMockBoardState, renderWithProviders } from './componentHelpers'

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

describe('ChoreHomePage – create form and initial board rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(mockBoardState, buildMockBoardState())
  })

  it('renders the page title', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText(/Household/)).toBeTruthy()
  })

  it('renders the create chore button', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getAllByText('Create a chore').length).toBeGreaterThanOrEqual(1)
  })

  it('renders title input and tag input placeholders', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByPlaceholderText('Chore title')).toBeTruthy()
    expect(screen.getByPlaceholderText('Add a tag')).toBeTruthy()
  })

  it('renders assignee selection buttons', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Sam')).toBeTruthy()
    expect(screen.getByText('Alex')).toBeTruthy()
  })

  it('renders recurrence type buttons', () => {
    renderWithProviders(<ChoreHomePage />)
    // These texts may appear on both form buttons and chore cards
    expect(screen.getAllByText('Every N days').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Weekly').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Daily time').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the Add chore button', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Add chore')).toBeTruthy()
  })

  it('calls addChore when Add chore is clicked', () => {
    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Add chore'))
    expect(mockBoardState.addChore).toHaveBeenCalledOnce()
  })

  it('displays the bump count', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText(/2 of 5 daily bumps used/)).toBeTruthy()
  })

  it('displays household context info', () => {
    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText(/household-test1234/)).toBeTruthy()
    expect(screen.getByText(/Test Member/)).toBeTruthy()
  })
})
