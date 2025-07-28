import { FlashList } from "@shopify/flash-list";
import { desc } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { I18n } from "i18n-js";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { WorkoutCard } from "~/components/workouts/workout-card";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { Dumbbell } from "~/lib/icons/Dumbbell";

const i18n = new I18n({
	en: {
		noWorkoutsYet: "No workouts yet",
		createYourFirstWorkout: "Create your first workout to get started!",
	},
	es: {
		noWorkoutsYet: "No hay entrenamientos todavía",
		createYourFirstWorkout: "Crea tu primer entrenamiento para empezar!",
	},
});

// Define the structure for the processed data passed to WorkoutCard
type ProcessedWorkoutData = schema.Workout & {
	totalExercises: number;
	isCompleted: boolean;
};

export default function Page() {
	// Fetch workouts ordered by creation date
	const { data: workouts, error: workoutsError } = useLiveQuery(
		db.select().from(schema.workouts).orderBy(desc(schema.workouts.createdAt)),
	);
	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);
	i18n.locale = userLocale?.[0]?.locale ?? "en";

	// Fetch all workout exercises to process them
	// Note: This fetches ALL exercises. For large datasets, optimizing this might be needed.
	const { data: allWorkoutExercises, error: exercisesError } = useLiveQuery(
		db
			.select({
				id: schema.workoutExercises.id,
				workoutId: schema.workoutExercises.workoutId,
				completed: schema.workoutExercises.completed,
			})
			.from(schema.workoutExercises),
	);

	// Process workouts and exercises together using useMemo
	const processedWorkouts: ProcessedWorkoutData[] = useMemo(() => {
		if (!workouts || !allWorkoutExercises) {
			return []; // Return empty array if data isn't ready
		}

		// Create a map for quick lookup of exercises per workout
		const exercisesByWorkoutId = new Map<
			number,
			{ id: number; completed: boolean | null }[]
		>();
		for (const exercise of allWorkoutExercises) {
			if (!exercisesByWorkoutId.has(exercise.workoutId)) {
				exercisesByWorkoutId.set(exercise.workoutId, []);
			}
			exercisesByWorkoutId.get(exercise.workoutId)?.push({
				id: exercise.id,
				completed: exercise.completed,
			});
		}

		// Map workouts to the desired structure including calculated fields
		return workouts.map((workout) => {
			const exercises = exercisesByWorkoutId.get(workout.id) || [];
			const totalExercises = exercises.length;
			let isCompleted = false;
			if (totalExercises > 0) {
				const completedCount = exercises.reduce(
					(acc, ex) => acc + (ex.completed ? 1 : 0),
					0,
				);
				const percentage = (completedCount / totalExercises) * 100;
				isCompleted = Math.round(percentage) === 100;
			}

			return {
				...workout, // Spread existing workout fields (id, createdAt, etc.)
				totalExercises,
				isCompleted,
			};
		});
	}, [workouts, allWorkoutExercises]); // Re-calculate when workouts or exercises change

	// Show loading while data is being fetched
	if (!processedWorkouts) {
		return (
			<View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
				<ActivityIndicator color="#0284c7" size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 items-stretch gap-4 bg-secondary/30 px-4 py-8">
			{processedWorkouts.length === 0 && (
				<Card className="flex flex-row items-center justify-center gap-4 px-8 py-6">
					<Dumbbell className="text-muted-foreground" size={40} />
					<View className="flex flex-col items-center gap-1">
						<Text className="font-funnel-bold text-muted-foreground text-xl">
							{i18n.t("noWorkoutsYet")}
						</Text>
						<Text className="text-center text-muted-foreground">
							{i18n.t("createYourFirstWorkout")}
						</Text>
					</View>
				</Card>
			)}

			<FlashList
				data={processedWorkouts}
				estimatedItemSize={90}
				ItemSeparatorComponent={() => <View className="h-4" />}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<WorkoutCard
						createdAt={item.createdAt}
						id={item.id}
						isCompleted={item.isCompleted}
						locale={i18n.locale}
						totalExercises={item.totalExercises}
					/>
				)}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
