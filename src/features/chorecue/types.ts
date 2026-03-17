export type DueBucket = 'overdue' | 'due' | 'upcoming'
export type RecurrenceSummary = 'Every N days' | 'Weekly' | 'Daily time'

export interface ChoreCard {
  id: string
  title: string
  category: string
  assigneeName: string
  recurrenceSummary: RecurrenceSummary
  dueBucket: DueBucket
  dueLabel: string
  lastCompletedLabel: string | null
  photoLabel: string | null
  archived: boolean
  canBump: boolean
}

export interface ChoreComposerState {
  title: string
  category: string
  assigneeName: string
  recurrenceSummary: RecurrenceSummary
  photoLabel: string
}

export interface ChoreEditorState extends ChoreComposerState {
  choreId: string | null
}
