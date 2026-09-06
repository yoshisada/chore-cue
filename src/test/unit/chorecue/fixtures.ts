import type {
  ChoreCard,
  ChoreComposerState,
  ChoreEditorState,
  RecurrenceSummary,
} from '~/features/chorecue/types'

const defaults: ChoreCard = {
  id: 'test-chore-1',
  title: 'Test chore',
  tags: ['Test'],
  assigneeName: 'Sam',
  recurrenceSummary: 'Every N days',
  dueBucket: 'due',
  dueLabel: 'Due today',
  lastCompletedLabel: null,
  photoLabel: null,
  archived: false,
  canBump: true,
}

export function buildChore(overrides: Partial<ChoreCard> = {}): ChoreCard {
  return { ...defaults, ...overrides }
}

export function buildOverdueChore(overrides: Partial<ChoreCard> = {}): ChoreCard {
  return buildChore({
    id: 'overdue-1',
    title: 'Overdue chore',
    dueBucket: 'overdue',
    dueLabel: '2 days overdue',
    ...overrides,
  })
}

export function buildDueChore(overrides: Partial<ChoreCard> = {}): ChoreCard {
  return buildChore({
    id: 'due-1',
    title: 'Due chore',
    dueBucket: 'due',
    dueLabel: 'Due today',
    ...overrides,
  })
}

export function buildUpcomingChore(overrides: Partial<ChoreCard> = {}): ChoreCard {
  return buildChore({
    id: 'upcoming-1',
    title: 'Upcoming chore',
    dueBucket: 'upcoming',
    dueLabel: 'Next due Friday',
    ...overrides,
  })
}

export function buildComposer(
  overrides: Partial<ChoreComposerState> = {}
): ChoreComposerState {
  return {
    title: 'New chore',
    tags: ['Kitchen'],
    assigneeName: 'Sam',
    recurrenceSummary: 'Every N days',
    photoLabel: '',
    ...overrides,
  }
}

export function buildEditor(overrides: Partial<ChoreEditorState> = {}): ChoreEditorState {
  return {
    choreId: 'test-chore-1',
    title: 'Test chore',
    tags: ['Test'],
    assigneeName: 'Sam',
    recurrenceSummary: 'Every N days',
    photoLabel: '',
    ...overrides,
  }
}

export function buildMixedBoard(): ChoreCard[] {
  return [buildOverdueChore(), buildDueChore(), buildUpcomingChore()]
}

export function buildBoardWithArchived(): ChoreCard[] {
  return [
    ...buildMixedBoard(),
    buildChore({
      id: 'archived-1',
      title: 'Archived chore',
      archived: true,
      canBump: false,
    }),
  ]
}

export const allRecurrenceTypes: RecurrenceSummary[] = [
  'Every N days',
  'Weekly',
  'Daily time',
]
