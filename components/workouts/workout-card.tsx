import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import type { Workout } from "~/db/schema";
import * as schema from "~/db/schema";
import { CircleCheck } from "~/lib/icons/CircleCheck";
import { CircleX } from "~/lib/icons/CircleX";
import { Clock } from "~/lib/icons/Clock";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { formatTime } from "~/utils/date";
import { formatDate } from "~/utils/date";

export const WorkoutCard = ({ id, createdAt }: Workout) => {
	const { data: workoutExercises, error: exercisesError } = useLiveQuery(
		db
			.select({
				workoutExerciseId: schema.workoutExercises.id,
				exerciseName: schema.exercises.name,
				exerciseType: schema.exercises.type,
				exercisePrimaryMuscleGroup: schema.exercises.primaryMuscleGroup,
				workoutExerciseSets: schema.workoutExercises.sets,
				workoutExerciseReps: schema.workoutExercises.reps,
				workoutExerciseWeight: schema.workoutExercises.weight,
				workoutExerciseSortOrder: schema.workoutExercises.sortOrder,
				workoutExerciseCompleted: schema.workoutExercises.completed,
			})
			.from(schema.workoutExercises)
			.innerJoin(
				schema.exercises,
				eq(schema.workoutExercises.exerciseId, schema.exercises.id),
			)
			.where(eq(schema.workoutExercises.workoutId, id))
			.orderBy(schema.workoutExercises.sortOrder),
	);

	return (
		<Pressable onPress={() => router.push(`/workout/${id}`)}>
			<Card className="flex-1 rounded-2xl shadow">
				<CardContent className="m-0 flex gap-2 px-3 py-2">
					<CardTitle className="font-bold leading-normal tracking-wider">
						Workout of {formatDate(createdAt ?? "")}
					</CardTitle>

					<View className="h-1 rounded bg-sky-500/70" />
					<View className="mt-2 flex-row justify-evenly">
						<View className="flex-row items-center gap-2 border-0">
							<Clock className="mr-1 size-3 text-primary" />
							<Text className="text-primary text-sm">
								{createdAt ? formatTime(createdAt) : "No time"}
							</Text>
						</View>
						<View className="flex-row items-center gap-2 border-0">
							<Dumbbell className="mr-1 size-3 text-primary" />
							<Text className="text-primary text-sm">
								{workoutExercises?.length || 0} Exercise
								{workoutExercises?.length === 1 ? "" : "s"}
							</Text>
						</View>
						<View className="flex-row items-center gap-2 border-0">
							{workoutExercises?.length > 0 &&
							Math.round(
								(workoutExercises?.reduce(
									(acc, ex) => acc + (ex.workoutExerciseCompleted ? 1 : 0),
									0,
								) /
									workoutExercises?.length) *
									100,
							) === 100 ? (
								<View className="flex-row items-center gap-2 border-0">
									<CircleCheck
										className="mr-1 size-3 text-primary"
										fill={"#4ade80"}
									/>
									<Text className="text-primary text-sm">Completed</Text>
								</View>
							) : (
								<View className="flex-row items-center gap-2 border-0">
									<CircleX
										className="mr-1 size-3 text-primary"
										fill={"#f87171"}
									/>
									<Text className="text-primary text-sm">Not completed</Text>
								</View>
							)}
						</View>
					</View>
				</CardContent>
			</Card>
		</Pressable>
	);
};
