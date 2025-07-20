import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { I18n } from "i18n-js";
import { Triangle } from "lucide-react-native";
import { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import DraggableFlatList, {
	type DragEndParams,
	type RenderItemParams,
	ScaleDecorator,
} from "react-native-draggable-flatlist";
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
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";
import { WorkoutExerciseForm } from "~/components/workouts/workout-exercise-form";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { DIALOG_CONTENT_MAP, EXERCISES_TYPES } from "~/lib/constants";
import { Calendar } from "~/lib/icons/Calendar";
import { ChevronRight } from "~/lib/icons/ChevronRight";
import { Clock } from "~/lib/icons/Clock";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { Trash2 } from "~/lib/icons/Trash2";
import { formatDate, formatTime } from "~/utils/date";

const i18n = new I18n({
	en: {
		exercises: "exercises",
		exercise: "exercise",
		sets: "sets",
		reps: "reps",
		addExercise: "Add exercise",
		workoutDetails: "Workout Details",
		notes: "Notes",
		deleteWorkout: "Delete workout",
		confirmDelete: "Confirm Delete",
		deleteWorkoutConfirmation:
			"Are you sure you want to delete this workout? This action cannot be undone.",
		cancel: "Cancel",
		continue: "Continue",
		completed: "Completed",
		noExercisesYet: "No exercises added to this workout yet.",
		tapAddExerciseToGetStarted: 'Tap "Add Exercise" to get started!',
		noNotesPlaceholder:
			"No notes for this workout. Tap to add notes about how you felt, what went well, or improvements for next time",
		noDate: "No date",
		noTime: "No time",
	},
	es: {
		exercises: "ejercicios",
		exercise: "ejercicio",
		sets: "series",
		reps: "repeticiones",
		addExercise: "Agregar ejercicio",
		workoutDetails: "Detalles del entrenamiento",
		notes: "Notas",
		deleteWorkout: "Eliminar entrenamiento",
		confirmDelete: "Confirmar eliminación",
		deleteWorkoutConfirmation:
			"¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.",
		cancel: "Cancelar",
		continue: "Continuar",
		completed: "Completado",
		noExercisesYet: "No se agregaron ejercicios a este entrenamiento todavía.",
		tapAddExerciseToGetStarted: 'Tocá "Agregar ejercicio" para empezar!',
		noNotesPlaceholder:
			"Sin notas para este entrenamiento. Tocá para agregar notas sobre cómo te sentiste, qué salió bien, o mejoras para la próxima vez",
		noDate: "Sin fecha",
		noTime: "Sin hora",
	},
});

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
	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";

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
				exerciseId: schema.workoutExercises.exerciseId,
				exerciseName: schema.exercises.name,
				exerciseType: schema.exercises.type,
				exercisePrimaryMuscleGroup: schema.exercises.primaryMuscleGroup,
				workoutExerciseData: schema.workoutExercises.workoutExerciseData,
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

	// Drag and drop
	const onExerciseDropped = async (
		params: DragEndParams<WorkoutExerciseListItemProps>,
	) => {
		if (isUpdating) return;

		setIsUpdating(true);

		try {
			// Update each exercise's sort order in the database
			await Promise.all(
				params.data.map((item, index) =>
					updateExerciseOrder(item.workoutExerciseId, index + 1),
				),
			);
		} catch (error) {
			alert(`Error updating exercise order: ${error}`);
		} finally {
			setIsUpdating(false);
		}
	};

	if (workoutError) {
		return <Text>Error: {workoutError.message}</Text>;
	}

	if (!workoutArray || workoutArray.length === 0) {
		return (
			<View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
				<ActivityIndicator color="##0284c7" size="large" />
			</View>
		);
	}

	const workout = workoutArray[0];

	return (
		// This was to be a scroll view
		<View className="flex-1 bg-secondary/30">
			{/* Header */}
			<View className="rounded-b-3xl bg-primary p-6">
				<Text className="mb-4 text-center text-4xl text-primary-foreground">
					{i18n.t("workoutDetails")}
				</Text>
				<View className="flex-row justify-around">
					<View className="flex-row items-center">
						<Calendar className="mr-2 text-primary-foreground" size={18} />
						<Text className="text-md text-primary-foreground">
							{workout.createdAt
								? formatDate(workout.createdAt)
								: i18n.t("noDate")}
						</Text>
					</View>
					<View className="flex-row items-center">
						<Clock className="mr-2 text-primary-foreground" size={18} />
						<Text className="text-md text-primary-foreground">
							{workout.createdAt
								? formatTime(workout.createdAt)
								: i18n.t("noTime")}
						</Text>
					</View>
				</View>
			</View>

			{/* Stats Summary */}
			<View className="mx-4 my-4 flex-row justify-between rounded-xl bg-card px-4 py-5 shadow-sm">
				<View className="flex items-center justify-center">
					<Text className="font-funnel-bold text-lg">
						{workoutExercises?.length}
					</Text>
					<Text className="text-muted-foreground text-sm">
						{i18n.t("exercises")}
					</Text>
				</View>
				<View className="flex items-center justify-center">
					<Text className="font-funnel-bold text-lg">
						{workoutExercises?.reduce(
							(acc, ex) => acc + (ex.workoutExerciseData?.length || 0),
							0,
						)}
					</Text>
					<Text className="text-muted-foreground text-sm">
						{i18n.t("sets")}
					</Text>
				</View>
				<View className="flex items-center justify-center">
					<Text className="font-funnel-bold text-lg">
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
					<Text className="text-muted-foreground text-sm">
						{i18n.t("completed")}
					</Text>
				</View>
			</View>

			<View className="px-4 pt-6">
				{/* Exercises Section */}
				<View className="mb-6">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-funnel-bold text-2xl">Exercises</Text>
						<Button
							className="ml-auto flex-row items-center justify-center gap-2"
							onPress={openWorkoutExerciseForm}
							variant="outline"
						>
							<Text className="font-funnel-bold text-primary">
								{i18n.t("addExercise")}
							</Text>
						</Button>
						{dialogContent === DIALOG_CONTENT_MAP.WORKOUT_EXERCISE_FORM && (
							<Dialog
								onOpenChange={setOpenAddWorkoutExerciseForm}
								open={openAddWorkoutExerciseForm}
							>
								<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
									<WorkoutExerciseForm
										currentExercisesAmount={workoutExercises?.length || 0}
										exerciseId={createdExercise?.id}
										exerciseName={createdExercise?.name}
										locale={i18n.locale}
										openExerciseForm={openExerciseForm}
										setCreatedExercise={setCreatedExercise}
										setOpen={setOpenAddWorkoutExerciseForm}
										workoutId={Number(id)}
									/>
								</DialogContent>
							</Dialog>
						)}
						{dialogContent === DIALOG_CONTENT_MAP.EXERCISE_FORM && (
							<Dialog
								onOpenChange={setOpenAddExerciseForm}
								open={openAddExerciseForm}
							>
								<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
									<ExerciseForm
										openWorkoutExerciseForm={openWorkoutExerciseForm}
										setCreatedExercise={setCreatedExercise}
										setOpen={setOpenAddExerciseForm}
									/>
								</DialogContent>
							</Dialog>
						)}
					</View>

					{/* Exercise Cards */}

					{!workoutExercises || workoutExercises.length === 0 ? (
						<View className="items-center rounded-lg bg-card p-6">
							<Dumbbell className="mb-4 size-10 text-muted-foreground" />
							<Text className="text-center text-muted-foreground">
								{i18n.t("noExercisesYet")}
							</Text>
							<Text className="text-center text-muted-foreground">
								{i18n.t("tapAddExerciseToGetStarted")}
							</Text>
						</View>
					) : (
						<DraggableFlatList
							className="w-full"
							contentContainerStyle={{
								gap: 4,
							}}
							data={workoutExercises.map((item, index) => ({
								workoutExerciseId: item.workoutExerciseId,
								exerciseId: item.exerciseId,
								exerciseName: item.exerciseName,
								exerciseType: item.exerciseType,
								exercisePrimaryMuscleGroup: item.exercisePrimaryMuscleGroup,
								workoutExerciseData: item.workoutExerciseData,
								workoutExerciseSortOrder: item.workoutExerciseSortOrder,
								totalExercises: workoutExercises.length,
								onMoveUp: () => {}, // Not used with drag and drop
								onMoveDown: () => {}, // Not used with drag and drop
								onDelete: () =>
									handleDeleteExercise(
										item.workoutExerciseId,
										item.workoutExerciseSortOrder,
									),
								isUpdating: isUpdating,
								completed: item.workoutExerciseCompleted || false,
								locale: i18n.locale,
							}))}
							keyExtractor={(item) => item.workoutExerciseId.toString()}
							onDragBegin={() =>
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
							}
							onDragEnd={onExerciseDropped}
							renderItem={WorkoutExerciseListItem}
						/>
					)}
				</View>
			</View>

			{/* Notes */}
			<View className="mb-4 px-4">
				<Text className="mb-2 font-funnel-bold text-xl">{i18n.t("notes")}</Text>
				<View className="rounded-xl bg-card p-4 shadow-sm">
					<Textarea
						aria-labelledby="textareaLabel"
						className="border-0 p-0"
						onChangeText={handleNotesChange}
						placeholder={i18n.t("noNotesPlaceholder")}
						value={workout.notes ?? undefined}
					/>
				</View>
			</View>

			<View className="mt-2 mb-8 flex-row px-4">
				<AlertDialog className="w-full">
					<AlertDialogTrigger asChild>
						<Button className="ml-2 flex-1" variant="destructive">
							<Text className="font-funnel-bold text-destructive-foreground">
								{i18n.t("deleteWorkout")}
							</Text>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{i18n.t("confirmDelete")}</AlertDialogTitle>
							<AlertDialogDescription>
								{i18n.t("deleteWorkoutConfirmation")}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>
								<Text>{i18n.t("cancel")}</Text>
							</AlertDialogCancel>
							<AlertDialogAction
								className="bg-destructive text-destructive-foreground"
								onPress={() => deleteWorkout()}
							>
								<Text>{i18n.t("continue")}</Text>
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</View>
		</View>
	);
}

type WorkoutExerciseListItemProps = {
	workoutExerciseId: number;
	exerciseId: number;
	exerciseName: string;
	exerciseType: string;
	exercisePrimaryMuscleGroup: string | null;
	workoutExerciseData: schema.WorkoutExerciseData[];
	workoutExerciseSortOrder: number;
	totalExercises: number;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onDelete: () => void;
	isUpdating: boolean;
	completed: boolean;
	locale: string;
};

const WorkoutExerciseListItem = ({
	item,
	drag,
	isActive,
}: RenderItemParams<WorkoutExerciseListItemProps>) => {
	const [openUpdateForm, setOpenUpdateForm] = useState(false);

	// Calculate display values from the JSON data
	const totalSets = item.workoutExerciseData.length;
	const firstSet = item.workoutExerciseData[0];
	const isTimeBased =
		firstSet?.reps === null && firstSet?.durationSeconds !== null;

	// For display, show range if values vary, otherwise show single value
	const weights = item.workoutExerciseData.map((set) => set.weight);
	const uniqueWeights = [...new Set(weights)];
	const weightDisplay =
		uniqueWeights.length === 1
			? `${uniqueWeights[0]} kg`
			: `${Math.min(...weights)}-${Math.max(...weights)} kg`;

	let valueDisplay = "";
	if (isTimeBased) {
		const durations = item.workoutExerciseData
			.map((set) => set.durationSeconds)
			.filter((d) => d !== null);
		const uniqueDurations = [...new Set(durations)];
		valueDisplay =
			uniqueDurations.length === 1
				? `${uniqueDurations[0]}s`
				: `${Math.min(...durations)}-${Math.max(...durations)}s`;
	} else {
		const reps = item.workoutExerciseData
			.map((set) => set.reps)
			.filter((r) => r !== null);
		const uniqueReps = [...new Set(reps)];
		valueDisplay =
			uniqueReps.length === 1
				? `${uniqueReps[0]} ${i18n.t("reps")}`
				: `${Math.min(...reps)}-${Math.max(...reps)} ${i18n.t("reps")}`;
	}

	return (
		<ScaleDecorator>
			<TouchableOpacity
				activeOpacity={0.7}
				className={`flex w-full flex-row items-center justify-between gap-3 ${isActive ? "opacity-70" : ""}`}
				disabled={isActive}
				onLongPress={drag}
				onPress={() => setOpenUpdateForm(true)}
			>
				<Dialog
					className="flex-1"
					onOpenChange={setOpenUpdateForm}
					open={openUpdateForm}
				>
					<View
						className={`flex-row items-center justify-between p-4 ${item.workoutExerciseSortOrder < item.totalExercises ? "border-border border-b" : ""}`}
						key={item.workoutExerciseId}
					>
						<View className="flex-1 flex-row items-center">
							<View
								className={`mr-3 h-8 w-8 items-center justify-center rounded-full ${item.completed ? "bg-green-100" : "bg-gray-100"}`}
							>
								<TouchableOpacity
									className="p-4"
									onPress={() =>
										completeWorkoutExercise(item.workoutExerciseId)
									}
								>
									<Dumbbell
										color={item.completed ? "#22c55e" : "#9ca3af"}
										size={16}
									/>
								</TouchableOpacity>
							</View>
							<View className="flex-1">
								<Text className="text-lg">{item.exerciseName}</Text>
								<Text className="text-muted-foreground text-sm">
									{totalSets} {i18n.t("sets")} • {valueDisplay}
									{weightDisplay !== "0 kg" ? ` • ${weightDisplay}` : ""}
								</Text>
							</View>
						</View>
						<ChevronRight color="#9ca3af" size={18} />
					</View>
					<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
						<WorkoutExerciseForm
							currentExercisesAmount={item.totalExercises}
							exerciseId={item.exerciseId}
							exerciseName={item.exerciseName}
							existingExerciseData={item.workoutExerciseData}
							isUpdate={true}
							locale={item.locale}
							setOpen={setOpenUpdateForm}
							workoutExerciseId={item.workoutExerciseId}
						/>
					</DialogContent>
				</Dialog>

				<View className="flex flex-row items-center justify-center gap-2">
					<Text>#{item.workoutExerciseSortOrder}</Text>
				</View>
				<View className="flex items-center justify-center gap-2">
					<TouchableOpacity
						className="rounded-full bg-red-100 p-1.5"
						disabled={item.isUpdating}
						onPress={item.onDelete}
					>
						<Trash2 className="text-destructive" size={22} />
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</ScaleDecorator>
	);
};
