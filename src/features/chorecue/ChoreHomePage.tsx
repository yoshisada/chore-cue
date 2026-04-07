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
} from 'tamagui'

import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { PageContainer } from '~/interface/layout/PageContainer'
import { H1, H3 } from '~/interface/text/Headings'
import { useHouseholdContext } from '~/features/auth/client/useHouseholdContext'

import { useMemberBoard } from '~/features/members/useMemberBoard'

import { PhotoInput } from './components/PhotoInput'
import { PhotoThumbnail } from './components/PhotoThumbnail'
import { useChoreBoard } from './useChoreBoard'
import type { ChoreCard, ChoreComposerState, ChoreEditorState, RecurrenceSummary } from './types'

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
            <Button
              key={tag}
              size="$3"
              variant="outlined"
              onPress={() => onRemove(tag)}
            >
              {tag} ×
            </Button>
          ))}
        </XStack>
      ) : null}
    </YStack>
  )
}

function SectionLabel({
  children,
  accent,
}: {
  children: string
  accent?: boolean
}) {
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
  accent,
}: {
  title: string
  count: number
  accent?: boolean
}) {
  return (
    <XStack
      justify="space-between"
      items="center"
      borderTopWidth={2}
      borderTopColor={accent ? '$accentColor' : '$borderColor'}
      pt="$4"
      pb="$2"
    >
      <SizableText
        fontFamily="$heading"
        size="$5"
        fontWeight="600"
        color={accent ? '$accentColor' : '$color'}
      >
        {title}
      </SizableText>
      <View
        bg="$color3"
        px="$2"
        py="$1"
        borderRadius={0}
      >
        <SizableText fontFamily="$body" size="$1" color="$color8">
          {count}
        </SizableText>
      </View>
    </XStack>
  )
}

function ChoreCardItem({
  item,
  onComplete,
  onBump,
  onEdit,
  onArchive,
}: {
  item: ChoreCard
  onComplete: (choreId: string) => void
  onBump: (choreId: string) => void
  onEdit: (choreId: string) => void
  onArchive: (choreId: string) => void
}) {
  return (
    <XStack
      borderTopWidth={1}
      borderTopColor="$borderColor"
      py="$4"
      gap="$4"
      hoverStyle={{
        bg: '$color2',
      }}
    >
      <YStack flex={1} gap="$2">
        <XStack items="baseline" gap="$2" flexWrap="wrap">
          <H3 size="$6">{item.title}</H3>
          <SizableText fontFamily="$body" size="$2" color="$color8">
            · {item.dueLabel}
          </SizableText>
        </XStack>

        <SizableText fontFamily="$body" size="$2" color="$color8">
          {item.tags.join(', ')} — {item.assigneeName} · {item.recurrenceSummary}
          {item.lastCompletedLabel ? ` · ${item.lastCompletedLabel}` : ''}
        </SizableText>

        <XStack gap="$2" pt="$1" flexWrap="wrap">
          <Button size="$3" onPress={() => onComplete(item.id)}>
            Complete
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

      {item.photoLabel ? (
        <PhotoThumbnail label={item.photoLabel} />
      ) : null}
    </XStack>
  )
}

function Section({
  title,
  items,
  accent,
  onComplete,
  onBump,
  onEdit,
  onArchive,
}: {
  title: string
  items: ChoreCard[]
  accent?: boolean
  onComplete: (choreId: string) => void
  onBump: (choreId: string) => void
  onEdit: (choreId: string) => void
  onArchive: (choreId: string) => void
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <YStack>
      <SectionHeader title={title} count={items.length} accent={accent} />

      {items.map((item) => (
        <ChoreCardItem
          key={item.id}
          item={item}
          onComplete={onComplete}
          onBump={onBump}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
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
    updateComposer('tags', composer.tags.filter((t) => t !== tag))
  }

  const addEditorTag = (tag: string) => {
    updateEditor('tags', [...editor.tags, tag])
  }

  const removeEditorTag = (tag: string) => {
    updateEditor('tags', editor.tags.filter((t) => t !== tag))
  }

  return (
    <Container flex={1} bg="$background" {...(!isWeb && { contentContainerStyle: { paddingTop: insets.top, paddingBottom: insets.bottom + 40 } })}>
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
                  fontStyle="italic"
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
                          variant={composer.assigneeName === name ? undefined : 'outlined'}
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
                          variant={composer.recurrenceSummary === option ? undefined : 'outlined'}
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
                            variant={editor.assigneeName === name ? undefined : 'outlined'}
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
                            variant={editor.recurrenceSummary === option ? undefined : 'outlined'}
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
              borderTopWidth={2}
              borderTopColor="$borderColor"
              pt="$8"
              pb="$6"
              items="center"
              gap="$3"
            >
              <SizableText
                fontFamily="$heading"
                size="$7"
                fontStyle="italic"
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
            <YStack gap="$6">
              <Section
                title="Overdue"
                items={sections.overdue}
                accent
                onComplete={completeChore}
                onBump={sendBump}
                onEdit={handleBeginEdit}
                onArchive={archiveChore}
              />
              <Section
                title="Due Soon"
                items={sections.due}
                onComplete={completeChore}
                onBump={sendBump}
                onEdit={handleBeginEdit}
                onArchive={archiveChore}
              />
              <Section
                title="Upcoming"
                items={sections.upcoming}
                onComplete={completeChore}
                onBump={sendBump}
                onEdit={handleBeginEdit}
                onArchive={archiveChore}
              />
            </YStack>
          )}
        </YStack>
      </PageContainer>
    </Container>
  )
})
