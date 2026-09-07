import { deriveDueBucket, DUE_SOON_WINDOW_MS } from './choreMapping'
import { ChoreValidationError, DAILY_BUMP_LIMIT, validateChoreDraft } from './choreRules'
import { describeRecurrence, ruleFromSummary } from './recurrence'

import type { RecurrenceRule } from './recurrence'
import type {
  ChoreCard,
  ChoreComposerState,
  ChoreEditorState,
  ChoreWriteInput,
  DueBucket,
} from './types'

/**
 * the board's pure reducers.
 *
 * everything here is a total function of its arguments: no clock, no network, no
 * React. the hook supplies rows from Zero and a `now`; this module decides how
 * they are grouped, sorted, filtered and what a write intent looks like.
 */

export { deriveDueBucket, DUE_SOON_WINDOW_MS }

/** kept as a named export so existing importers of `dailyBumpLimit` still compile */
export const dailyBumpLimit = DAILY_BUMP_LIMIT

export const emptyComposer: ChoreComposerState = {
  title: '',
  tags: [],
  assigneeName: '',
  recurrenceSummary: 'Every N days',
  photoLabel: '',
}

export const emptyEditorState: ChoreEditorState = {
  ...emptyComposer,
  choreId: null,
}

export const initialBumpCount = 0

export function dueSortValue(bucket: DueBucket): number {
  switch (bucket) {
    case 'overdue':
      return 0
    case 'dueSoon':
      return 1
    case 'upcoming':
      return 2
  }
}

/**
 * a total order: bucket, then the underlying due instant, then title, then id.
 * without the tie-breaks two chores due at the same moment could swap places
 * between renders, which makes both the UI and the tests flap.
 */
export function sortVisibleChores(chores: ChoreCard[]): ChoreCard[] {
  return [...chores]
    .filter((item) => !item.archived)
    .sort(
      (left, right) =>
        dueSortValue(left.dueBucket) - dueSortValue(right.dueBucket) ||
        left.nextDueAt - right.nextDueAt ||
        left.title.localeCompare(right.title) ||
        left.id.localeCompare(right.id)
    )
}

export interface ChoreSections {
  overdue: ChoreCard[]
  dueSoon: ChoreCard[]
  upcoming: ChoreCard[]
}

export function createSections(chores: ChoreCard[]): ChoreSections {
  const sorted = sortVisibleChores(chores)
  return {
    overdue: sorted.filter((item) => item.dueBucket === 'overdue'),
    dueSoon: sorted.filter((item) => item.dueBucket === 'dueSoon'),
    upcoming: sorted.filter((item) => item.dueBucket === 'upcoming'),
  }
}

export function collectAllTags(chores: ChoreCard[]): string[] {
  const tags = new Set<string>()
  for (const chore of chores) {
    for (const tag of chore.tags) {
      tags.add(tag)
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b))
}

export function filterBySearch(chores: ChoreCard[], query: string): ChoreCard[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return chores
  return chores.filter(
    (chore) =>
      chore.title.toLowerCase().includes(trimmed) ||
      chore.assigneeName.toLowerCase().includes(trimmed) ||
      chore.tags.some((tag) => tag.toLowerCase().includes(trimmed))
  )
}

export function filterByTags(
  chores: ChoreCard[],
  selectedTags: Set<string>
): ChoreCard[] {
  if (selectedTags.size === 0) return chores
  return chores.filter((chore) => chore.tags.some((tag) => selectedTags.has(tag)))
}

export function beginEditForBoard(
  chores: ChoreCard[],
  choreId: string
): ChoreEditorState {
  const chore = chores.find((item) => item.id === choreId)
  if (!chore) {
    return emptyEditorState
  }

  return {
    choreId: chore.id,
    title: chore.title,
    tags: [...chore.tags],
    assigneeName: chore.assigneeName,
    recurrenceSummary: chore.recurrenceSummary,
    photoLabel: chore.photoLabel ?? '',
  }
}

/** archiving (or finishing) the chore under edit must close the editor */
export function resetEditorIfEditing(
  editor: ChoreEditorState,
  choreId: string
): ChoreEditorState {
  return editor.choreId === choreId ? emptyEditorState : editor
}

export type ChoreIntent =
  | { ok: true; value: ChoreWriteInput }
  | { ok: false; error: ChoreValidationError }

export interface ChoreIntentContext {
  choreId: string
  /** resolved from the composer's assignee *name* by the caller, which holds the roster */
  assigneeMemberId: string | null | undefined
  timezone: string
  now: number
  /**
   * the chore's current rule when editing. the form only round-trips the coarse
   * summary, so an unchanged summary must keep the stored rule's parameters
   * instead of silently resetting them to the summary's defaults
   */
  existingRule?: RecurrenceRule | null
}

function buildIntent(form: ChoreComposerState, ctx: ChoreIntentContext): ChoreIntent {
  try {
    const draft = validateChoreDraft({
      title: form.title,
      tags: form.tags,
      photoLabel: form.photoLabel,
      assigneeMemberId: ctx.assigneeMemberId ?? '',
      rule:
        ctx.existingRule &&
        describeRecurrence(ctx.existingRule) === form.recurrenceSummary
          ? ctx.existingRule
          : ruleFromSummary(form.recurrenceSummary, ctx.timezone),
    })

    return {
      ok: true,
      value: {
        choreId: ctx.choreId,
        title: draft.title,
        tags: draft.tags,
        assigneeMemberId: draft.assigneeMemberId,
        rule: draft.rule,
        description: draft.description,
        photoLabel: draft.photoLabel,
        now: ctx.now,
      },
    }
  } catch (error) {
    if (error instanceof ChoreValidationError) {
      return { ok: false, error }
    }
    throw error
  }
}

/** composer -> the payload `chore.create` takes, or a field-keyed rejection */
export function buildChoreDraft(
  composer: ChoreComposerState,
  ctx: ChoreIntentContext
): ChoreIntent {
  return buildIntent(composer, ctx)
}

/** editor -> the payload `chore.edit` takes, or a field-keyed rejection */
export function buildChoreEdit(
  editor: ChoreEditorState,
  ctx: Omit<ChoreIntentContext, 'choreId'>
): ChoreIntent {
  if (!editor.choreId) {
    return {
      ok: false,
      error: new ChoreValidationError('title', 'No chore is being edited'),
    }
  }

  return buildIntent(editor, { ...ctx, choreId: editor.choreId })
}
