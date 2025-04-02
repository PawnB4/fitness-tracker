import "~/global.css";

import {
	DarkTheme,
	DefaultTheme,
	type Theme,
	ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform } from "react-native";
import { SplashScreen } from "~/components/splash-screen";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { UserButton } from "~/components/user-button";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

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
	const hasMounted = React.useRef(false);
	// Get nativewind's theme manager
	const { colorScheme, isDarkColorScheme, setColorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
	const [isAppReady, setIsAppReady] = React.useState(false);
	
	// Query for user settings from database
	const { data: userSettings } = useLiveQuery(
		db.select().from(schema.user).limit(1)
	);
	const userConfig = userSettings?.[0]?.config;
	
	// Apply user's theme preference when it loads from DB
	React.useEffect(() => {
		if (userConfig?.preferredTheme && (userConfig.preferredTheme === "dark" || userConfig.preferredTheme === "light")) {
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
					name="workout-plan/[id]"
					options={{
						headerTitle: "",
						headerRight: () => <UserButton />,
					}}
				/>
			</Stack>
			<PortalHost />
		</ThemeProvider>
	);
}

const useIsomorphicLayoutEffect =
	Platform.OS === "web" && typeof window === "undefined"
		? React.useEffect
		: React.useLayoutEffect;
