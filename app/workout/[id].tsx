import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { Triangle } from "lucide-react-native";
import { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import { ExerciseForm } from "~/components/exercises/exercise-form";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { DialogContent } from "~/components/ui/dialog";
import { DialogTrigger } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";
import { WorkoutExerciseForm } from "~/components/workouts/workout-exercise-form";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { DIALOG_CONTENT_MAP } from "~/lib/constants";
import { Calendar } from "~/lib/icons/Calendar";
import { ChevronRight } from "~/lib/icons/ChevronRight";
import { Clock } from "~/lib/icons/Clock";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { Trash2 } from "~/lib/icons/Trash2";
import { formatDate, formatTime } from "~/utils/date";

// Function to update exercise order in database - this is the direct implementation
const updateExerciseOrder = async (exerciseId: number, newOrder: number) => {
	try {
		await db
			.update(schema.workoutExercises)
			.set({
				sortOrder: newOrder,
			})
			.where(eq(schema.workoutExercises.id, exerciseId));
		return true;
	} catch (error) {
		alert(`Error updating exercise order: ${error}`);
		return false;
	}
};

// Function to swap the order of two exercises
const swapExerciseOrder = async (
	exercise1Id: number,
	exercise1Order: number,
	exercise2Id: number,
	exercise2Order: number,
) => {
	try {
		// Use a transaction to ensure both updates succeed or both fail
		await db.transaction(async (tx) => {
			// First update exercise1 to a temporary order (to avoid unique constraint issues)
			await tx
				.update(schema.workoutExercises)
				.set({
					sortOrder: -1,
				})
				.where(eq(schema.workoutExercises.id, exercise1Id));

			// Update exercise2 to exercise1's old order
			await tx
				.update(schema.workoutExercises)
				.set({
					sortOrder: exercise1Order,
				})
				.where(eq(schema.workoutExercises.id, exercise2Id));

			// Finally update exercise1 to exercise2's old order
			await tx
				.update(schema.workoutExercises)
				.set({
					sortOrder: exercise2Order,
				})
				.where(eq(schema.workoutExercises.id, exercise1Id));
		});

		return true;
	} catch (error) {
		alert(`Error updating exercise order: ${error}`);
		return false;
	}
};

const deleteWorkoutPlanExercise = async (id: number) => {
	try {
		await db
			.delete(schema.workoutExercises)
			.where(eq(schema.workoutExercises.id, id));
	} catch (error) {
		alert("Error deleting exercise");
	}
};

const completeWorkoutExercise = async (id: number) => {
	try {
		await db
			.update(schema.workoutExercises)
			.set({ completed: true })
			.where(eq(schema.workoutExercises.id, id));
	} catch (error) {
		alert("Error completing exercise");
	}
};

export default function Page() {
	const { id } = useLocalSearchParams();
	const [isUpdating, setIsUpdating] = useState(false); // Flag to prevent multiple simultaneous updates

	const [openAddWorkoutExerciseForm, setOpenAddWorkoutExerciseForm] =
		useState(false);
	const [openAddExerciseForm, setOpenAddExerciseForm] = useState(false);
	const [createdExercise, setCreatedExercise] =
		useState<schema.Exercise | null>(null);

	const [dialogContent, setDialogContent] = useState(
		DIALOG_CONTENT_MAP.WORKOUT_EXERCISE_FORM,
	);
	const openExerciseForm = () => {
		setDialogContent(DIALOG_CONTENT_MAP.EXERCISE_FORM);
		setOpenAddExerciseForm(true);
	};

	const openWorkoutExerciseForm = () => {
		setDialogContent(DIALOG_CONTENT_MAP.WORKOUT_EXERCISE_FORM);
		setOpenAddWorkoutExerciseForm(true);
	};

	const { data: workoutArray, error: workoutError } = useLiveQuery(
		db
			.select()
			.from(schema.workouts)
			.where(eq(schema.workouts.id, Number(id))),
	);

	// Fetch exercises for this workout
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
			.where(eq(schema.workoutExercises.workoutId, Number(id)))
			.orderBy(schema.workoutExercises.sortOrder),
	);

	// Function to move an exercise up
	const moveExerciseUp = async (index: number) => {
		if (!workoutExercises || index <= 0 || isUpdating) return;

		setIsUpdating(true);

		const currentExercise = workoutExercises[index];
		const prevExercise = workoutExercises[index - 1];

		try {
			await swapExerciseOrder(
				currentExercise.workoutExerciseId,
				currentExercise.workoutExerciseSortOrder,
				prevExercise.workoutExerciseId,
				prevExercise.workoutExerciseSortOrder,
			);
		} catch (error) {
			alert(`Error updating exercise order: ${error}`);
		} finally {
			setIsUpdating(false);
		}
	};

	// Function to move an exercise down
	const moveExerciseDown = async (index: number) => {
		if (!workoutExercises || index >= workoutExercises.length - 1 || isUpdating)
			return;

		setIsUpdating(true);

		const currentExercise = workoutExercises[index];
		const nextExercise = workoutExercises[index + 1];

		try {
			await swapExerciseOrder(
				currentExercise.workoutExerciseId,
				currentExercise.workoutExerciseSortOrder,
				nextExercise.workoutExerciseId,
				nextExercise.workoutExerciseSortOrder,
			);
		} catch (error) {
			alert(`Error updating exercise order: ${error}`);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleNotesChange = async (text: string) => {
		try {
			await db
				.update(schema.workouts)
				.set({ notes: text })
				.where(eq(schema.workouts.id, Number(id)));
		} catch (error) {
			console.error(error);
		}
	};

	// Function to handle exercise deletion with proper sort order updating
	const handleDeleteExercise = async (
		exerciseId: number,
		sortOrder: number,
	) => {
		if (isUpdating) return;

		setIsUpdating(true);

		try {
			// First delete the exercise
			await deleteWorkoutPlanExercise(exerciseId);

			// Then update the sort order of all exercises that came after the deleted one
			if (workoutExercises) {
				const exercisesToUpdate = workoutExercises.filter(
					(ex) => ex.workoutExerciseSortOrder > sortOrder,
				);

				// Update each exercise's sort order in sequence
				for (const ex of exercisesToUpdate) {
					await updateExerciseOrder(
						ex.workoutExerciseId,
						ex.workoutExerciseSortOrder - 1,
					);
				}
			}
		} catch (error) {
			alert(`Error deleting exercise: ${error}`);
		} finally {
			setIsUpdating(false);
		}
	};

	const deleteWorkout = async () => {
		try {
			await db
				.delete(schema.workouts)
				.where(eq(schema.workouts.id, Number(id)));
			router.replace("/");
		} catch (error) {
			alert("Error deleting workout");
		}
	};

	if (workoutError) {
		return <Text>Error: {workoutError.message}</Text>;
	}

	if (!workoutArray || workoutArray.length === 0) {
		return (
			<View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
				<ActivityIndicator size="large" color="##0284c7" />
			</View>
		);
	}

	const workout = workoutArray[0];

	return (
		<ScrollView className="flex-1 bg-secondary/30">
			{/* Header */}
			<View className="rounded-b-3xl bg-primary p-6">
				<Text className="mb-4 text-center text-4xl text-primary-foreground">
					Workout Details
				</Text>
				<View className="flex-row justify-around">
					<View className="flex-row items-center">
						<Calendar size={18} className="mr-2 text-primary-foreground" />
						<Text className="text-md text-primary-foreground">
							{workout.createdAt ? formatDate(workout.createdAt) : "No date"}
						</Text>
					</View>
					<View className="flex-row items-center">
						<Clock size={18} className="mr-2 text-primary-foreground" />
						<Text className="text-md text-primary-foreground">
							{workout.createdAt ? formatTime(workout.createdAt) : "No time"}
						</Text>
					</View>
				</View>
			</View>

			{/* Stats Summary */}
			<View className="mx-4 my-4 flex-row justify-between rounded-xl bg-card px-4 py-5 shadow-sm">
				<View className="flex items-center justify-center">
					<Text className="font-bold text-lg">{workoutExercises?.length}</Text>
					<Text className="text-muted-foreground text-sm">Exercises</Text>
				</View>
				<View className="flex items-center justify-center">
					<Text className="font-bold text-lg">
						{workoutExercises?.reduce(
							(acc, ex) => acc + ex.workoutExerciseSets,
							0,
						)}
					</Text>
					<Text className="text-muted-foreground text-sm">Sets</Text>
				</View>
				<View className="flex items-center justify-center">
					<Text className="font-bold text-lg">
						{workoutExercises?.length > 0
							? Math.round(
									(workoutExercises?.reduce(
										(acc, ex) => acc + (ex.workoutExerciseCompleted ? 1 : 0),
										0,
									) /
										workoutExercises?.length) *
										100,
								)
							: 0}
						%
					</Text>
					<Text className="text-muted-foreground text-sm">Completed</Text>
				</View>
			</View>

			<View className="px-4 pt-6">
				{/* Exercises Section */}
				<View className="mb-6">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-bold text-2xl">Exercises</Text>
						<Button
							variant="outline"
							className="ml-auto flex-row items-center justify-center gap-2"
							onPress={openWorkoutExerciseForm}
						>
							<Text className="font-bold text-primary">Add exercise</Text>
						</Button>
						{dialogContent === DIALOG_CONTENT_MAP.WORKOUT_EXERCISE_FORM && (
							<Dialog
								open={openAddWorkoutExerciseForm}
								onOpenChange={setOpenAddWorkoutExerciseForm}
							>
								<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
									<WorkoutExerciseForm
										setOpen={setOpenAddWorkoutExerciseForm}
										workoutId={Number(id)}
										currentExercisesAmount={workoutExercises?.length || 0}
										openExerciseForm={openExerciseForm}
										exerciseName={createdExercise?.name}
										exerciseId={createdExercise?.id}
										setCreatedExercise={setCreatedExercise}
									/>
								</DialogContent>
							</Dialog>
						)}
						{dialogContent === DIALOG_CONTENT_MAP.EXERCISE_FORM && (
							<Dialog
								open={openAddExerciseForm}
								onOpenChange={setOpenAddExerciseForm}
							>
								<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
									<ExerciseForm
										setOpen={setOpenAddExerciseForm}
										openWorkoutExerciseForm={openWorkoutExerciseForm}
										setCreatedExercise={setCreatedExercise}
									/>
								</DialogContent>
							</Dialog>
						)}
					</View>

					{/* Exercise Cards */}

					<View className="flex flex-1 flex-col gap-3">
						{!workoutExercises || workoutExercises.length === 0 ? (
							<View className="items-center rounded-lg bg-card p-6">
								<Dumbbell className="mb-4 size-10 text-muted-foreground" />
								<Text className="text-center text-muted-foreground">
									No exercises added to this workout yet.
								</Text>
								<Text className="text-center text-muted-foreground">
									Tap "Add Exercise" to get started!
								</Text>
							</View>
						) : (
							workoutExercises.map((item, index) => (
								<WorkoutExerciseListItem
									key={item.workoutExerciseId}
									workoutExerciseId={item.workoutExerciseId}
									exerciseName={item.exerciseName}
									exerciseType={item.exerciseType}
									exercisePrimaryMuscleGroup={item.exercisePrimaryMuscleGroup}
									workoutExerciseSets={item.workoutExerciseSets}
									workoutExerciseReps={item.workoutExerciseReps}
									workoutExerciseWeight={item.workoutExerciseWeight}
									workoutExerciseSortOrder={item.workoutExerciseSortOrder}
									totalExercises={workoutExercises.length}
									onMoveUp={() => moveExerciseUp(index)}
									onMoveDown={() => moveExerciseDown(index)}
									onDelete={() =>
										handleDeleteExercise(
											item.workoutExerciseId,
											item.workoutExerciseSortOrder,
										)
									}
									isUpdating={isUpdating}
									completed={item.workoutExerciseCompleted || false}
								/>
							))
						)}
					</View>
				</View>
			</View>

			{/* Notes */}
			<View className="mb-4 px-4">
				<Text className="mb-2 font-bold text-xl">Notes</Text>
				<View className="rounded-xl bg-card p-4 shadow-sm">
					<Textarea
						aria-labelledby="textareaLabel"
						className="border-0 p-0"
						value={workout.notes ?? undefined}
						onChangeText={handleNotesChange}
						placeholder="No notes for this workout. Tap to add notes about how you felt, what went well, or improvements for next time"
					/>
				</View>
			</View>

			<View className="mt-2 mb-8 flex-row px-4">
				<AlertDialog className="w-full">
					<AlertDialogTrigger asChild>
						<Button variant="destructive" className="ml-2 flex-1">
							<Text className="font-bold text-destructive-foreground">
								Delete workout
							</Text>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Confirm Delete</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete this workout? This action cannot
								be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>
								<Text>Cancel</Text>
							</AlertDialogCancel>
							<AlertDialogAction
								className="bg-destructive text-destructive-foreground"
								onPress={() => deleteWorkout()}
							>
								<Text>Continue</Text>
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</View>
		</ScrollView>
	);
}

type WorkoutExerciseListItemProps = {
	workoutExerciseId: number;
	exerciseName: string;
	exerciseType: string;
	exercisePrimaryMuscleGroup: string | null;
	workoutExerciseSets: number;
	workoutExerciseReps: number;
	workoutExerciseWeight: number;
	workoutExerciseSortOrder: number;
	totalExercises: number;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onDelete: () => void;
	isUpdating: boolean;
	completed: boolean;
};

const WorkoutExerciseListItem = ({
	workoutExerciseId,
	exerciseName,
	workoutExerciseSets,
	workoutExerciseReps,
	workoutExerciseWeight,
	workoutExerciseSortOrder,
	totalExercises,
	onMoveUp,
	onMoveDown,
	onDelete,
	isUpdating,
	completed,
}: WorkoutExerciseListItemProps) => {
	const [openUpdateForm, setOpenUpdateForm] = useState(false);

	return (
		<View className="flex flex-row items-center justify-between gap-3">
			<Dialog
				open={openUpdateForm}
				onOpenChange={setOpenUpdateForm}
				className="flex-1"
			>
				<DialogTrigger asChild>
					<Pressable>
						<View
							key={workoutExerciseId}
							className={`flex-row items-center justify-between p-4 ${workoutExerciseSortOrder < totalExercises ? "border-border border-b" : ""}`}
						>
							<View className="flex-1 flex-row items-center">
								<View
									className={`mr-3 h-8 w-8 items-center justify-center rounded-full ${completed ? "bg-green-100" : "bg-gray-100"}`}
								>
									<TouchableOpacity
										className="p-4"
										onPress={() => completeWorkoutExercise(workoutExerciseId)}
									>
										<Dumbbell
											size={16}
											color={completed ? "#22c55e" : "#9ca3af"}
										/>
									</TouchableOpacity>
								</View>
								<View className="flex-1">
									<Text className="text-lg">{exerciseName}</Text>
									<Text className="text-muted-foreground text-sm">
										{workoutExerciseSets} sets • {workoutExerciseReps} reps{" "}
										{workoutExerciseWeight > 0
											? `• ${workoutExerciseWeight} kg`
											: ""}
									</Text>
								</View>
							</View>
							<ChevronRight size={18} color="#9ca3af" />
						</View>
					</Pressable>
				</DialogTrigger>
				<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
					<WorkoutExerciseForm
						isUpdate={true}
						setOpen={setOpenUpdateForm}
						workoutExerciseId={workoutExerciseId}
						exerciseName={exerciseName}
						currentExercisesAmount={totalExercises}
						currentSets={workoutExerciseSets}
						currentReps={workoutExerciseReps}
						currentWeight={workoutExerciseWeight}
					/>
				</DialogContent>
			</Dialog>

			<View className="flex flex-row items-center justify-center gap-2">
				<TouchableOpacity
					onPress={onMoveUp}
					disabled={isUpdating || workoutExerciseSortOrder === 1}
				>
					<Triangle
						className="fill-muted-foreground text-muted-foreground"
						size={25}
					/>
				</TouchableOpacity>

				<Text>#{workoutExerciseSortOrder}</Text>

				<TouchableOpacity
					onPress={onMoveDown}
					disabled={isUpdating || workoutExerciseSortOrder === totalExercises}
				>
					<Triangle
						className="rotate-180 fill-muted-foreground text-muted-foreground"
						size={25}
					/>
				</TouchableOpacity>
			</View>
			<View className="flex items-center justify-center gap-2">
				<TouchableOpacity
					className="rounded-full bg-red-100 p-1.5"
					onPress={onDelete}
					disabled={isUpdating}
				>
					<Trash2 size={22} className="text-destructive" />
				</TouchableOpacity>
			</View>
		</View>
	);
};
