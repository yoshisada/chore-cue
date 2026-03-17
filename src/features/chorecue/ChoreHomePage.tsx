import { memo } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Card,
  Paragraph,
  ScrollView,
  Separator,
  SizableText,
  Theme,
  XStack,
  YStack,
} from 'tamagui'

import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { PageContainer } from '~/interface/layout/PageContainer'
import { H1, H3 } from '~/interface/text/Headings'
import { useHouseholdContext } from '~/features/auth/client/useHouseholdContext'

import { PhotoInput } from './components/PhotoInput'
import { useChoreBoard } from './useChoreBoard'
import type { ChoreCard, RecurrenceSummary } from './types'

const recurrenceOptions: RecurrenceSummary[] = ['Every N days', 'Weekly', 'Daily time']

function Section({
  title,
  items,
  themeName,
  onComplete,
  onBump,
  onEdit,
  onArchive,
}: {
  title: string
  items: ChoreCard[]
  themeName: 'red' | 'yellow' | 'green'
  onComplete: (choreId: string) => void
  onBump: (choreId: string) => void
  onEdit: (choreId: string) => void
  onArchive: (choreId: string) => void
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <YStack gap="$3">
      <Theme name={themeName}>
        <XStack justify="space-between" items="center">
          <H3 color="$color11">{title}</H3>
          <SizableText size="$3" color="$color11">
            {items.length} chore{items.length === 1 ? '' : 's'}
          </SizableText>
        </XStack>
      </Theme>

      {items.map((item) => (
        <Card key={item.id} elevate bordered>
          <Card.Header padded>
            <YStack gap="$2">
              <XStack justify="space-between" items="center" gap="$3">
                <YStack gap="$1" flex={1}>
                  <H3>{item.title}</H3>
                  <Paragraph opacity={0.75}>
                    {item.category} | {item.assigneeName}
                  </Paragraph>
                </YStack>
                <Theme name={themeName}>
                  <SizableText size="$3" color="$color11">
                    {item.dueLabel}
                  </SizableText>
                </Theme>
              </XStack>

              <Paragraph opacity={0.8}>{item.recurrenceSummary}</Paragraph>
              {item.lastCompletedLabel ? (
                <Paragraph opacity={0.7}>{item.lastCompletedLabel}</Paragraph>
              ) : (
                <Paragraph opacity={0.6}>No completion history yet</Paragraph>
              )}
              {item.photoLabel ? (
                <Paragraph opacity={0.7}>Photo: {item.photoLabel}</Paragraph>
              ) : (
                <Paragraph opacity={0.6}>No photo attached</Paragraph>
              )}

              <XStack gap="$2" pt="$1" flexWrap="wrap">
                <Button theme="green" size="$4" onPress={() => onComplete(item.id)}>
                  Complete
                </Button>
                <Button size="$4" variant="outlined" onPress={() => onEdit(item.id)}>
                  Edit
                </Button>
                <Button
                  theme={item.canBump ? 'orange' : 'gray'}
                  size="$4"
                  variant="outlined"
                  disabled={!item.canBump}
                  onPress={() => onBump(item.id)}
                >
                  {item.canBump ? 'Send bump' : 'No bump needed'}
                </Button>
                <Button theme="red" size="$4" variant="outlined" onPress={() => onArchive(item.id)}>
                  Archive
                </Button>
              </XStack>
            </YStack>
          </Card.Header>
        </Card>
      ))}
    </YStack>
  )
}

export const ChoreHomePage = memo(() => {
  const insets = useSafeAreaInsets()
  const household = useHouseholdContext()
  const {
    sections,
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
  } = useChoreBoard()

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <PageContainer>
          <YStack gap="$6" py="$4">
            <YStack gap="$2">
              <Paragraph theme="alt2" size="$5">
                ChoreCue Phase 1 on Takeout
              </Paragraph>
              <H1 size="$8">Shared chores with clearer due states and gentler reminders</H1>
              <Paragraph size="$5" opacity={0.8} maxWidth={760}>
                The stock Takeout todo demo has been replaced with a ChoreCue household board.
                This screen demonstrates the Phase 1 loop: create recurring chores, scan
                overdue and upcoming work, complete chores, and keep bumps polite.
              </Paragraph>
              <Paragraph opacity={0.7}>
                Household: {household.householdId} | Member: {household.displayName}
              </Paragraph>
            </YStack>

            <Card bordered elevate>
              <Card.Header padded>
                <YStack gap="$3">
                  <H3>Create a chore</H3>
                  <XStack gap="$2" flexWrap="wrap">
                    <Input
                      flex={1}
                      minWidth={220}
                      placeholder="Chore title"
                      value={composer.title}
                      onChangeText={(value) => updateComposer('title', value)}
                    />
                    <Input
                      flex={1}
                      minWidth={180}
                      placeholder="Category"
                      value={composer.category}
                      onChangeText={(value) => updateComposer('category', value)}
                    />
                  </XStack>

                  <XStack gap="$2" flexWrap="wrap">
                    {(['Sam', 'Alex'] as const).map((name) => (
                      <Button
                        key={name}
                        size="$4"
                        theme={composer.assigneeName === name ? 'blue' : 'gray'}
                        variant={composer.assigneeName === name ? undefined : 'outlined'}
                        onPress={() => updateComposer('assigneeName', name)}
                      >
                        {name}
                      </Button>
                    ))}
                  </XStack>

                  <XStack gap="$2" flexWrap="wrap">
                    {recurrenceOptions.map((option) => (
                      <Button
                        key={option}
                        size="$4"
                        theme={composer.recurrenceSummary === option ? 'green' : 'gray'}
                        variant={composer.recurrenceSummary === option ? undefined : 'outlined'}
                        onPress={() => updateComposer('recurrenceSummary', option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </XStack>

                  <PhotoInput
                    photoLabel={composer.photoLabel}
                    onPickSample={attachComposerPhoto}
                    onClear={clearComposerPhoto}
                  />

                  <XStack justify="space-between" items="center" gap="$3" flexWrap="wrap">
                    <Paragraph opacity={0.7}>
                      {bumpCount} of 5 daily bumps used in this local screen state
                    </Paragraph>
                    <Button theme="blue" onPress={addChore}>
                      Add chore
                    </Button>
                  </XStack>
                </YStack>
              </Card.Header>
            </Card>

            {editor.choreId ? (
              <Card bordered elevate>
                <Card.Header padded>
                  <YStack gap="$3">
                    <H3>Edit chore</H3>
                    <XStack gap="$2" flexWrap="wrap">
                      <Input
                        flex={1}
                        minWidth={220}
                        placeholder="Chore title"
                        value={editor.title}
                        onChangeText={(value) => updateEditor('title', value)}
                      />
                      <Input
                        flex={1}
                        minWidth={180}
                        placeholder="Category"
                        value={editor.category}
                        onChangeText={(value) => updateEditor('category', value)}
                      />
                    </XStack>

                    <XStack gap="$2" flexWrap="wrap">
                      {(['Sam', 'Alex'] as const).map((name) => (
                        <Button
                          key={name}
                          size="$4"
                          theme={editor.assigneeName === name ? 'blue' : 'gray'}
                          variant={editor.assigneeName === name ? undefined : 'outlined'}
                          onPress={() => updateEditor('assigneeName', name)}
                        >
                          {name}
                        </Button>
                      ))}
                    </XStack>

                    <XStack gap="$2" flexWrap="wrap">
                      {recurrenceOptions.map((option) => (
                        <Button
                          key={option}
                          size="$4"
                          theme={editor.recurrenceSummary === option ? 'green' : 'gray'}
                          variant={editor.recurrenceSummary === option ? undefined : 'outlined'}
                          onPress={() => updateEditor('recurrenceSummary', option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </XStack>

                    <PhotoInput
                      photoLabel={editor.photoLabel}
                      onPickSample={attachEditorPhoto}
                      onClear={clearEditorPhoto}
                    />

                    <XStack gap="$2" flexWrap="wrap">
                      <Button theme="blue" onPress={saveEdit}>
                        Save changes
                      </Button>
                      <Button theme="red" variant="outlined" onPress={() => archiveChore(editor.choreId as string)}>
                        Archive chore
                      </Button>
                    </XStack>
                  </YStack>
                </Card.Header>
              </Card>
            ) : null}

            <Separator />

            <Section
              title="Overdue"
              items={sections.overdue}
              themeName="red"
              onComplete={completeChore}
              onBump={sendBump}
              onEdit={beginEdit}
              onArchive={archiveChore}
            />
            <Section
              title="Due Soon"
              items={sections.due}
              themeName="yellow"
              onComplete={completeChore}
              onBump={sendBump}
              onEdit={beginEdit}
              onArchive={archiveChore}
            />
            <Section
              title="Upcoming"
              items={sections.upcoming}
              themeName="green"
              onComplete={completeChore}
              onBump={sendBump}
              onEdit={beginEdit}
              onArchive={archiveChore}
            />
          </YStack>
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  )
})
