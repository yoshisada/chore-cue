import { router, Tabs } from 'one'
import { useTheme } from 'tamagui'

import { HouseIcon } from '~/interface/icons/phosphor/HouseIcon'
import { UserCircleIcon } from '~/interface/icons/phosphor/UserCircleIcon'
import { UsersThreeIcon } from '~/interface/icons/phosphor/UsersThreeIcon'

export function TabsLayout() {
  const theme = useTheme()

  return (
    <Tabs
      initialRouteName="feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accentColor.get(),
        tabBarInactiveTintColor: theme.color8.get(),
        tabBarStyle: {
          backgroundColor: theme.color2.get(),
          borderTopColor: theme.color4.get(),
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => <HouseIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          tabBarLabel: 'Members',
          tabBarIcon: ({ color, size }) => <UsersThreeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: (e) => {
            e.preventDefault()
            router.push('/home/settings')
          },
        }}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCircleIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
