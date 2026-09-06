import './jsdom-setup'

import { render } from '@testing-library/react'
import { type ReactNode } from 'react'
import { TamaguiProvider } from 'tamagui'

import {
  collectAllTags,
  emptyComposer,
  emptyEditorState,
  initialChores,
  createSections,
  sortVisibleChores,
} from '~/features/chorecue/boardState'
import { config } from '~/tamagui/tamagui.config'

import { buildMixedBoard } from './fixtures'

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
  composer: ChoreComposerState
  editor: ChoreEditorState
  bumpCount: number
  updateComposer: ReturnType<typeof vi.fn>
  addChore: ReturnType<typeof vi.fn>
  completeChore: ReturnType<typeof vi.fn>
  sendBump: ReturnType<typeof vi.fn>
  beginEdit: ReturnType<typeof vi.fn>
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
  const chores = buildMixedBoard()
  const sorted = sortVisibleChores(chores)
  return {
    sections: createSections(sorted),
    allTags: collectAllTags(sorted),
    selectedTags: new Set<string>(),
    composer: { ...emptyComposer },
    editor: { ...emptyEditorState },
    bumpCount: 2,
    updateComposer: vi.fn(),
    addChore: vi.fn(),
    completeChore: vi.fn(),
    sendBump: vi.fn().mockReturnValue(true),
    beginEdit: vi.fn(),
    updateEditor: vi.fn(),
    saveEdit: vi.fn(),
    archiveChore: vi.fn(),
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
