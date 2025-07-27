import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { I18n } from "i18n-js";
import { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Animated,
	Pressable,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import DraggableFlatList, {
	type DragEndParams,
	NestableDraggableFlatList,
	NestableScrollContainer,
	type RenderItemParams,
	ScaleDecorator,
} from "react-native-draggable-flatlist";
import { ExerciseForm } from "~/components/exercises/exercise-form";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "~/components/ui/accordion";
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
import { Card } from "~/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";
import { WorkoutExerciseForm } from "~/components/workouts/workout-exercise-form";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import {
	DIALOG_CONTENT_MAP,
	EXERCISE_TYPES_COLOR_MAP,
	EXERCISES_TYPES,
	MUSCLE_GROUPS,
} from "~/lib/constants";
import { Calendar } from "~/lib/icons/Calendar";
import { ChevronRight } from "~/lib/icons/ChevronRight";
import { Clock } from "~/lib/icons/Clock";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { Pencil } from "~/lib/icons/Pencil";
import { Trash2 } from "~/lib/icons/Trash2";
import {
	formatDate,
	formatDurationFromSeconds,
	formatTime,
	minutesSecondsToTotalSeconds,
} from "~/utils/date";

const i18n = new I18n({
	en: {
		exercise: "exercise",
		set: "set",
		rep: "rep",
		duration: "time",
		weight: "weight",
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
		exerciseType: "Exercise type",
		primaryMuscle: "Primary muscle",
		editExercise: "Edit",
		deleteExercise: "Delete",
	},
	es: {
		exercise: "ejercicio",
		set: "serie",
		rep: "rep",
		duration: "tiempo",
		weight: "peso",
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
		exerciseType: "Tipo de ejercicio",
		primaryMuscle: "Músculo principal",
		editExercise: "Editar",
		deleteExercise: "Eliminar",
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

const toggleCompleted = async (id: number) => {
	const result = await db
		.select()
		.from(schema.workoutExercises)
		.where(eq(schema.workoutExercises.id, id));
	const completed = result?.[0]?.completed ?? false;

	try {
		await db
			.update(schema.workoutExercises)
			.set({ completed: !completed })
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
		<NestableScrollContainer className="flex-1 bg-secondary/30">
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
			<View className="px-4 pt-4">
				<View className="flex-row gap-3 rounded-xl p-4">
					<Card className="flex-1 items-center gap-1 rounded-lg bg-sky-50 p-3 shadow-none dark:bg-sky-900/20">
						<Text className="font-funnel-bold text-sky-700 text-xl dark:text-sky-300">
							{workoutExercises?.length}
						</Text>
						<Text className="text-center font-medium text-sky-600 text-xs uppercase tracking-wide dark:text-sky-400">
							{i18n.t("exercise").charAt(0).toUpperCase() +
								i18n.t("exercise").slice(1) +
								(workoutExercises?.length === 1 ? "" : "s")}
						</Text>
					</Card>

					<Card className="flex-1 items-center gap-1 rounded-lg bg-sky-50 p-3 shadow-none dark:bg-sky-900/20">
						<Text className="font-funnel-bold text-sky-700 text-xl dark:text-sky-300">
							{workoutExercises?.reduce(
								(acc, ex) => acc + (ex.workoutExerciseData?.length || 0),
								0,
							)}
						</Text>
						<Text className="text-center font-medium text-sky-600 text-xs uppercase tracking-wide dark:text-sky-400">
							{i18n.t("set").charAt(0).toUpperCase() +
								i18n.t("set").slice(1) +
								(workoutExercises?.reduce(
									(acc, ex) => acc + (ex.workoutExerciseData?.length || 0),
									0,
								) === 1
									? ""
									: "s")}
						</Text>
					</Card>

					<Card className="flex-1 items-center gap-1 rounded-lg bg-sky-50 p-3 shadow-none dark:bg-sky-900/20">
						<Text className="font-funnel-bold text-sky-700 text-xl dark:text-sky-300">
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
						<Text className="text-center font-medium text-sky-600 text-xs uppercase tracking-wide dark:text-sky-400">
							{i18n.t("completed")}
						</Text>
					</Card>
				</View>
			</View>

			<View className="px-4 pt-6">
				{/* Exercises Section */}
				<View className="mb-6">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-funnel-bold text-2xl">
							{i18n.t("exercise").charAt(0).toUpperCase() +
								i18n.t("exercise").slice(1)}
							s
						</Text>
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
						<Accordion className="w-full" collapsible type="multiple">
							<NestableDraggableFlatList
								className="w-full"
								contentContainerStyle={{
									gap: 12,
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
						</Accordion>
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

			<View className="w-full flex-1 flex-row px-4 py-8 pt-2">
				<AlertDialog className=" w-full">
					<AlertDialogTrigger asChild>
						<Button className="flex-1" size="lg" variant="destructive">
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
		</NestableScrollContainer>
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
	const [isExpanded, setIsExpanded] = useState(false);

	// Animation for exercise name size
	const fontSizeAnim = useRef(new Animated.Value(0)).current;

	// Handle expansion animation
	useEffect(() => {
		if (isExpanded) {
			// Only animate when expanding
			Animated.timing(fontSizeAnim, {
				toValue: 1,
				duration: 175,
				useNativeDriver: false,
			}).start();
		} else {
			// Immediately set back to small size without animation
			fontSizeAnim.setValue(0);
		}
	}, [isExpanded, fontSizeAnim]);

	// Interpolate font size from 18px (text-lg) to 20px (text-xl)
	const animatedFontSize = fontSizeAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [18, 20],
	});

	// Calculate display values from the JSON data
	const totalSets = item.workoutExerciseData.length;
	const firstSet = item.workoutExerciseData[0];
	const isTimeBased =
		firstSet?.reps === null && firstSet?.durationSeconds !== null;

	// Check if all sets are identical (for condensed view)
	const allSetsIdentical = item.workoutExerciseData.every(
		(set) =>
			set.reps === firstSet?.reps &&
			set.weight === firstSet?.weight &&
			set.durationSeconds === firstSet?.durationSeconds,
	);

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
				? `${uniqueReps[0]} ${i18n.t("rep").charAt(0).toUpperCase() + i18n.t("rep").slice(1) + (uniqueReps.length === 1 ? "" : "s")}`
				: `${Math.min(...reps)}-${Math.max(...reps)} ${i18n.t("rep").charAt(0).toUpperCase() + i18n.t("rep").slice(1) + (uniqueReps.length === 1 ? "" : "s")}`;
	}

	return (
		<AccordionItem
			className="border-0"
			value={item.workoutExerciseId.toString()}
		>
			<ScaleDecorator activeScale={1.02}>
				<Card
					className={`rounded-lg ${isActive ? "scale-105 opacity-70" : ""}`}
				>
					{/* Main exercise row */}
					<AccordionTrigger
						className="flex-row items-center gap-4 px-4 py-3"
						disabled={isActive}
						onLongPress={() => {
							if (isExpanded) return;
							drag();
						}}
						onPress={() => setIsExpanded(!isExpanded)}
					>
						{/* Sort order badge on the left */}
						<View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
							<Text className="font-funnel-bold text-primary-foreground text-sm">
								{item.workoutExerciseSortOrder}
							</Text>
						</View>

						{/* Exercise info - takes up most space */}
						<View className="flex-1">
							<Animated.Text
								className={`font-semibold text-foreground`}
								style={{ fontSize: animatedFontSize }}
							>
								{item.exerciseName}
							</Animated.Text>
							{!isExpanded && (
								<>
									<Text
										className="text-muted-foreground"
										ellipsizeMode="tail"
										numberOfLines={1}
									>
										{totalSets}{" "}
										{i18n.t("set").charAt(0).toUpperCase() +
											i18n.t("set").slice(1) +
											(totalSets === 1 ? "" : "s")}{" "}
										• {valueDisplay}
										{weightDisplay !== "0 kg" ? ` • ${weightDisplay}` : ""}
									</Text>
									<Text className="text-muted-foreground text-xs capitalize">
										{EXERCISES_TYPES[item.locale][item.exerciseType]}
										{" - "}
										{MUSCLE_GROUPS[item.locale][
											item.exercisePrimaryMuscleGroup ?? ""
										] ?? "General"}
									</Text>
								</>
							)}
						</View>

						{/* Complete button on the right */}
						<TouchableOpacity
							className={`h-10 w-10 items-center justify-center rounded-full ${
								item.completed
									? "border-2 border-green-200 bg-green-100"
									: "border-2 border-gray-200 bg-gray-100"
							}`}
							onPress={() => toggleCompleted(item.workoutExerciseId)}
						>
							<Dumbbell
								color={item.completed ? "#22c55e" : "#9ca3af"}
								size={18}
							/>
						</TouchableOpacity>
					</AccordionTrigger>

					{/* Accordion content with detailed set information */}
					<AccordionContent className="bg-slate-50/50 dark:bg-slate-900/20">
						<View className="gap-4 p-4 pt-3">
							{/* Sets display */}
							<View className="gap-3">
								<View>
									{/* Table header */}
									<View
										className="flex-row rounded-t-lg p-3"
										style={{
											backgroundColor:
												item.exerciseType === "upper_body"
													? "#16a34a10"
													: item.exerciseType === "lower_body"
														? "#8b5cf610"
														: item.exerciseType === "cardio"
															? "#eab30810"
															: item.exerciseType === "core"
																? "#ef444410"
																: "#0284c710",
										}}
									>
										<Text
											className="flex-1 text-center font-medium text-xs uppercase tracking-wide"
											style={{
												color: EXERCISE_TYPES_COLOR_MAP[item.exerciseType],
											}}
										>
											{i18n.t("set")}
											{allSetsIdentical && "s"}
										</Text>
										<Text
											className="flex-1 text-center font-medium text-xs uppercase tracking-wide"
											style={{
												color: EXERCISE_TYPES_COLOR_MAP[item.exerciseType],
											}}
										>
											{isTimeBased ? i18n.t("duration") : `${i18n.t("rep")}s`}
										</Text>
										<Text
											className="flex-1 text-center font-medium text-xs uppercase tracking-wide"
											style={{
												color: EXERCISE_TYPES_COLOR_MAP[item.exerciseType],
											}}
										>
											{i18n.t("weight")}
										</Text>
									</View>

									{allSetsIdentical ? (
										<View className="flex-row rounded-b-lg border-gray-200 border-x border-b bg-white p-3 dark:border-gray-700 dark:bg-gray-80">
											<Text className="flex-1 text-center font-medium text-sm">
												{item.workoutExerciseData.length}
											</Text>
											<Text className="flex-1 text-center text-sm">
												{isTimeBased
													? `${formatDurationFromSeconds(item.workoutExerciseData[0].durationSeconds ?? 0)}`
													: `${item.workoutExerciseData[0].reps}`}
											</Text>
											<Text className="flex-1 text-center text-sm">
												{item.workoutExerciseData[0].weight} kg
											</Text>
										</View>
									) : (
										<>
											{/* Table rows */}
											{item.workoutExerciseData.map((set, index) => (
												<View
													className={`flex-row border-gray-200 border-x bg-white p-3 dark:border-gray-700 dark:bg-gray-800 ${
														index === item.workoutExerciseData.length - 1
															? "rounded-b-lg border-b"
															: ""
													}
													${index > 0 ? "border-t" : ""}		
													`}
													key={`${item.workoutExerciseId}-${index}`}
												>
													<Text className="flex-1 text-center font-medium text-sm">
														{index + 1}
													</Text>
													<Text className="flex-1 text-center text-sm">
														{isTimeBased
															? `${formatDurationFromSeconds(set.durationSeconds ?? 0)}`
															: `${set.reps}`}
													</Text>
													<Text className="flex-1 text-center text-sm">
														{set.weight} kg
													</Text>
												</View>
											))}
										</>
									)}
								</View>
							</View>

							{/* Exercise details section here */}
							<View className="flex gap-2">
								<View className="flex-row items-center gap-2">
									<Text className="font-funnel-bold text-lg tracking-wide">
										{i18n.t("exerciseType")}:
									</Text>
									<Text className="text-lg">
										{EXERCISES_TYPES[item.locale][item.exerciseType]}
									</Text>
								</View>
								<View className="flex-row items-center gap-2">
									<Text className="font-funnel-bold text-lg tracking-wide">
										{i18n.t("primaryMuscle")}:
									</Text>
									<Text className="text-lg">
										{MUSCLE_GROUPS[item.locale][
											item.exercisePrimaryMuscleGroup ?? ""
										] ?? "General"}
									</Text>
								</View>
							</View>
							<Separator className="my-2" />

							{/* Exercise actions section */}
							<View className="flex-row gap-3">
								<Button
									className="flex-1 flex-row items-center justify-center gap-2"
									disabled={item.isUpdating}
									onPress={() => setOpenUpdateForm(true)}
									variant="outline"
								>
									<Pencil className="text-primary" size={16} />
									<Text className="font-medium text-primary text-sm">
										{i18n.t("editExercise")}
									</Text>
								</Button>
								<Button
									className="flex-1 flex-row items-center justify-center gap-2"
									disabled={item.isUpdating}
									onPress={item.onDelete}
									variant="destructive"
								>
									<Trash2 className="text-primary-foreground" size={16} />
									<Text className="font-medium text-primary-foreground text-sm">
										{i18n.t("deleteExercise")}
									</Text>
								</Button>
							</View>
						</View>
					</AccordionContent>
				</Card>

				{/* Update form dialog */}
				<Dialog onOpenChange={setOpenUpdateForm} open={openUpdateForm}>
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
			</ScaleDecorator>
		</AccordionItem>
	);
};
