import './jsdom-setup'

import { render } from '@testing-library/react'
import { type ReactNode } from 'react'
import { TamaguiProvider } from 'tamagui'

import {
  collectAllTags,
  createSections,
  emptyComposer,
  emptyEditorState,
  sortVisibleChores,
} from '~/features/chorecue/boardState'
import { config } from '~/tamagui/tamagui.config'

import { buildMixedCards } from './fixtures'

import type {
  ChoreCard,
  ChoreComposerState,
  ChoreEditorState,
} from '~/features/chorecue/types'

// ---------- Mocked hook return type ----------
export interface MockBoardState {
  sections: ReturnType<typeof createSections>
  allTags: string[]
  selectedTags: Set<string>
  searchQuery: string
  setSearchQuery: ReturnType<typeof vi.fn>
  memberNames: string[]
  composer: ChoreComposerState
  editor: ChoreEditorState
  bumpCount: number
  isLoading: boolean
  hasAnyChores: boolean
  updateComposer: ReturnType<typeof vi.fn>
  addChore: ReturnType<typeof vi.fn>
  completeChore: ReturnType<typeof vi.fn>
  sendBump: ReturnType<typeof vi.fn>
  beginEdit: ReturnType<typeof vi.fn>
  cancelEdit: ReturnType<typeof vi.fn>
  updateEditor: ReturnType<typeof vi.fn>
  saveEdit: ReturnType<typeof vi.fn>
  archiveChore: ReturnType<typeof vi.fn>
  attachComposerPhoto: ReturnType<typeof vi.fn>
  clearComposerPhoto: ReturnType<typeof vi.fn>
  attachEditorPhoto: ReturnType<typeof vi.fn>
  clearEditorPhoto: ReturnType<typeof vi.fn>
  toggleTag: ReturnType<typeof vi.fn>
  clearTagFilter: ReturnType<typeof vi.fn>
}

export function buildMockBoardState(
  overrides: Partial<MockBoardState> = {}
): MockBoardState {
  const chores = buildMixedCards()
  const sorted = sortVisibleChores(chores)
  return {
    sections: createSections(sorted),
    allTags: collectAllTags(sorted),
    selectedTags: new Set<string>(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    memberNames: ['Sam', 'Alex'],
    composer: { ...emptyComposer },
    editor: { ...emptyEditorState },
    bumpCount: 2,
    isLoading: false,
    hasAnyChores: chores.length > 0,
    updateComposer: vi.fn(),
    addChore: vi.fn().mockResolvedValue({ ok: true }),
    completeChore: vi.fn().mockResolvedValue({ ok: true }),
    sendBump: vi.fn().mockResolvedValue(true),
    beginEdit: vi.fn(),
    cancelEdit: vi.fn(),
    updateEditor: vi.fn(),
    saveEdit: vi.fn().mockResolvedValue({ ok: true }),
    archiveChore: vi.fn().mockResolvedValue({ ok: true }),
    attachComposerPhoto: vi.fn(),
    clearComposerPhoto: vi.fn(),
    attachEditorPhoto: vi.fn(),
    clearEditorPhoto: vi.fn(),
    toggleTag: vi.fn(),
    clearTagFilter: vi.fn(),
    ...overrides,
  }
}

function TestProvider({ children }: { children: ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      {children}
    </TamaguiProvider>
  )
}

export function renderWithProviders(ui: ReactNode) {
  return render(ui, { wrapper: TestProvider })
}
