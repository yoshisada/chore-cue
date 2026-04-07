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
} from 'tamagui'

import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { PageContainer } from '~/interface/layout/PageContainer'
import { H1, H3 } from '~/interface/text/Headings'
import { Avatar } from '~/interface/avatars/Avatar'
import { memberAccentColors } from '~/tamagui/themes/playfulHousehold'

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

function MemberCard({
  member,
  index,
  onRemove,
}: {
  member: Member
  index: number
  onRemove: (id: string) => void
}) {
  const accentColor = memberAccentColors[index % memberAccentColors.length]

  return (
    <XStack
      borderRadius="$4"
      bg="$color2"
      p="$4"
      gap="$4"
      items="center"
      hoverStyle={{ bg: '$color3' }}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      transition="playfulQuick"
    >
      <Avatar image={null} name={member.name} size="lg" accentColor={accentColor} />

      <YStack flex={1} gap="$1">
        <H3 size="$5">{member.name}</H3>
        <SizableText
          fontFamily="$body"
          size="$1"
          fontWeight="600"
          color="$color8"
        >
          {member.role}
        </SizableText>
      </YStack>

      <Button size="$3" variant="outlined" onPress={() => onRemove(member.id)}>
        Remove
      </Button>
    </XStack>
  )
}

export const MembersPage = memo(() => {
  const insets = useSafeAreaInsets()
  const [addOpen, setAddOpen] = useState(false)
  const {
    members,
    composer,
    updateComposer,
    addMember,
    removeMember,
  } = useMemberBoard()

  const Container = isWeb ? YStack : ScrollView

  const handleAdd = () => {
    addMember()
    setAddOpen(false)
  }

  return (
    <Container flex={1} bg="$background" {...(!isWeb && { contentContainerStyle: { paddingTop: insets.top, paddingBottom: insets.bottom + 40 } })}>
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
            onOpenChange={setAddOpen}
            transition="medium"
            modal
            dismissOnSnapToBottom
            snapPoints={[55]}
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

                  <Button onPress={handleAdd}>Add member</Button>
                </YStack>
              </ScrollView>
            </Sheet.Frame>
          </Sheet>

          {/* Member List */}
          {members.length === 0 ? (
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
                No members yet
              </SizableText>
              <SizableText
                fontFamily="$body"
                size="$3"
                color="$color8"
                textAlign="center"
                maxWidth={400}
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
                  onRemove={removeMember}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </PageContainer>
    </Container>
  )
})
