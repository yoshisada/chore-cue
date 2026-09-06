import type { ChoreCard, ChoreComposerState, ChoreEditorState, DueBucket } from './types'

export const initialChores: ChoreCard[] = [
  {
    id: 'chore-1',
    title: 'Take out compost',
    tags: ['Kitchen', 'Quick'],
    assigneeName: 'Sam',
    recurrenceSummary: 'Every N days',
    dueBucket: 'overdue',
    dueLabel: '1 day overdue',
    lastCompletedLabel: 'Last done yesterday at 7:30 AM',
    photoLabel: 'compost-bin.jpg',
    archived: false,
    canBump: true,
  },
  {
    id: 'chore-2',
    title: 'Wipe kitchen counters',
    tags: ['Kitchen', 'Daily'],
    assigneeName: 'Alex',
    recurrenceSummary: 'Daily time',
    dueBucket: 'due',
    dueLabel: 'Due tonight at 7:00 PM',
    lastCompletedLabel: 'Last done today at 8:10 AM',
    photoLabel: null,
    archived: false,
    canBump: false,
  },
  {
    id: 'chore-3',
    title: 'Vacuum living room',
    tags: ['Living room', 'Deep clean'],
    assigneeName: 'Sam',
    recurrenceSummary: 'Weekly',
    dueBucket: 'upcoming',
    dueLabel: 'Next due Friday',
    lastCompletedLabel: 'Last done Monday',
    photoLabel: 'vacuum-corner.png',
    archived: false,
    canBump: true,
  },
]

export const emptyComposer: ChoreComposerState = {
  title: '',
  tags: [],
  assigneeName: 'Sam',
  recurrenceSummary: 'Every N days',
  photoLabel: '',
}

export const emptyEditorState: ChoreEditorState = {
  ...emptyComposer,
  choreId: null,
}

export const initialBumpCount = 0

export const dailyBumpLimit = 5

export function dueSortValue(bucket: DueBucket): number {
  switch (bucket) {
    case 'overdue':
      return 0
    case 'due':
      return 1
    case 'upcoming':
      return 2
  }
}

export function sortVisibleChores(chores: ChoreCard[]): ChoreCard[] {
  return [...chores]
    .filter((item) => !item.archived)
    .sort((left, right) => dueSortValue(left.dueBucket) - dueSortValue(right.dueBucket))
}

export function createSections(chores: ChoreCard[]) {
  const sorted = sortVisibleChores(chores)
  return {
    overdue: sorted.filter((item) => item.dueBucket === 'overdue'),
    due: sorted.filter((item) => item.dueBucket === 'due'),
    upcoming: sorted.filter((item) => item.dueBucket === 'upcoming'),
  }
}

export function addChoreToBoard(
  chores: ChoreCard[],
  composer: ChoreComposerState
): ChoreCard[] {
  if (!composer.title.trim() || composer.tags.length === 0) {
    return chores
  }

  return [
    {
      id: `chore-${chores.length + 1}`,
      title: composer.title.trim(),
      tags: [...composer.tags],
      assigneeName: composer.assigneeName,
      recurrenceSummary: composer.recurrenceSummary,
      dueBucket: 'due',
      dueLabel: 'Newly scheduled for today',
      lastCompletedLabel: null,
      photoLabel: composer.photoLabel || null,
      archived: false,
      canBump: composer.assigneeName !== 'Alex',
    },
    ...chores,
  ]
}

export function completeChoreInBoard(chores: ChoreCard[], choreId: string): ChoreCard[] {
  return chores.map((chore) =>
    chore.id === choreId
      ? {
          ...chore,
          dueBucket: 'upcoming',
          dueLabel: 'Reset for the next cycle',
          lastCompletedLabel: 'Completed just now',
          canBump: chore.assigneeName !== 'Alex',
        }
      : chore
  )
}

export function sendBumpForBoard(
  chores: ChoreCard[],
  choreId: string,
  bumpCount: number
): { chores: ChoreCard[]; bumpCount: number; accepted: boolean } {
  if (bumpCount >= dailyBumpLimit) {
    return {
      chores,
      bumpCount,
      accepted: false,
    }
  }

  return {
    bumpCount: bumpCount + 1,
    accepted: true,
    chores: chores.map((chore) =>
      chore.id === choreId
        ? {
            ...chore,
            dueLabel: `${chore.dueLabel} - gentle reminder sent`,
          }
        : chore
    ),
  }
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

export function saveEditedChore(
  chores: ChoreCard[],
  editor: ChoreEditorState
): { chores: ChoreCard[]; editor: ChoreEditorState } {
  if (!editor.choreId) {
    return { chores, editor }
  }

  return {
    chores: chores.map((chore) =>
      chore.id === editor.choreId
        ? {
            ...chore,
            title: editor.title.trim() || chore.title,
            tags: editor.tags.length > 0 ? [...editor.tags] : chore.tags,
            assigneeName: editor.assigneeName,
            recurrenceSummary: editor.recurrenceSummary,
            photoLabel: editor.photoLabel || null,
            canBump: editor.assigneeName !== 'Alex' && !chore.archived,
          }
        : chore
    ),
    editor: emptyEditorState,
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

export function archiveChoreInBoard(
  chores: ChoreCard[],
  choreId: string,
  editor: ChoreEditorState
): { chores: ChoreCard[]; editor: ChoreEditorState } {
  return {
    chores: chores.map((chore) =>
      chore.id === choreId
        ? {
            ...chore,
            archived: true,
            canBump: false,
          }
        : chore
    ),
    editor: editor.choreId === choreId ? emptyEditorState : editor,
  }
}
