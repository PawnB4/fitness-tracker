import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	type Option,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { UserIcon } from "~/components/user/user-icon";
import { db, fitnessTrackerDb } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { History } from "~/lib/icons/History";
import { formatDate, formatTime } from "~/utils/date";

export const Overview = () => {
	const { data: workouts, error: workoutsError } = useLiveQuery(
		db.select({}).from(schema.workouts),
	);

	// Implement this function, it needs to query the workouts and considering the current date, how many weeks back the user has gone without having a

	return (
		<View className="flex flex-1 flex-row gap-2">
			<Card className="p-4">
				<View className="flex flex-col gap-3">
					<Text className="font-funnel-semibold text-lg">Current Streak</Text>
					<View className="flex-row items-center justify-between">
						<View>
							<Text className="font-funnel-bold text-2xl text-primary">{}</Text>
							<Text className="text-muted-foreground text-sm">
								Weeks with at least 2 workouts
							</Text>
						</View>
					</View>
				</View>
			</Card>
		</View>
	);
};
