import { Tabs } from "expo-router";
import { Text } from "~/components/ui/text";
import { UserButton } from "~/components/user/user-button";
import { BicepsFlexed } from "~/lib/icons/BicepsFlexed";
import { ChartNoAxesCombined } from "~/lib/icons/ChartNoAxesCombined";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { House } from "~/lib/icons/House";
export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarStyle: {
					height: 70,
					paddingBottom: 10,
					paddingTop: 10,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					// title: "",
					headerTitleStyle: { fontSize: 24, lineHeight: 32 },
					// headerRight: () => <UserButton />,
					headerShown: false,
					tabBarLabel: ({ children, focused }) => (
						<Text
							className={`font-semibold text-sm ${focused ? "text-sky-600" : "text-foreground/80"}`}
						>
							{children}
						</Text>
					),
					tabBarIcon: ({ focused }) => (
						<House
							className={focused ? "text-sky-600" : "text-foreground/80"}
							size={23}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="progress"
				options={{
					title: "Progress",
					headerTitleStyle: { fontSize: 24, lineHeight: 32 },
					headerRight: () => <UserButton />,
					tabBarLabel: ({ children, focused }) => (
						<Text
							className={`font-semibold text-sm ${focused ? "text-sky-600" : "text-foreground/80"}`}
						>
							{children}
						</Text>
					),
					tabBarIcon: ({ focused }) => (
						<ChartNoAxesCombined
							className={focused ? "text-sky-600" : "text-foreground/80"}
							size={23}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="workout-plans"
				options={{
					title: "Workout Plans",
					headerTitleStyle: { fontSize: 24, lineHeight: 32 },
					headerRight: () => <UserButton />,
					tabBarLabel: ({ children, focused }) => (
						<Text
							className={`font-semibold text-sm ${focused ? "text-sky-600" : "text-foreground/80"}`}
						>
							{children}
						</Text>
					),
					tabBarIcon: ({ focused }) => (
						<BicepsFlexed
							className={focused ? "text-sky-600" : "text-foreground/80"}
							size={23}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="exercises"
				options={{
					title: "Exercises",
					headerTitleStyle: { fontSize: 24, lineHeight: 32 },
					headerRight: () => <UserButton />,
					tabBarLabel: ({ children, focused }) => (
						<Text
							className={`font-semibold text-sm ${focused ? "text-sky-600" : "text-foreground/80"}`}
						>
							{children}
						</Text>
					),
					tabBarIcon: ({ focused }) => (
						<Dumbbell
							className={focused ? "text-sky-600" : "text-foreground/80"}
							size={23}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
