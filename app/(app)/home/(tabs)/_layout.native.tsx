import { router, Tabs } from 'one'
import { useTheme } from 'tamagui'

import { HouseIcon } from '~/interface/icons/phosphor/HouseIcon'
import { UserCircleIcon } from '~/interface/icons/phosphor/UserCircleIcon'
import { UsersThreeIcon } from '~/interface/icons/phosphor/UsersThreeIcon'

import type {
  BottomTabNavigationEventMap,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs'
import type {
  ParamListBase,
  ScreenListeners,
  TabNavigationState,
} from '@react-navigation/native'

/**
 * `one` types `Tabs.Screen` as the bare `views/Screen` component, so `options`
 * degrades to `object` and `listeners` is missing entirely — even though the
 * layout forwards both to the bottom-tab navigator at runtime
 * (`useSortedScreens` reads `listeners`). Re-typing the component here keeps
 * the tabPress interception below and gives `tabBarIcon` real parameter types.
 */
type TabScreenProps = {
  name: string
  options?: BottomTabNavigationOptions
  listeners?: ScreenListeners<
    TabNavigationState<ParamListBase>,
    BottomTabNavigationEventMap
  >
}

const TabScreen = Tabs.Screen as unknown as (props: TabScreenProps) => null

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
      <TabScreen
        name="feed"
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => <HouseIcon size={size} color={color} />,
        }}
      />
      <TabScreen
        name="members"
        options={{
          tabBarLabel: 'Members',
          tabBarIcon: ({ color, size }) => <UsersThreeIcon size={size} color={color} />,
        }}
      />
      <TabScreen
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
