import "~/global.css";

import {
	DarkTheme,
	DefaultTheme,
	type Theme,
	ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { SplashScreen } from "~/components/splash-screen";
import { Text } from "~/components/ui/text";
import { UserButton } from "~/components/user/user-button";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import migrations from "~/drizzle/migrations";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

const LIGHT_THEME: Theme = {
	...DefaultTheme,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DarkTheme,
	colors: NAV_THEME.dark,
};

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
	const hasMounted = useRef(false);
	// Get nativewind's theme manager
	const { colorScheme, isDarkColorScheme, setColorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);
	const { success, error: migrationsError } = useMigrations(db, migrations);

	// Query for user settings from database
	const { data: userSettings } = useLiveQuery(
		db.select().from(schema.user).limit(1),
	);
	const userConfig = userSettings[0]?.config;

	// Apply user's theme preference when it loads from DB
	useEffect(() => {
		if (
			userConfig?.preferredTheme &&
			(userConfig.preferredTheme === "dark" ||
				userConfig.preferredTheme === "light")
		) {
			setColorScheme(userConfig.preferredTheme);
		}
	}, [userConfig, setColorScheme]);

	useIsomorphicLayoutEffect(() => {
		if (hasMounted.current) {
			return;
		}

		if (Platform.OS === "web") {
			// Adds the background color to the html element to prevent white background on overscroll.
			document.documentElement.classList.add("bg-background");
		}
		setAndroidNavigationBar(colorScheme);
		setIsColorSchemeLoaded(true);
		hasMounted.current = true;
	}, [colorScheme]);

	if (!isColorSchemeLoaded) {
		return <SplashScreen />;
	}

	if (migrationsError) {
		console.log("migrationsError", migrationsError);
		return (
			<View>
				<Text>Migrations failed</Text>
				<Text>{migrationsError.message}</Text>
			</View>
		);
	}

	return (
		<ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
			<StatusBar style={isDarkColorScheme ? "light" : "dark"} />
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="workout/[id]"
					options={{
						headerTitle: "",
						headerRight: () => <UserButton />,
					}}
				/>
				<Stack.Screen
					name="workout/history"
					options={{
						headerTitle: "Workout History",
						headerRight: () => <UserButton />,
						animation: "slide_from_bottom",
					}}
				/>
				{/* This looks cool but its laggy and clunky */}
				{/* <Stack.Screen
					name="workout/history"
					options={{
						title: "Workout History",
						headerTitle: "Workout History",
						presentation: "formSheet",
						contentStyle: {
							height: "100%",
						},
						animation: "slide_from_bottom",
						sheetInitialDetentIndex: 0,
						sheetAllowedDetents: [0.75, 1],
						sheetCornerRadius: 20,
						sheetExpandsWhenScrolledToEdge: true,
						sheetElevation:24,
					}}
				/> */}
				<Stack.Screen
					name="workout-plan/[id]"
					options={{
						headerTitle: "",
						headerRight: () => <UserButton />,
					}}
				/>
				<Stack.Screen
					name="welcome/index"
					options={{
						headerTitle: "",
						headerShown: false,
					}}
				/>
			</Stack>
			<PortalHost />
		</ThemeProvider>
	);
}

const useIsomorphicLayoutEffect =
	Platform.OS === "web" && typeof window === "undefined"
		? useEffect
		: useLayoutEffect;
