import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { ThemeToggle } from '~/components/ThemeToggle';
import { BicepsFlexed } from '~/lib/icons/BicepsFlexed';
import { ChartNoAxesCombined } from '~/lib/icons/ChartNoAxesCombined';
import { Dumbbell } from '~/lib/icons/Dumbbell';

export default function TabLayout() {
  return (
    <Tabs >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workouts',
          headerRight: () => <ThemeToggle />,
          tabBarLabel: ({ children, color, focused, position }) => <Text
          className={`text-xs font-semibold ${focused ? "text-sky-600" : "text-foreground"}`}>{children}</Text>,
          tabBarIcon: ({ color, focused }) => <BicepsFlexed className={focused ? "text-sky-600" : "text-foreground"} size={23}  />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerRight: () => <ThemeToggle />,
          tabBarLabel: ({ children, color, focused, position }) => <Text
          className={`text-xs font-semibold ${focused ? "text-sky-600" : "text-foreground"}`}>{children}</Text>,
          tabBarIcon: ({ color, focused }) => <ChartNoAxesCombined className={focused ? "text-sky-600" : "text-foreground"} size={23}  />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          headerRight: () => <ThemeToggle />,
          tabBarLabel: ({ children, color, focused, position }) => <Text
          className={`text-xs font-semibold ${focused ? "text-sky-600" : "text-foreground"}`}>{children}</Text>,
          tabBarIcon: ({ color, focused }) => <Dumbbell className={focused ? "text-sky-600" : "text-foreground"} size={23}  />,
        }}
      />
    </Tabs>
  );
}
