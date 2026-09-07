import type { BumpBlockedReason } from './choreRules'
import type { RecurrenceRule } from './recurrence'

export type DueBucket = 'overdue' | 'dueSoon' | 'upcoming'
export type RecurrenceSummary = 'Every N days' | 'Weekly' | 'Daily time'

export interface ChoreCard {
  id: string
  title: string
  tags: string[]
  assigneeName: string
  assigneeMemberId: string
  assigneeActive: boolean
  recurrenceSummary: RecurrenceSummary
  /** null when the row carries a malformed recurrence (a schema CHECK makes this unreachable in Postgres) */
  rule: RecurrenceRule | null
  dueBucket: DueBucket
  dueLabel: string
  nextDueAt: number
  lastCompletedAt: number | null
  lastCompletedLabel: string | null
  photoLabel: string | null
  archived: boolean
  canBump: boolean
  /** why the bump button is disabled, so it can explain itself */
  bumpBlockedReason: BumpBlockedReason | null
}

export interface ChoreComposerState {
  title: string
  tags: string[]
  assigneeName: string
  recurrenceSummary: RecurrenceSummary
  photoLabel: string
}

export interface ChoreEditorState extends ChoreComposerState {
  choreId: string | null
}

/**
 * exactly what a `chore.create` / `chore.edit` mutator takes.
 *
 * declared structurally here rather than imported from `~/data/models/chore` so
 * the pure layer stays free of the data layer (the dependency runs the other
 * way: the mutators import these rules).
 */
export interface ChoreWriteInput {
  choreId: string
  title: string
  tags: string[]
  assigneeMemberId: string
  rule: RecurrenceRule
  description?: string | null
  photoLabel?: string | null
  now: number
}
