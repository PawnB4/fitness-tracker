import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { I18n } from "i18n-js";
import { TouchableOpacity, View } from "react-native";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import type { WorkoutPlan } from "~/db/schema";
import * as schema from "~/db/schema";

const i18n = new I18n({
	en: {
		exercise: "exercise",
		exercises: "exercises",
	},
	es: {
		exercise: "ejercicio",
		exercises: "ejercicios",
	},
});

export const WorkoutPlanCard = ({
	id,
	name,
	locale,
}: WorkoutPlan & { locale: string }) => {
	i18n.locale = locale;
	const { data: workoutPlanExercises, error: workoutPlanExercisesError } =
		useLiveQuery(
			db
				.select()
				.from(schema.workoutPlanExercises)
				.where(eq(schema.workoutPlanExercises.planId, id)),
		);

	if (workoutPlanExercisesError) {
		return <Text>Error: {workoutPlanExercisesError.message}</Text>;
	}

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={() => router.push(`/workout-plan/${id}`)}
		>
			<Card className="flex-1 rounded-2xl">
				<CardContent className="px-3 py-4">
					<View className="flex flex-row items-center gap-2 pl-8">
						<CardTitle className="leading-normal">{name}</CardTitle>
						<Text className="ml-auto pr-8 font-funnel-bold text-foreground/70">
							{workoutPlanExercises?.length}{" "}
							{workoutPlanExercises?.length === 1
								? i18n.t("exercise")
								: i18n.t("exercises")}
						</Text>
					</View>
				</CardContent>
			</Card>
		</TouchableOpacity>
	);
};
