import { screen, fireEvent, waitFor } from '@testing-library/react'
// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createSections } from '~/features/chorecue/boardState'

import { buildMockBoardState, renderWithProviders } from './componentHelpers'
import { buildDueChore, buildEditor } from './fixtures'

// ---------- Mocks ----------
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

const showToast = vi.fn()
vi.mock('~/interface/toast/helpers', () => ({
  showToast: (...args: unknown[]) => showToast(...args),
  hideToast: vi.fn(),
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

import { ChoreHomePage, describeActiveFilters } from '~/features/chorecue/ChoreHomePage'

describe('describeActiveFilters', () => {
  it('names the search term', () => {
    expect(describeActiveFilters('sweep', new Set())).toContain('sweep')
  })

  it('names a single tag in the singular', () => {
    expect(describeActiveFilters('', new Set(['Kitchen']))).toContain('tag Kitchen')
  })

  it('names several tags in the plural', () => {
    const message = describeActiveFilters('', new Set(['Kitchen', 'Bathroom']))
    expect(message).toContain('tags Kitchen, Bathroom')
  })

  it('names both the search and the tags together', () => {
    const message = describeActiveFilters('sweep', new Set(['Kitchen']))
    expect(message).toContain('sweep')
    expect(message).toContain('Kitchen')
  })

  it('ignores whitespace-only searches', () => {
    expect(describeActiveFilters('   ', new Set())).toBe(
      'Nothing matches the current view.'
    )
  })
})

const emptySections = createSections([])

function setBoard(overrides: Parameters<typeof buildMockBoardState>[0] = {}) {
  Object.assign(mockBoardState, buildMockBoardState(overrides))
}

describe('ChoreHomePage – write failures are surfaced, never swallowed', () => {
  beforeEach(() => {
    showToast.mockClear()
    setBoard({ sections: createSections([buildDueChore({ id: 'd1' })]) })
  })

  it('shows the rejection reason inline when addChore fails', async () => {
    setBoard({
      sections: createSections([buildDueChore({ id: 'd1' })]),
      addChore: vi.fn().mockResolvedValue({ ok: false, reason: 'Title is required' }),
    })

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Add chore'))

    expect(await screen.findByText('Title is required')).toBeTruthy()
  })

  it('toasts the rejection reason when addChore fails', async () => {
    setBoard({
      sections: createSections([buildDueChore({ id: 'd1' })]),
      addChore: vi.fn().mockResolvedValue({ ok: false, reason: 'Title is required' }),
    })

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Add chore'))

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith('Title is required', { type: 'error' })
    )
  })

  it('shows no error and no toast when addChore succeeds', async () => {
    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Add chore'))

    await waitFor(() => expect(mockBoardState.addChore).toHaveBeenCalledOnce())
    expect(showToast).not.toHaveBeenCalled()
  })

  it('falls back to a generic reason when addChore fails without one', async () => {
    setBoard({
      sections: createSections([buildDueChore({ id: 'd1' })]),
      addChore: vi.fn().mockResolvedValue({ ok: false }),
    })

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Add chore'))

    expect(await screen.findByText('Could not create that chore')).toBeTruthy()
  })

  it('shows the rejection reason inline when saveEdit fails', async () => {
    setBoard({
      sections: createSections([buildDueChore({ id: 'd1' })]),
      editor: buildEditor({ choreId: 'd1' }),
      saveEdit: vi.fn().mockResolvedValue({ ok: false, reason: 'Title is required' }),
    })

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Save changes'))

    expect(await screen.findByText('Title is required')).toBeTruthy()
  })

  it('cancels the edit instead of saving it when Cancel is pressed', () => {
    setBoard({
      sections: createSections([buildDueChore({ id: 'd1' })]),
      editor: buildEditor({ choreId: 'd1' }),
    })

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Cancel'))

    expect(mockBoardState.cancelEdit).toHaveBeenCalledOnce()
    expect(mockBoardState.saveEdit).not.toHaveBeenCalled()
  })

  it('toasts when a bump is rejected', async () => {
    setBoard({
      sections: createSections([buildDueChore({ id: 'd1' })]),
      sendBump: vi.fn().mockResolvedValue(false),
    })

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Bump'))

    await waitFor(() => expect(showToast).toHaveBeenCalledOnce())
    expect(showToast.mock.calls[0]?.[0]).toContain('Bump not sent')
  })

  it('stays quiet when a bump is accepted', async () => {
    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Bump'))

    await waitFor(() => expect(mockBoardState.sendBump).toHaveBeenCalledWith('d1'))
    expect(showToast).not.toHaveBeenCalled()
  })

  it('toasts when completing a chore is rejected', async () => {
    setBoard({
      sections: createSections([buildDueChore({ id: 'd1' })]),
      completeChore: vi.fn().mockResolvedValue({ ok: false, reason: 'Already done' }),
    })

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Complete'))

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith('Already done', { type: 'error' })
    )
  })
})

describe('ChoreHomePage – empty, loading and filtered-empty are distinct', () => {
  beforeEach(() => {
    showToast.mockClear()
  })

  it('shows the loading state instead of the empty state while chores sync', () => {
    setBoard({ sections: emptySections, isLoading: true, hasAnyChores: false })

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Loading your chores…')).toBeTruthy()
    expect(screen.queryByText('Nothing due yet')).toBeNull()
  })

  it('shows the empty state when the household has no chores at all', () => {
    setBoard({ sections: emptySections, isLoading: false, hasAnyChores: false })

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Nothing due yet')).toBeTruthy()
    expect(screen.queryByText('No chores match your filters')).toBeNull()
  })

  it('shows the filtered-empty state when chores exist but none match', () => {
    setBoard({
      sections: emptySections,
      isLoading: false,
      hasAnyChores: true,
      searchQuery: 'zzz',
    })

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('No chores match your filters')).toBeTruthy()
    expect(screen.queryByText('Nothing due yet')).toBeNull()
  })

  it('names the active filters in the filtered-empty state', () => {
    setBoard({
      sections: emptySections,
      isLoading: false,
      hasAnyChores: true,
      searchQuery: 'zzz',
      selectedTags: new Set(['Kitchen']),
    })

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText(/zzz/)).toBeTruthy()
    expect(screen.getByText(/Kitchen/)).toBeTruthy()
  })

  it('clears both the search and the tag filter from the filtered-empty state', () => {
    setBoard({
      sections: emptySections,
      isLoading: false,
      hasAnyChores: true,
      searchQuery: 'zzz',
      selectedTags: new Set(['Kitchen']),
    })

    renderWithProviders(<ChoreHomePage />)
    fireEvent.click(screen.getByText('Clear filters'))

    expect(mockBoardState.setSearchQuery).toHaveBeenCalledWith('')
    expect(mockBoardState.clearTagFilter).toHaveBeenCalledOnce()
  })

  it('keeps rendering chores while still loading if some have already synced', () => {
    setBoard({
      sections: createSections([buildDueChore({ id: 'd1', title: 'Sweep' })]),
      isLoading: true,
      hasAnyChores: true,
    })

    renderWithProviders(<ChoreHomePage />)
    expect(screen.queryByText('Loading your chores…')).toBeNull()
    expect(screen.getByText('Sweep')).toBeTruthy()
  })

  it('still shows the tag chips while a search is active', () => {
    setBoard({
      sections: emptySections,
      isLoading: false,
      hasAnyChores: true,
      allTags: ['Kitchen', 'Bathroom'],
      searchQuery: 'zzz',
      selectedTags: new Set(['Kitchen']),
    })

    renderWithProviders(<ChoreHomePage />)
    expect(screen.getByText('Bathroom')).toBeTruthy()
    expect(screen.getAllByText('Kitchen').length).toBeGreaterThanOrEqual(1)
  })
})
