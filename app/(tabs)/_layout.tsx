import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Tabs } from "expo-router";
import { I18n } from "i18n-js";
import { Text } from "~/components/ui/text";
import { UserButton } from "~/components/user/user-button";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { BicepsFlexed } from "~/lib/icons/BicepsFlexed";
import { ChartNoAxesCombined } from "~/lib/icons/ChartNoAxesCombined";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { House } from "~/lib/icons/House";

const i18n = new I18n({
	en: {
		home: "Home",
		progress: "Progress",
		workoutPlans: "Workout Plans",
		exercises: "Exercises",
	},
	es: {
		home: "Inicio",
		progress: "Progreso",
		workoutPlans: "Rutinas",
		exercises: "Ejercicios",
	},
});

export default function TabLayout() {
	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";
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
					title: i18n.t("home"),
					headerShown: false,
					tabBarLabel: ({ children, focused }) => (
						<Text
							className={`font-funnel-semibold text-sm ${focused ? "text-sky-600" : "text-foreground/80"}`}
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
					title: i18n.t("progress"),
					headerTitleStyle: {
						fontSize: 24,
						lineHeight: 32,
						fontFamily: "FunnelSans_500Medium",
					},
					headerRight: () => <UserButton />,
					tabBarLabel: ({ children, focused }) => (
						<Text
							className={`font-funnel-semibold text-sm ${focused ? "text-sky-600" : "text-foreground/80"}`}
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
					title: i18n.t("workoutPlans"),
					headerTitleStyle: {
						fontSize: 24,
						lineHeight: 32,
						fontFamily: "FunnelSans_500Medium",
					},
					headerRight: () => <UserButton />,
					tabBarLabel: ({ children, focused }) => (
						<Text
							className={`font-funnel-semibold text-sm ${focused ? "text-sky-600" : "text-foreground/80"}`}
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
					title: i18n.t("exercises"),
					headerTitleStyle: {
						fontSize: 24,
						lineHeight: 32,
						fontFamily: "FunnelSans_500Medium",
					},
					headerRight: () => <UserButton />,
					tabBarLabel: ({ children, focused }) => (
						<Text
							className={`font-funnel-semibold text-sm ${focused ? "text-sky-600" : "text-foreground/80"}`}
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
