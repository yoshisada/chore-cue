import { Link, usePathname } from 'one'
import { useMedia, XStack, View } from 'tamagui'

import { Pressable } from '~/interface/buttons/Pressable'
import { HouseIcon } from '~/interface/icons/phosphor/HouseIcon'
import { UsersThreeIcon } from '~/interface/icons/phosphor/UsersThreeIcon'
import { UserCircleIcon } from '~/interface/icons/phosphor/UserCircleIcon'

import type { Href } from 'one'

type TabRoute = {
  name: string
  href: Href
  icon: any
}

const routes: TabRoute[] = [
  { name: 'home', href: '/home/feed', icon: HouseIcon },
  { name: 'members', href: '/home/members', icon: UsersThreeIcon },
  { name: 'profile', href: '/home/settings', icon: UserCircleIcon },
]

export function NavigationTabs() {
  const pathname = usePathname()
  const media = useMedia()
  const iconSize = media.sm ? 24 : 20

  const currentTab =
    routes.find((r) => pathname.startsWith(r.href as string))?.name ?? 'home'

  return (
    <XStack gap="$2">
      {routes.map((route) => {
        const Icon = route.icon
        const isActive = currentTab === route.name
        return (
          <Link key={route.name} href={route.href}>
            <Pressable
              px="$4"
              py="$2"
              bg="transparent"
              borderBottomWidth={isActive ? 2 : 0}
              borderBottomColor={isActive ? '$color12' : 'transparent'}
              hoverStyle={{ bg: '$color2' }}
            >
              <Icon size={iconSize} color={isActive ? '$color12' : '$color8'} />
            </Pressable>
          </Link>
        )
      })}
    </XStack>
  )
}
