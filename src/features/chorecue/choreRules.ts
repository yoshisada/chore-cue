import { isValidRule } from './recurrence'

import type { RecurrenceRule } from './recurrence'

/**
 * the single source of truth for chore/bump validation.
 *
 * imported by both `~/features/chorecue/*` (optimistic UI) and `~/data/models/*`
 * (server authority) so the two are structurally unable to disagree about what
 * is allowed. nothing here reads the clock or touches the database.
 */

export const DAILY_BUMP_LIMIT = 5

export const BUMP_MESSAGE_TYPES = [
  'gentle_nudge',
  'friendly_reminder',
  'heads_up',
] as const

export type BumpMessageType = (typeof BUMP_MESSAGE_TYPES)[number]

export function isBumpMessageType(value: unknown): value is BumpMessageType {
  return (
    typeof value === 'string' && (BUMP_MESSAGE_TYPES as readonly string[]).includes(value)
  )
}

export const MAX_TITLE_LENGTH = 120
export const MAX_TAG_LENGTH = 40
export const MAX_TAGS = 10
export const MAX_DESCRIPTION_LENGTH = 1000
export const MAX_HOUSEHOLD_NAME_LENGTH = 80

export type ChoreDraftField =
  | 'title'
  | 'tags'
  | 'assigneeMemberId'
  | 'rule'
  | 'description'

export class ChoreValidationError extends Error {
  readonly field: ChoreDraftField

  constructor(field: ChoreDraftField, message: string) {
    super(message)
    this.name = 'ChoreValidationError'
    this.field = field
  }
}

export type BumpBlockedReason =
  | 'archived'
  | 'self'
  | 'unassigned'
  | 'inactive-assignee'
  | 'daily-limit'
  | 'invalid-template'

export class BumpRejected extends Error {
  readonly reason: BumpBlockedReason

  constructor(reason: BumpBlockedReason) {
    super(`Bump rejected: ${reason}`)
    this.name = 'BumpRejected'
    this.reason = reason
  }
}

/** collapse internal whitespace and trim — the shape stored in the database */
export function normalizeTitle(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

export function normalizeTag(value: unknown): string {
  return normalizeTitle(value).slice(0, MAX_TAG_LENGTH)
}

export function normalizeHouseholdName(value: unknown): string {
  return normalizeTitle(value).slice(0, MAX_HOUSEHOLD_NAME_LENGTH)
}

/** de-duplicated (case-insensitively), order preserved, empties dropped */
export function normalizeTags(values: readonly unknown[] | undefined | null): string[] {
  if (!values) return []

  const seen = new Set<string>()
  const out: string[] = []

  for (const value of values) {
    const tag = normalizeTag(value)
    if (!tag) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(tag)
    if (out.length >= MAX_TAGS) break
  }

  return out
}

export interface ChoreDraftInput {
  title: string
  tags?: readonly string[] | null
  description?: string | null
  photoLabel?: string | null
  assigneeMemberId: string
  rule: RecurrenceRule
}

export interface ChoreDraft {
  title: string
  tags: string[]
  description: string | null
  photoLabel: string | null
  assigneeMemberId: string
  rule: RecurrenceRule
}

/** throws a field-keyed `ChoreValidationError`; never returns a partial draft */
export function validateChoreDraft(input: ChoreDraftInput): ChoreDraft {
  const title = normalizeTitle(input?.title)
  if (!title) {
    throw new ChoreValidationError('title', 'Chore title is required')
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new ChoreValidationError(
      'title',
      `Chore title must be ${MAX_TITLE_LENGTH} characters or fewer`
    )
  }

  const tags = normalizeTags(input?.tags)
  if (tags.length === 0) {
    throw new ChoreValidationError('tags', 'At least one tag is required')
  }

  const assigneeMemberId =
    typeof input?.assigneeMemberId === 'string' ? input.assigneeMemberId.trim() : ''
  if (!assigneeMemberId) {
    throw new ChoreValidationError('assigneeMemberId', 'An assignee is required')
  }

  if (!isValidRule(input?.rule)) {
    throw new ChoreValidationError('rule', 'Recurrence rule is invalid')
  }

  const rawDescription =
    typeof input.description === 'string' ? input.description.trim() : ''
  if (rawDescription.length > MAX_DESCRIPTION_LENGTH) {
    throw new ChoreValidationError(
      'description',
      `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`
    )
  }

  const rawPhotoLabel =
    typeof input.photoLabel === 'string' ? input.photoLabel.trim() : ''

  return {
    title,
    tags,
    description: rawDescription || null,
    photoLabel: rawPhotoLabel || null,
    assigneeMemberId,
    rule: input.rule,
  }
}

export interface BumpTarget {
  archived: boolean
  assigneeMemberId: string | null | undefined
  assigneeActive: boolean
}

export interface BumpViewerContext {
  viewerMemberId: string
  bumpsUsedToday: number
}

export type BumpEligibility =
  | { canBump: true }
  | { canBump: false; reason: BumpBlockedReason }

/**
 * the predicate the bump button and the `bumpEvent.send` mutator both run.
 *
 * check order is deliberate: the most specific explanation wins, so a disabled
 * button can always say *why* it is disabled.
 */
export function bumpEligibility(
  chore: BumpTarget,
  ctx: BumpViewerContext
): BumpEligibility {
  if (chore.archived) return { canBump: false, reason: 'archived' }
  if (!chore.assigneeMemberId) return { canBump: false, reason: 'unassigned' }
  if (!chore.assigneeActive) return { canBump: false, reason: 'inactive-assignee' }
  if (chore.assigneeMemberId === ctx.viewerMemberId) {
    return { canBump: false, reason: 'self' }
  }
  if (ctx.bumpsUsedToday >= DAILY_BUMP_LIMIT) {
    return { canBump: false, reason: 'daily-limit' }
  }

  return { canBump: true }
}
