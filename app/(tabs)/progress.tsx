import { count } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ScrollView, View } from "react-native";
import { MonthlyWorkouts } from "~/components/charts/monthly-workouts";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

export default function Page() {
	const { data: workoutCount, error: workoutCountError } = useLiveQuery(
		db
			.select({
				count: count(),
			})
			.from(schema.workouts),
	);

	if (workoutCount?.[0]?.count < 15) {
		return (
			<View className="flex flex-1 items-center justify-center">
				<Text>You need to do at least 15 workouts to see your progress.</Text>
			</View>
		);
	}
	return (
		<ScrollView className="flex flex-1 flex-col gap-8 p-4 ">
			<MonthlyWorkouts height={225} />
		</ScrollView>
	);
}
