import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { ThemeToggle } from '~/components/ThemeToggle';
import { withLayoutContext } from 'expo-router'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

const { Navigator } = createMaterialTopTabNavigator()
export const Tab = withLayoutContext(Navigator)

export default function TabLayout() {
    return (
        // <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>

        // </Tabs>
        <Tab
        screenOptions={{
            tabBarAllowFontScaling: true,
            tabBarShowIcon: true,
            tabBarScrollEnabled: true,
            tabBarShowLabel: true,
            swipeEnabled: true,
            lazy: true,
            lazyPreloadDistance: 0,
            //   lazyPlaceholder: lazyPlaceholder,
        }}
    >
        <Tabs.Screen
            name="index"
            options={{
                title: 'Workouts',
                headerRight: () => <ThemeToggle />,
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="bars" color={color} />,
            }}
        />
        <Tabs.Screen
            name="progress"
            options={{
                title: 'Progress',
                headerRight: () => <ThemeToggle />,
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="bar-chart" color={color} />,
            }}
        />
        <Tabs.Screen
            name="exercises"
            options={{
                title: 'Exercises',
                headerRight: () => <ThemeToggle />,
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="drupal" color={color} />,
            }}
        />
    </Tab>
    );
}
