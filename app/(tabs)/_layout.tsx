import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { ThemeToggle } from '~/components/ThemeToggle';
import { BicepsFlexed } from '~/lib/icons/BicepsFlexed';
import { ChartNoAxesCombined } from '~/lib/icons/ChartNoAxesCombined';
import { Dumbbell } from '~/lib/icons/Dumbbell';

const workouts = [
  {
    id: 1,
    name: 'Workout 1',
    date: '2024-01-01',
    exercises: [
      {
        id: 1,
        name: 'Deadlift',
        sets: 3,
        reps: 10,
        weight: 100,
      },
      {
        id: 2,
        name: 'Bench Press',
        sets: 3,
        reps: 12,
        weight: 80,
      },
      {
        id: 3,
        name: 'Squat',
        sets: 5,
        reps: 5,
        weight: 200,
      },
    ],
  },
]


export default function TabLayout() {
  return (
    <Tabs >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workouts',
          headerTitleStyle: { fontFamily: "ContrailOne_400Regular", fontSize: 24, lineHeight: 32 },
          headerRight: () => <ThemeToggle />,
          tabBarLabel: ({ children, focused, }) => <Text
            style={{ fontFamily: "ContrailOne_400Regular" }}
            className={`text-sm  font-semibold ${focused ? "text-sky-600" : "text-foreground/80"}`}>{children}</Text>,
          tabBarIcon: ({ focused }) => <BicepsFlexed className={focused ? "text-sky-600" : "text-foreground/80"} size={23} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitleStyle: { fontFamily: "ContrailOne_400Regular", fontSize: 24, lineHeight: 32 },
          headerRight: () => <ThemeToggle />,
          tabBarLabel: ({ children, focused, }) => <Text
            style={{ fontFamily: "ContrailOne_400Regular" }}
            className={`text-sm font-semibold ${focused ? "text-sky-600" : "text-foreground/80"}`}>{children}</Text>,
          tabBarIcon: ({ focused }) => <ChartNoAxesCombined className={focused ? "text-sky-600" : "text-foreground/80"} size={23} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          headerTitleStyle: { fontFamily: "ContrailOne_400Regular", fontSize: 24, lineHeight: 32 },
          headerRight: () => <ThemeToggle />,
          tabBarLabel: ({ children, focused, }) => <Text
            style={{ fontFamily: "ContrailOne_400Regular" }}
            className={`text-sm font-semibold ${focused ? "text-sky-600" : "text-foreground/80"}`}>{children}</Text>,
          tabBarIcon: ({ focused }) => <Dumbbell className={focused ? "text-sky-600" : "text-foreground/80"} size={23} />,
        }}
      />
    </Tabs>
  );
}
