import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { I18n } from "i18n-js";
import { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	TouchableOpacity,
	View,
} from "react-native";
import {
	type DragEndParams,
	NestableDraggableFlatList,
	NestableScrollContainer,
	type RenderItemParams,
	ScaleDecorator,
} from "react-native-draggable-flatlist";
import { ExerciseForm } from "~/components/exercises/exercise-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { WorkoutPlanExerciseForm } from "~/components/workout-plan/workout-plan-exercise-form";
import { WorkoutPlanForm } from "~/components/workout-plan/workout-plan-form";
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
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { Menu } from "~/lib/icons/Menu";
import { Plus } from "~/lib/icons/Plus";
import { Trash2 } from "~/lib/icons/Trash2";
import { formatDate } from "~/utils/date";

const i18n = new I18n({
	en: {
		exercises: "exercises",
		exercise: "exercise",
		created: "Created",
		noExercisesAddedToThisPlanYet: "No exercises added to this plan yet.",
		addExercise: "Add Exercise",
		tapAddExerciseToGetStarted: "Tap 'Add Exercise' to get started!",
	},
	es: {
		exercises: "ejercicios",
		exercise: "ejercicio",
		created: "Creado",
		noExercisesAddedToThisPlanYet:
			"No hay ejercicios agregados a esta rutina todavía.",
		addExercise: "Agregar ejercicio",
		tapAddExerciseToGetStarted: "Tocá 'Agregar ejercicio' para empezar!",
	},
});

const updateExerciseOrder = async (exerciseId: number, newOrder: number) => {
	try {
		await db
			.update(schema.workoutPlanExercises)
			.set({
				sortOrder: newOrder,
			})
			.where(eq(schema.workoutPlanExercises.id, exerciseId));
		return true;
	} catch (error) {
		alert(`Error updating exercise order: ${error}`);
		return false;
	}
};

const deleteWorkoutPlanExercise = async (id: number) => {
	try {
		await db
			.delete(schema.workoutPlanExercises)
			.where(eq(schema.workoutPlanExercises.id, id));
	} catch (error) {
		alert(`Error deleting exercise: ${error}`);
	}
};

export default function Page() {
	const { id } = useLocalSearchParams();

	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";

	const [openAddWorkoutPlanExerciseForm, setOpenAddWorkoutPlanExerciseForm] =
		useState(false);
	const [isUpdating, setIsUpdating] = useState(false); // Flag to prevent multiple simultaneous updates

	const [openAddExerciseForm, setOpenAddExerciseForm] = useState(false);
	const [openUpdateForm, setOpenUpdateForm] = useState(false);
	const [createdExercise, setCreatedExercise] =
		useState<schema.Exercise | null>(null);

	const [dialogContent, setDialogContent] = useState(
		DIALOG_CONTENT_MAP.WORKOUT_PLAN_EXERCISE_FORM,
	);

	const openExerciseForm = () => {
		setDialogContent(DIALOG_CONTENT_MAP.EXERCISE_FORM);
		setOpenAddExerciseForm(true);
	};

	const openWorkoutPlanExerciseForm = () => {
		setDialogContent(DIALOG_CONTENT_MAP.WORKOUT_PLAN_EXERCISE_FORM);
		setOpenAddWorkoutPlanExerciseForm(true);
	};

	const { data: workoutPlan, error: workoutError } = useLiveQuery(
		db
			.select()
			.from(schema.workoutPlans)
			.where(eq(schema.workoutPlans.id, Number(id))),
	);

	// Fetch exercises for this workout plan
	const { data: planExercises, error: exercisesError } = useLiveQuery(
		db
			.select({
				workoutPlanExerciseId: schema.workoutPlanExercises.id,
				exerciseId: schema.workoutPlanExercises.exerciseId,
				exerciseName: schema.exercises.name,
				exerciseType: schema.exercises.type,
				exercisePrimaryMuscleGroup: schema.exercises.primaryMuscleGroup,
				workoutPlanExerciseData:
					schema.workoutPlanExercises.workoutPlanExerciseData,
				workoutPlanExerciseSortOrder: schema.workoutPlanExercises.sortOrder,
			})
			.from(schema.workoutPlanExercises)
			.innerJoin(
				schema.exercises,
				eq(schema.workoutPlanExercises.exerciseId, schema.exercises.id),
			)
			.where(eq(schema.workoutPlanExercises.planId, Number(id)))
			.orderBy(schema.workoutPlanExercises.sortOrder),
	);

	// Drag and drop
	const onExerciseDropped = async (
		params: DragEndParams<WorkoutPlanExerciseListItemProps>,
	) => {
		if (isUpdating) return;

		setIsUpdating(true);

		try {
			// Update each exercise's sort order in the database
			await Promise.all(
				params.data.map((item, index) =>
					updateExerciseOrder(item.workoutPlanExerciseId, index + 1),
				),
			);
		} catch (error) {
			alert(`Error updating exercise order: ${error}`);
		} finally {
			setIsUpdating(false);
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
			if (planExercises) {
				const exercisesToUpdate = planExercises.filter(
					(ex) => ex.workoutPlanExerciseSortOrder > sortOrder,
				);

				// Update each exercise's sort order in sequence
				for (const ex of exercisesToUpdate) {
					await updateExerciseOrder(
						ex.workoutPlanExerciseId,
						ex.workoutPlanExerciseSortOrder - 1,
					);
				}
			}
		} catch (error) {
			alert(`Error deleting exercise: ${error}`);
		} finally {
			setIsUpdating(false);
		}
	};

	if (workoutError || exercisesError) {
		return (
			<Text>Error: {workoutError?.message || exercisesError?.message}</Text>
		);
	}

	if (!workoutPlan || workoutPlan.length === 0) {
		return (
			<View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
				<ActivityIndicator color="#0284c7" size="large" />
			</View>
		);
	}

	const plan = workoutPlan[0];

	return (
		<NestableScrollContainer className="flex-1 bg-secondary/30">
			{/* Header Section */}
			<View className="flex flex-col gap-2 rounded-b-3xl bg-primary p-6 shadow-md">
				<View className="flex-row items-center">
					<Text className="font-funnel-bold text-4xl text-primary-foreground">
						{plan.name}
					</Text>
					<View className="ml-auto flex-row">
						<Dialog onOpenChange={setOpenUpdateForm} open={openUpdateForm}>
							<DialogTrigger asChild>
								<TouchableOpacity className="rounded-full bg-primary-foreground/20 p-2.5">
									<Menu className="size-5 text-primary-foreground" />
								</TouchableOpacity>
							</DialogTrigger>
							<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
								<WorkoutPlanForm
									currentDescription={plan.description ?? undefined}
									currentName={plan.name}
									isUpdate={true}
									planId={plan.id}
									setOpen={setOpenUpdateForm}
								/>
							</DialogContent>
						</Dialog>
					</View>
				</View>
				{plan.description && (
					<Text className="font-funnel text-lg text-primary-foreground/80">
						{plan.description}
					</Text>
				)}
				<View className="h-1 rounded bg-sky-500/70" />

				<View className="flex flex-row items-center justify-around gap-2 pt-2">
					<View className="flex-row items-center gap-2 border-0">
						<Dumbbell className="mr-1 size-3 text-primary-foreground" />
						<Text className="font-funnel text-primary-foreground text-sm">
							{planExercises?.length || 0}{" "}
							{planExercises?.length === 1
								? i18n.t("exercise")
								: i18n.t("exercises")}
						</Text>
					</View>
					<View className="flex-row items-center gap-2 border-0">
						<Calendar className="mr-1 size-3 text-primary-foreground" />
						<Text className="font-funnel text-primary-foreground text-sm">
							{i18n.t("created")} {formatDate(plan.createdAt)}
						</Text>
					</View>
				</View>
			</View>

			{/* Main Content */}
			<View className="px-4 pt-6">
				{/* Exercises Section */}
				<View className="mb-6">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-funnel-bold text-2xl">
							{i18n.t("exercises").charAt(0).toUpperCase() +
								i18n.t("exercises").slice(1)}
						</Text>
					</View>

					{/* Exercise Cards */}

					<View className="flex flex-1 flex-col gap-3">
						{!planExercises || planExercises.length === 0 ? (
							<View className="items-center rounded-lg bg-card p-6">
								<Dumbbell className="mb-4 size-10 text-muted-foreground" />
								<Text className="text-center text-muted-foreground">
									{i18n.t("noExercisesAddedToThisPlanYet")}
								</Text>
								<Text className="text-center text-muted-foreground">
									{i18n.t("tapAddExerciseToGetStarted")}
								</Text>
							</View>
						) : (
							<NestableDraggableFlatList
								className="w-full"
								contentContainerStyle={{
									gap: 12,
								}}
								data={planExercises.map((item) => ({
									workoutPlanExerciseId: item.workoutPlanExerciseId,
									exerciseId: item.exerciseId,
									exerciseName: item.exerciseName,
									exerciseType: item.exerciseType,
									exercisePrimaryMuscleGroup: item.exercisePrimaryMuscleGroup,
									workoutPlanExerciseData: item.workoutPlanExerciseData,
									workoutPlanExerciseSortOrder:
										item.workoutPlanExerciseSortOrder,
									totalExercises: planExercises.length,
									onDelete: () =>
										handleDeleteExercise(
											item.workoutPlanExerciseId,
											item.workoutPlanExerciseSortOrder,
										),
									isUpdating: isUpdating,
								}))}
								keyExtractor={(item) => item.workoutPlanExerciseId.toString()}
								onDragBegin={() =>
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
								}
								onDragEnd={onExerciseDropped}
								renderItem={WorkoutPlanExerciseListItemRender}
							/>
						)}
						<Button
							className="flex-row items-center justify-center gap-2 bg-sky-500/70"
							onPress={openWorkoutPlanExerciseForm}
							size="lg"
						>
							<Plus className="text-primary" />
							<Text className="font-funnel-bold text-primary">
								{i18n.t("addExercise")}
							</Text>
						</Button>
						{dialogContent ===
							DIALOG_CONTENT_MAP.WORKOUT_PLAN_EXERCISE_FORM && (
							<Dialog
								onOpenChange={setOpenAddWorkoutPlanExerciseForm}
								open={openAddWorkoutPlanExerciseForm}
							>
								<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
									<WorkoutPlanExerciseForm
										currentExercisesAmount={planExercises?.length || 0}
										exerciseId={createdExercise?.id}
										exerciseName={createdExercise?.name}
										locale={i18n.locale}
										openExerciseForm={openExerciseForm}
										planId={Number(id)}
										setCreatedExercise={setCreatedExercise}
										setOpen={setOpenAddWorkoutPlanExerciseForm}
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
										openWorkoutPlanExerciseForm={openWorkoutPlanExerciseForm}
										setCreatedExercise={setCreatedExercise}
										setOpen={setOpenAddExerciseForm}
									/>
								</DialogContent>
							</Dialog>
						)}
					</View>
				</View>
			</View>
		</NestableScrollContainer>
	);
}

// Exercise list item component for plan exercises
type WorkoutPlanExerciseListItemProps = {
	workoutPlanExerciseId: number;
	exerciseName: string;
	exerciseType: string;
	exercisePrimaryMuscleGroup: string | null;
	workoutPlanExerciseData: schema.WorkoutPlanExerciseData[];
	workoutPlanExerciseSortOrder: number;
	totalExercises: number;
	onDelete: () => void;
	isUpdating: boolean;
	exerciseId: number;
};

const WorkoutPlanExerciseListItemRender = ({
	item,
	drag,
	isActive,
}: RenderItemParams<WorkoutPlanExerciseListItemProps>) => {
	return (
		<ScaleDecorator activeScale={1.02}>
			<WorkoutPlanExerciseListItem {...item} drag={drag} isActive={isActive} />
		</ScaleDecorator>
	);
};

const WorkoutPlanExerciseListItem = ({
	workoutPlanExerciseId,
	exerciseName,
	exerciseType,
	exercisePrimaryMuscleGroup,
	workoutPlanExerciseData,
	workoutPlanExerciseSortOrder,
	totalExercises,
	onDelete,
	isUpdating,
	exerciseId,
	drag,
	isActive,
}: WorkoutPlanExerciseListItemProps & {
	drag?: () => void;
	isActive?: boolean;
}) => {
	const [openUpdateForm, setOpenUpdateForm] = useState(false);

	// Calculate display values from the JSON data
	const totalSets = workoutPlanExerciseData.length;
	const firstSet = workoutPlanExerciseData[0];
	const isTimeBased =
		firstSet?.defaultReps === null && firstSet?.defaultDurationSeconds !== null;

	// For display, show range if values vary, otherwise show single value
	const weights = workoutPlanExerciseData.map((set) => set.defaultWeight);
	const uniqueWeights = [...new Set(weights)];
	const weightDisplay =
		uniqueWeights.length === 1
			? `${uniqueWeights[0]} kg`
			: `${Math.min(...weights)}-${Math.max(...weights)} kg`;

	let valueDisplay = "";
	if (isTimeBased) {
		const durations = workoutPlanExerciseData
			.map((set) => set.defaultDurationSeconds)
			.filter((d) => d !== null);
		const uniqueDurations = [...new Set(durations)];
		valueDisplay =
			uniqueDurations.length === 1
				? `${uniqueDurations[0]}s`
				: `${Math.min(...durations)}-${Math.max(...durations)}s`;
	} else {
		const reps = workoutPlanExerciseData
			.map((set) => set.defaultReps)
			.filter((r) => r !== null);
		const uniqueReps = [...new Set(reps)];
		valueDisplay =
			uniqueReps.length === 1
				? `${uniqueReps[0]} reps`
				: `${Math.min(...reps)}-${Math.max(...reps)} reps`;
	}

	return (
		<View className="flex flex-row items-center justify-between gap-3">
			<Dialog
				className="flex-1"
				onOpenChange={setOpenUpdateForm}
				open={openUpdateForm}
			>
				<DialogTrigger asChild>
					<Pressable onLongPress={drag}>
						<Card
							className={`overflow-hidden ${isActive ? "scale-105 opacity-70" : ""}`}
						>
							<CardContent className="p-0">
								<View className="flex-row">
									<View
										className="w-2"
										style={{
											backgroundColor: EXERCISE_TYPES_COLOR_MAP[exerciseType],
										}}
									/>

									<View className="flex-1 p-4">
										<View className="flex flex-row justify-between">
											<View className="flex-1 items-start gap-2">
												<Text className="text-lg text-muted-foreground">
													{workoutPlanExerciseSortOrder}
												</Text>
												<View className="flex items-center justify-center gap-2">
													<Text className="font-funnel-bold text-xl">
														{exerciseName}
													</Text>
												</View>
											</View>

											<View className="flex items-center gap-2">
												<TouchableOpacity
													className="rounded-full bg-red-100 p-1.5"
													disabled={isUpdating}
													onPress={onDelete}
												>
													<Trash2 className="text-destructive" size={22} />
												</TouchableOpacity>
											</View>
										</View>

										<Separator className="my-2" />

										<View className="flex flex-col gap-2">
											<View className="flex-row items-center gap-2">
												<Badge variant="secondary">
													<Text className="text-xs">
														{EXERCISES_TYPES[i18n.locale][exerciseType]}
													</Text>
												</Badge>
												{exercisePrimaryMuscleGroup && (
													<Badge variant="secondary">
														<Text className="text-xs">
															{
																MUSCLE_GROUPS[i18n.locale][
																	exercisePrimaryMuscleGroup
																]
															}
														</Text>
													</Badge>
												)}
											</View>

											<View className="flex-row justify-between">
												<View className="flex-row items-center gap-2">
													<Badge variant="secondary">
														<Text className="text-xs">{totalSets} sets</Text>
													</Badge>
													<Badge variant="secondary">
														<Text className="text-xs">{valueDisplay}</Text>
													</Badge>
													<Badge variant="secondary">
														<Text className="text-xs">{weightDisplay}</Text>
													</Badge>
												</View>
												<View className="flex-row items-center">
													<ChevronRight className="size-5 text-muted-foreground" />
												</View>
											</View>
										</View>
									</View>
								</View>
							</CardContent>
						</Card>
					</Pressable>
				</DialogTrigger>
				<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
					<WorkoutPlanExerciseForm
						currentExercisesAmount={totalExercises}
						exerciseId={exerciseId}
						exerciseName={exerciseName}
						existingExerciseData={workoutPlanExerciseData}
						isUpdate={true}
						locale={i18n.locale}
						setOpen={setOpenUpdateForm}
						workoutPlanExerciseId={workoutPlanExerciseId}
					/>
				</DialogContent>
			</Dialog>
		</View>
	);
};
