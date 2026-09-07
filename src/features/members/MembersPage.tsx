import { memo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  ScrollView,
  Separator,
  Sheet,
  SizableText,
  XStack,
  YStack,
  isWeb,
  useThemeName,
} from 'tamagui'

import { Avatar } from '~/interface/avatars/Avatar'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { PageContainer } from '~/interface/layout/PageContainer'
import { H1, H3 } from '~/interface/text/Headings'
import { showToast } from '~/interface/toast/helpers'
import { errorTextColors, memberAccentColors } from '~/tamagui/themes/playfulHousehold'

import { useMemberBoard } from './useMemberBoard'

import type { Member, MemberRole } from './types'

const roleOptions: MemberRole[] = ['admin', 'member']

function SectionLabel({ children }: { children: string }) {
  return (
    <SizableText
      fontFamily="$body"
      size="$2"
      fontWeight="600"
      letterSpacing={3}
      textTransform="uppercase"
      color="$color8"
    >
      {children}
    </SizableText>
  )
}

/** inline, in-place feedback for a roster write the server refused */
function FormError({ message }: { message: string | null }) {
  const themeName = useThemeName()
  const mode = themeName.startsWith('dark') ? 'dark' : 'light'

  if (!message) {
    return null
  }

  return (
    <SizableText
      testID="member-add-error"
      fontFamily="$body"
      size="$2"
      color={errorTextColors[mode]}
    >
      {message}
    </SizableText>
  )
}

function MemberCard({
  member,
  index,
  onRemove,
}: {
  member: Member
  index: number
  onRemove: (id: string) => void
}) {
  const accentColor =
    memberAccentColors[index % memberAccentColors.length] ?? memberAccentColors[0]

  return (
    <XStack
      testID="member-card"
      rounded="$4"
      bg="$color2"
      p="$4"
      gap="$4"
      items="center"
      hoverStyle={{ bg: '$color3' }}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      transition="playfulQuick"
    >
      <Avatar
        testID="member-avatar"
        image={null}
        name={member.name}
        size="lg"
        accentColor={accentColor}
      />

      <YStack flex={1} gap="$1">
        <H3 size="$5">{member.name}</H3>
        <SizableText fontFamily="$body" size="$1" fontWeight="600" color="$color8">
          {member.role}
        </SizableText>
      </YStack>

      <Button size="$3" variant="outlined" onPress={() => onRemove(member.id)}>
        Deactivate
      </Button>
    </XStack>
  )
}

export const MembersPage = memo(() => {
  const insets = useSafeAreaInsets()
  const [addOpen, setAddOpen] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const { members, composer, updateComposer, addMember, removeMember } = useMemberBoard()

  const Container = isWeb ? YStack : ScrollView

  // a rejected add keeps the sheet open with the composer intact, so the reason
  // is visible next to the field the user has to change
  const handleAdd = async () => {
    const result = await addMember()
    if (!result.ok) {
      const reason = result.error ?? 'Could not add that member'
      setAddError(reason)
      showToast(reason, { type: 'error' })
      return
    }
    setAddError(null)
    setAddOpen(false)
  }

  const handleAddOpenChange = (open: boolean) => {
    if (!open) setAddError(null)
    setAddOpen(open)
  }

  // members are deactivated, never deleted: chore assignee FKs are
  // ON DELETE RESTRICT, so removing a row would orphan history
  const handleRemove = async (memberId: string) => {
    const result = await removeMember(memberId)
    if (!result.ok) {
      showToast(result.error ?? 'Could not deactivate that member', { type: 'error' })
    }
  }

  return (
    <Container
      testID="members-page"
      flex={1}
      bg="$background"
      {...(!isWeb && {
        contentContainerStyle: {
          pt: insets.top,
          pb: insets.bottom + 40,
        },
      })}
    >
      <PageContainer>
        <YStack gap="$6" py="$5">
          {/* Hero */}
          <XStack justify="space-between" items="flex-end" flexWrap="wrap" gap="$3">
            <YStack gap="$1" flex={1}>
              <H1 size="$8">
                Family{' '}
                <SizableText
                  fontFamily="$heading"
                  size="$8"
                  fontWeight="700"
                  color="$accentColor"
                >
                  Members
                </SizableText>
              </H1>
              <SizableText fontFamily="$body" size="$2" color="$color8">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </SizableText>
            </YStack>
            <Button size="$4" onPress={() => setAddOpen(true)}>
              Add member
            </Button>
          </XStack>

          {/* Add Member Sheet */}
          <Sheet
            open={addOpen}
            onOpenChange={handleAddOpenChange}
            transition="medium"
            modal
            dismissOnSnapToBottom
            snapPoints={[55]}
          >
            <Sheet.Overlay
              bg="rgba(0, 0, 0, 0.5)"
              transition="quick"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
            <Sheet.Frame
              testID="member-add-sheet"
              bg="$color2"
              boxShadow="0 0 10px $shadow4"
            >
              <ScrollView flex={1} contentContainerStyle={{ p: 24 }}>
                <YStack gap="$4">
                  <SectionLabel>Add a member</SectionLabel>

                  <Separator />

                  <Input
                    placeholder="Name"
                    value={composer.name}
                    onChangeText={(value) => updateComposer('name', value)}
                  />

                  <YStack gap="$2">
                    <SectionLabel>Role</SectionLabel>
                    <XStack gap="$3" flexWrap="wrap">
                      {roleOptions.map((role) => (
                        <Button
                          key={role}
                          size="$4"
                          variant={composer.role === role ? undefined : 'outlined'}
                          onPress={() => updateComposer('role', role)}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Button>
                      ))}
                    </XStack>
                  </YStack>

                  <FormError message={addError} />

                  <Button onPress={() => void handleAdd()}>Add member</Button>
                </YStack>
              </ScrollView>
            </Sheet.Frame>
          </Sheet>

          {/* Member List */}
          {members.length === 0 ? (
            <YStack
              testID="members-empty"
              rounded="$4"
              bg="$color2"
              pt="$8"
              pb="$6"
              items="center"
              gap="$3"
            >
              <SizableText fontFamily="$heading" size="$7" color="$color8" text="center">
                No members yet
              </SizableText>
              <SizableText
                fontFamily="$body"
                size="$3"
                color="$color8"
                text="center"
                maxW={400}
              >
                Add family members to assign chores to them.
              </SizableText>
            </YStack>
          ) : (
            <YStack gap="$3">
              {members.map((member, index) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  onRemove={handleRemove}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </PageContainer>
    </Container>
  )
})
