import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { ThemeToggle } from '~/components/ThemeToggle';
import { BicepsFlexed } from '~/lib/icons/BicepsFlexed';
import { ChartNoAxesCombined } from '~/lib/icons/ChartNoAxesCombined';
import { Dumbbell } from '~/lib/icons/Dumbbell';
import { House } from '~/lib/icons/House';


export default function TabLayout() {
  return (
    <Tabs >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitleStyle: { fontFamily: "ContrailOne_400Regular", fontSize: 24, lineHeight: 32 },
          headerRight: () => <ThemeToggle />,
          tabBarLabel: ({ children, focused, }) => <Text
            style={{ fontFamily: "ContrailOne_400Regular" }}
            className={`text-sm  font-semibold ${focused ? "text-sky-600" : "text-foreground/80"}`}>{children}</Text>,
          tabBarIcon: ({ focused }) => <House className={focused ? "text-sky-600" : "text-foreground/80"} size={23} />,
        }}
      />
      <Tabs.Screen
        name="workout-plans"
        options={{
          title: 'Workout Plans',
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
