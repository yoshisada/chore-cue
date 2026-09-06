import { memo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Paragraph,
  ScrollView,
  Separator,
  Sheet,
  SizableText,
  View,
  XStack,
  YStack,
  isWeb,
  useThemeName,
} from 'tamagui'

import { useHouseholdContext } from '~/features/auth/client/useHouseholdContext'
import { useMemberBoard } from '~/features/members/useMemberBoard'
import { Avatar } from '~/interface/avatars/Avatar'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { PageContainer } from '~/interface/layout/PageContainer'
import { H1, H3 } from '~/interface/text/Headings'
import { choreStateColors, memberAccentColors } from '~/tamagui/themes/playfulHousehold'

import { CheckIcon } from './components/CheckIcon'
import { PhotoInput } from './components/PhotoInput'
import { PhotoThumbnail } from './components/PhotoThumbnail'
import { useChoreBoard } from './useChoreBoard'

import type {
  ChoreCard,
  ChoreComposerState,
  ChoreEditorState,
  DueBucket,
  RecurrenceSummary,
} from './types'

function useStateColor(bucket: DueBucket): string {
  const themeName = useThemeName()
  const mode = themeName.startsWith('dark') ? 'dark' : 'light'
  return choreStateColors[mode][bucket]
}

function getMemberAccentColor(name: string, memberNames: string[]): string {
  const index = memberNames.indexOf(name)
  return memberAccentColors[(index >= 0 ? index : 0) % memberAccentColors.length]
}

const recurrenceOptions: RecurrenceSummary[] = ['Every N days', 'Weekly', 'Daily time']

function TagInput({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
}) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed)
      setInput('')
    }
  }

  return (
    <YStack gap="$2">
      <SectionLabel>Tags</SectionLabel>
      <XStack gap="$2" items="center">
        <Input
          flex={1}
          placeholder="Add a tag"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAdd}
        />
        <Button size="$3" onPress={handleAdd}>
          Add
        </Button>
      </XStack>
      {tags.length > 0 ? (
        <XStack gap="$2" flexWrap="wrap">
          {tags.map((tag) => (
            <Button key={tag} size="$3" variant="outlined" onPress={() => onRemove(tag)}>
              {tag} ×
            </Button>
          ))}
        </XStack>
      ) : null}
    </YStack>
  )
}

function SectionLabel({ children, accent }: { children: string; accent?: boolean }) {
  return (
    <SizableText
      fontFamily="$body"
      size="$2"
      fontWeight="600"
      letterSpacing={3}
      textTransform="uppercase"
      color={accent ? '$accentColor' : '$color8'}
    >
      {children}
    </SizableText>
  )
}

function SectionHeader({
  title,
  count,
  stateColor,
}: {
  title: string
  count: number
  stateColor?: string
}) {
  return (
    <XStack justify="space-between" items="center" pt="$4" pb="$2">
      <XStack items="center" gap="$2">
        {stateColor && <View width={8} height={8} borderRadius={4} bg={stateColor} />}
        <SizableText fontFamily="$heading" size="$5" fontWeight="600" color="$color">
          {title}
        </SizableText>
      </XStack>
      <View bg="$color3" px="$2" py="$1" borderRadius="$2">
        <SizableText fontFamily="$body" size="$1" color="$color8">
          {count}
        </SizableText>
      </View>
    </XStack>
  )
}

function ChoreCardItem({
  item,
  memberNames,
  onComplete,
  onBump,
  onEdit,
  onArchive,
}: {
  item: ChoreCard
  memberNames: string[]
  onComplete: (choreId: string) => void
  onBump: (choreId: string) => void
  onEdit: (choreId: string) => void
  onArchive: (choreId: string) => void
}) {
  const stateColor = useStateColor(item.dueBucket)
  const accentColor = getMemberAccentColor(item.assigneeName, memberNames)
  const [justCompleted, setJustCompleted] = useState(false)

  const handleComplete = () => {
    setJustCompleted(true)
    onComplete(item.id)
    setTimeout(() => setJustCompleted(false), 500)
  }

  return (
    <XStack
      borderRadius="$4"
      borderLeftWidth={4}
      borderLeftColor={stateColor}
      bg={`${stateColor}10`}
      p="$3"
      gap="$3"
      items="center"
      transition="playfulQuick"
      hoverStyle={{ bg: '$color2', scale: 1.01 }}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
    >
      <Avatar image={null} name={item.assigneeName} size="md" accentColor={accentColor} />

      <YStack flex={1} gap="$1">
        <XStack items="baseline" gap="$2" flexWrap="wrap">
          <H3 size="$5">{item.title}</H3>
          <SizableText fontFamily="$body" size="$2" color="$color8">
            {item.dueLabel}
          </SizableText>
        </XStack>

        <SizableText fontFamily="$body" size="$2" color="$color8">
          {item.tags.join(', ')} — {item.assigneeName} · {item.recurrenceSummary}
          {item.lastCompletedLabel ? ` · ${item.lastCompletedLabel}` : ''}
        </SizableText>

        <XStack gap="$2" pt="$1" flexWrap="wrap">
          <Button size="$3" onPress={handleComplete}>
            {justCompleted ? (
              <View
                animation="playfulBounce"
                enterStyle={{ scale: 0, opacity: 0 }}
                scale={1}
                opacity={1}
              >
                <CheckIcon size={16} />
              </View>
            ) : (
              'Complete'
            )}
          </Button>
          <Button size="$3" variant="outlined" onPress={() => onEdit(item.id)}>
            Edit
          </Button>
          <Button
            size="$3"
            variant="outlined"
            disabled={!item.canBump}
            onPress={() => onBump(item.id)}
          >
            {item.canBump ? 'Bump' : 'No bump'}
          </Button>
          <Button size="$3" variant="outlined" onPress={() => onArchive(item.id)}>
            Archive
          </Button>
        </XStack>
      </YStack>

      {item.photoLabel ? <PhotoThumbnail label={item.photoLabel} /> : null}
    </XStack>
  )
}

function Section({
  title,
  items,
  stateColor,
  memberNames,
  onComplete,
  onBump,
  onEdit,
  onArchive,
}: {
  title: string
  items: ChoreCard[]
  stateColor?: string
  memberNames: string[]
  onComplete: (choreId: string) => void
  onBump: (choreId: string) => void
  onEdit: (choreId: string) => void
  onArchive: (choreId: string) => void
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <YStack gap="$2">
      <SectionHeader title={title} count={items.length} stateColor={stateColor} />

      {items.map((item) => (
        <ChoreCardItem
          key={item.id}
          item={item}
          memberNames={memberNames}
          onComplete={onComplete}
          onBump={onBump}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
    </YStack>
  )
}

function ChoreSections({
  sections,
  memberNames,
  onComplete,
  onBump,
  onEdit,
  onArchive,
}: {
  sections: { overdue: ChoreCard[]; due: ChoreCard[]; upcoming: ChoreCard[] }
  memberNames: string[]
  onComplete: (choreId: string) => void
  onBump: (choreId: string) => void
  onEdit: (choreId: string) => void
  onArchive: (choreId: string) => void
}) {
  const overdueColor = useStateColor('overdue')
  const dueColor = useStateColor('due')
  const upcomingColor = useStateColor('upcoming')

  return (
    <YStack gap="$6">
      <Section
        title="Overdue"
        items={sections.overdue}
        stateColor={overdueColor}
        memberNames={memberNames}
        onComplete={onComplete}
        onBump={onBump}
        onEdit={onEdit}
        onArchive={onArchive}
      />
      <Section
        title="Due Soon"
        items={sections.due}
        stateColor={dueColor}
        memberNames={memberNames}
        onComplete={onComplete}
        onBump={onBump}
        onEdit={onEdit}
        onArchive={onArchive}
      />
      <Section
        title="Upcoming"
        items={sections.upcoming}
        stateColor={upcomingColor}
        memberNames={memberNames}
        onComplete={onComplete}
        onBump={onBump}
        onEdit={onEdit}
        onArchive={onArchive}
      />
    </YStack>
  )
}

export const ChoreHomePage = memo(() => {
  const insets = useSafeAreaInsets()
  const household = useHouseholdContext()
  const [createOpen, setCreateOpen] = useState(false)
  const { memberNames } = useMemberBoard()
  const {
    sections,
    allTags,
    selectedTags,
    searchQuery,
    setSearchQuery,
    composer,
    editor,
    bumpCount,
    updateComposer,
    addChore,
    completeChore,
    sendBump,
    beginEdit,
    updateEditor,
    saveEdit,
    archiveChore,
    attachComposerPhoto,
    clearComposerPhoto,
    attachEditorPhoto,
    clearEditorPhoto,
    toggleTag,
    clearTagFilter,
  } = useChoreBoard()

  const Container = isWeb ? YStack : ScrollView

  const hasNoChores =
    sections.overdue.length === 0 &&
    sections.due.length === 0 &&
    sections.upcoming.length === 0

  const handleAddChore = () => {
    addChore()
    setCreateOpen(false)
  }

  const handleBeginEdit = (choreId: string) => {
    beginEdit(choreId)
  }

  const handleSaveEdit = () => {
    saveEdit()
  }

  const handleArchiveFromEdit = () => {
    archiveChore(editor.choreId as string)
  }

  const addComposerTag = (tag: string) => {
    updateComposer('tags', [...composer.tags, tag])
  }

  const removeComposerTag = (tag: string) => {
    updateComposer(
      'tags',
      composer.tags.filter((t) => t !== tag)
    )
  }

  const addEditorTag = (tag: string) => {
    updateEditor('tags', [...editor.tags, tag])
  }

  const removeEditorTag = (tag: string) => {
    updateEditor(
      'tags',
      editor.tags.filter((t) => t !== tag)
    )
  }

  return (
    <Container
      flex={1}
      bg="$background"
      {...(!isWeb && {
        contentContainerStyle: {
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 40,
        },
      })}
    >
      <PageContainer>
        <YStack gap="$6" py="$5">
          {/* Hero — compact */}
          <XStack justify="space-between" items="flex-end" flexWrap="wrap" gap="$3">
            <YStack gap="$1" flex={1}>
              <H1 size="$8">
                Welcome to{' '}
                <SizableText
                  fontFamily="$heading"
                  size="$8"
                  fontWeight="700"
                  color="$accentColor"
                >
                  {household.householdName}
                </SizableText>
              </H1>
              <SizableText fontFamily="$body" size="$2" color="$color8">
                {household.displayName}
              </SizableText>
            </YStack>
            <Button size="$4" onPress={() => setCreateOpen(true)}>
              Create a chore
            </Button>
          </XStack>

          {/* Search bar */}
          <Input
            placeholder="Search chores..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Tag filter bar */}
          {allTags.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2" py="$1">
                <Button
                  size="$3"
                  variant={selectedTags.size === 0 ? undefined : 'outlined'}
                  onPress={clearTagFilter}
                >
                  All
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    size="$3"
                    variant={selectedTags.has(tag) ? undefined : 'outlined'}
                    onPress={() => toggleTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </XStack>
            </ScrollView>
          ) : null}

          {/* Create Sheet */}
          <Sheet
            open={createOpen}
            onOpenChange={setCreateOpen}
            transition="medium"
            modal
            dismissOnSnapToBottom
            snapPoints={[85]}
          >
            <Sheet.Overlay
              bg="$shadow6"
              transition="quick"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
            <Sheet.Frame bg="$color2" boxShadow="0 0 10px $shadow4">
              <ScrollView flex={1} contentContainerStyle={{ padding: 24 }}>
                <YStack gap="$4">
                  <SectionLabel>Create a chore</SectionLabel>

                  <Separator />

                  <Input
                    placeholder="Chore title"
                    value={composer.title}
                    onChangeText={(value) => updateComposer('title', value)}
                  />

                  <TagInput
                    tags={composer.tags}
                    onAdd={addComposerTag}
                    onRemove={removeComposerTag}
                  />

                  <YStack gap="$2">
                    <SectionLabel>Assignee</SectionLabel>
                    <XStack gap="$3" flexWrap="wrap">
                      {memberNames.map((name) => (
                        <Button
                          key={name}
                          size="$4"
                          variant={
                            composer.assigneeName === name ? undefined : 'outlined'
                          }
                          onPress={() => updateComposer('assigneeName', name)}
                        >
                          {name}
                        </Button>
                      ))}
                    </XStack>
                  </YStack>

                  <YStack gap="$2">
                    <SectionLabel>Recurrence</SectionLabel>
                    <XStack gap="$3" flexWrap="wrap">
                      {recurrenceOptions.map((option) => (
                        <Button
                          key={option}
                          size="$4"
                          variant={
                            composer.recurrenceSummary === option ? undefined : 'outlined'
                          }
                          onPress={() => updateComposer('recurrenceSummary', option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </XStack>
                  </YStack>

                  <PhotoInput
                    photoLabel={composer.photoLabel}
                    onPickSample={attachComposerPhoto}
                    onClear={clearComposerPhoto}
                  />

                  <XStack justify="space-between" items="center" gap="$3" flexWrap="wrap">
                    <SizableText fontFamily="$body" size="$2" color="$color8">
                      {bumpCount} of 5 daily bumps used
                    </SizableText>
                    <Button onPress={handleAddChore}>Add chore</Button>
                  </XStack>
                </YStack>
              </ScrollView>
            </Sheet.Frame>
          </Sheet>

          {/* Edit Sheet */}
          {editor.choreId ? (
            <Sheet
              open
              onOpenChange={(open: boolean) => {
                if (!open) saveEdit()
              }}
              transition="medium"
              modal
              dismissOnSnapToBottom
              snapPoints={[85]}
            >
              <Sheet.Overlay
                bg="$shadow6"
                transition="quick"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
              <Sheet.Frame bg="$color2" boxShadow="0 0 10px $shadow4">
                <ScrollView flex={1} contentContainerStyle={{ padding: 24 }}>
                  <YStack gap="$4">
                    <SectionLabel>Edit chore</SectionLabel>

                    <Separator />

                    <Input
                      placeholder="Chore title"
                      value={editor.title}
                      onChangeText={(value) => updateEditor('title', value)}
                    />

                    <TagInput
                      tags={editor.tags}
                      onAdd={addEditorTag}
                      onRemove={removeEditorTag}
                    />

                    <YStack gap="$2">
                      <SectionLabel>Assignee</SectionLabel>
                      <XStack gap="$3" flexWrap="wrap">
                        {memberNames.map((name) => (
                          <Button
                            key={name}
                            size="$4"
                            variant={
                              editor.assigneeName === name ? undefined : 'outlined'
                            }
                            onPress={() => updateEditor('assigneeName', name)}
                          >
                            {name}
                          </Button>
                        ))}
                      </XStack>
                    </YStack>

                    <YStack gap="$2">
                      <SectionLabel>Recurrence</SectionLabel>
                      <XStack gap="$3" flexWrap="wrap">
                        {recurrenceOptions.map((option) => (
                          <Button
                            key={option}
                            size="$4"
                            variant={
                              editor.recurrenceSummary === option ? undefined : 'outlined'
                            }
                            onPress={() => updateEditor('recurrenceSummary', option)}
                          >
                            {option}
                          </Button>
                        ))}
                      </XStack>
                    </YStack>

                    <PhotoInput
                      photoLabel={editor.photoLabel}
                      onPickSample={attachEditorPhoto}
                      onClear={clearEditorPhoto}
                    />

                    <XStack gap="$3" flexWrap="wrap">
                      <Button onPress={handleSaveEdit}>Save changes</Button>
                      <Button variant="outlined" onPress={handleArchiveFromEdit}>
                        Archive chore
                      </Button>
                    </XStack>
                  </YStack>
                </ScrollView>
              </Sheet.Frame>
            </Sheet>
          ) : null}

          {/* Chore sections */}
          {hasNoChores ? (
            <YStack
              borderRadius="$4"
              bg="$color2"
              pt="$8"
              pb="$6"
              items="center"
              gap="$3"
            >
              <SizableText
                fontFamily="$heading"
                size="$7"
                color="$color8"
                textAlign="center"
              >
                Nothing due yet
              </SizableText>
              <Paragraph
                fontFamily="$body"
                size="$3"
                color="$color8"
                textAlign="center"
                maxWidth={400}
              >
                Create a chore to start tracking your household tasks.
              </Paragraph>
            </YStack>
          ) : (
            <ChoreSections
              sections={sections}
              memberNames={memberNames}
              onComplete={completeChore}
              onBump={sendBump}
              onEdit={handleBeginEdit}
              onArchive={archiveChore}
            />
          )}
        </YStack>
      </PageContainer>
    </Container>
  )
})
