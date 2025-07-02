import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
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
import { DIALOG_CONTENT_MAP, EXERCISES_TYPES } from "~/lib/constants";
import { Calendar } from "~/lib/icons/Calendar";
import { ChevronRight } from "~/lib/icons/ChevronRight";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { Menu } from "~/lib/icons/Menu";
import { Plus } from "~/lib/icons/Plus";
import { Trash2 } from "~/lib/icons/Trash2";
import { Triangle } from "~/lib/icons/Triangle";
import { formatDate } from "~/utils/date";

// Function to update exercise order in database - this is the direct implementation
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
				.update(schema.workoutPlanExercises)
				.set({
					sortOrder: -1,
				})
				.where(eq(schema.workoutPlanExercises.id, exercise1Id));

			// Update exercise2 to exercise1's old order
			await tx
				.update(schema.workoutPlanExercises)
				.set({
					sortOrder: exercise1Order,
				})
				.where(eq(schema.workoutPlanExercises.id, exercise2Id));

			// Finally update exercise1 to exercise2's old order
			await tx
				.update(schema.workoutPlanExercises)
				.set({
					sortOrder: exercise2Order,
				})
				.where(eq(schema.workoutPlanExercises.id, exercise1Id));
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
			.delete(schema.workoutPlanExercises)
			.where(eq(schema.workoutPlanExercises.id, id));
	} catch (error) {
		alert("Error deleting exercise");
	}
};

export default function Page() {
	const { id } = useLocalSearchParams();

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
				exerciseName: schema.exercises.name,
				exerciseType: schema.exercises.type,
				exercisePrimaryMuscleGroup: schema.exercises.primaryMuscleGroup,
				workoutPlanExerciseDefaultSets: schema.workoutPlanExercises.defaultSets,
				workoutPlanExerciseDefaultReps: schema.workoutPlanExercises.defaultReps,
				workoutPlanExerciseDefaultWeight:
					schema.workoutPlanExercises.defaultWeight,
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

	// Function to move an exercise up
	const moveExerciseUp = async (index: number) => {
		if (!planExercises || index <= 0 || isUpdating) return;

		setIsUpdating(true);

		const currentExercise = planExercises[index];
		const prevExercise = planExercises[index - 1];

		try {
			await swapExerciseOrder(
				currentExercise.workoutPlanExerciseId,
				currentExercise.workoutPlanExerciseSortOrder,
				prevExercise.workoutPlanExerciseId,
				prevExercise.workoutPlanExerciseSortOrder,
			);
		} catch (error) {
			alert(`Error updating exercise order: ${error}`);
		} finally {
			setIsUpdating(false);
		}
	};

	// Function to move an exercise down
	const moveExerciseDown = async (index: number) => {
		if (!planExercises || index >= planExercises.length - 1 || isUpdating)
			return;

		setIsUpdating(true);

		const currentExercise = planExercises[index];
		const nextExercise = planExercises[index + 1];

		try {
			await swapExerciseOrder(
				currentExercise.workoutPlanExerciseId,
				currentExercise.workoutPlanExerciseSortOrder,
				nextExercise.workoutPlanExerciseId,
				nextExercise.workoutPlanExerciseSortOrder,
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
		<ScrollView className="flex-1 bg-secondary/30">
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
							{planExercises?.length || 0} Exercise
							{planExercises?.length === 1 ? "" : "s"}
						</Text>
					</View>
					<View className="flex-row items-center gap-2 border-0">
						<Calendar className="mr-1 size-3 text-primary-foreground" />
						<Text className="font-funnel text-primary-foreground text-sm">
							Created {plan.createdAt ? formatDate(plan.createdAt) : "No date"}
						</Text>
					</View>
				</View>
			</View>

			{/* Main Content */}
			<View className="px-4 pt-6">
				{/* Exercises Section */}
				<View className="mb-6">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-funnel-bold text-2xl">Exercises</Text>
					</View>

					{/* Exercise Cards */}

					<View className="flex flex-1 flex-col gap-3">
						{!planExercises || planExercises.length === 0 ? (
							<View className="items-center rounded-lg bg-card p-6">
								<Dumbbell className="mb-4 size-10 text-muted-foreground" />
								<Text className="text-center text-muted-foreground">
									No exercises added to this plan yet.
								</Text>
								<Text className="text-center text-muted-foreground">
									Tap "Add Exercise" to get started!
								</Text>
							</View>
						) : (
							planExercises.map((item, index) => (
								<WorkoutPlanExerciseListItem
									exerciseName={item.exerciseName}
									exercisePrimaryMuscleGroup={item.exercisePrimaryMuscleGroup}
									exerciseType={item.exerciseType}
									isUpdating={isUpdating}
									key={item.workoutPlanExerciseId}
									onDelete={() =>
										handleDeleteExercise(
											item.workoutPlanExerciseId,
											item.workoutPlanExerciseSortOrder,
										)
									}
									onMoveDown={() => moveExerciseDown(index)}
									onMoveUp={() => moveExerciseUp(index)}
									totalExercises={planExercises.length}
									workoutPlanExerciseDefaultReps={
										item.workoutPlanExerciseDefaultReps
									}
									workoutPlanExerciseDefaultSets={
										item.workoutPlanExerciseDefaultSets
									}
									workoutPlanExerciseDefaultWeight={
										item.workoutPlanExerciseDefaultWeight
									}
									workoutPlanExerciseId={item.workoutPlanExerciseId}
									workoutPlanExerciseSortOrder={
										item.workoutPlanExerciseSortOrder
									}
								/>
							))
						)}
						<Button
							className="flex-row items-center justify-center gap-2 bg-sky-500/70"
							onPress={openWorkoutPlanExerciseForm}
							size="lg"
						>
							<Plus className="text-primary" />
							<Text className="font-funnel-bold text-primary">
								Add exercise
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
		</ScrollView>
	);
}

// Exercise list item component for plan exercises
type WorkoutPlanExerciseListItemProps = {
	workoutPlanExerciseId: number;
	exerciseName: string;
	exerciseType: string;
	exercisePrimaryMuscleGroup: string | null;
	workoutPlanExerciseDefaultSets: number;
	workoutPlanExerciseDefaultReps: number;
	workoutPlanExerciseDefaultWeight: number;
	workoutPlanExerciseSortOrder: number;
	totalExercises: number;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onDelete: () => void;
	isUpdating: boolean;
};

const WorkoutPlanExerciseListItem = ({
	workoutPlanExerciseId,
	exerciseName,
	exerciseType,
	exercisePrimaryMuscleGroup,
	workoutPlanExerciseDefaultSets,
	workoutPlanExerciseDefaultReps,
	workoutPlanExerciseDefaultWeight,
	workoutPlanExerciseSortOrder,
	totalExercises,
	onMoveUp,
	onMoveDown,
	onDelete,
	isUpdating,
}: WorkoutPlanExerciseListItemProps) => {
	const [openUpdateForm, setOpenUpdateForm] = useState(false);

	return (
		<View className="flex flex-row items-center justify-between gap-3">
			<Dialog
				className="flex-1"
				onOpenChange={setOpenUpdateForm}
				open={openUpdateForm}
			>
				<DialogTrigger asChild>
					<Pressable>
						<Card className="overflow-hidden">
							<CardContent className="p-0">
								<View className="flex-row">
									<View
										className="w-2"
										style={{
											backgroundColor:
												exerciseType === EXERCISES_TYPES[0]
													? "#16a34a"
													: exerciseType === EXERCISES_TYPES[1]
														? "#8b5cf6"
														: exerciseType === EXERCISES_TYPES[2]
															? "#eab308"
															: exerciseType === EXERCISES_TYPES[3]
																? "#ef4444"
																: "#0284c7",
										}}
									/>

									<View className="flex-1 p-4">
										<View className="flex-row items-center justify-between">
											<Text className="font-funnel-bold text-lg">
												{exerciseName}
											</Text>
											<Badge className="bg-muted" variant="outline">
												<Text className="text-xs">{exerciseType}</Text>
											</Badge>
										</View>

										<Text className="mb-2 text-muted-foreground text-sm">
											{exercisePrimaryMuscleGroup}
										</Text>

										<Separator className="my-2" />

										<View className="mt-1 flex-row justify-between">
											<View className="flex-row items-center">
												<Badge className="mr-1" variant="secondary">
													<Text className="text-xs">
														{workoutPlanExerciseDefaultSets} sets
													</Text>
												</Badge>
												<Badge className="mr-1" variant="secondary">
													<Text className="text-xs">
														{workoutPlanExerciseDefaultReps} reps
													</Text>
												</Badge>
												<Badge variant="secondary">
													<Text className="text-xs">
														{workoutPlanExerciseDefaultWeight} kg
													</Text>
												</Badge>
											</View>
											<View className="flex-row items-center">
												<ChevronRight className="size-5 text-muted-foreground" />
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
						currentReps={workoutPlanExerciseDefaultReps}
						currentSets={workoutPlanExerciseDefaultSets}
						currentWeight={workoutPlanExerciseDefaultWeight}
						exerciseName={exerciseName}
						isUpdate={true}
						setOpen={setOpenUpdateForm}
						workoutPlanExerciseId={workoutPlanExerciseId}
					/>
				</DialogContent>
			</Dialog>

			<View className="flex items-center justify-center gap-2">
				{workoutPlanExerciseSortOrder !== 1 && (
					<TouchableOpacity disabled={isUpdating} onPress={onMoveUp}>
						<Triangle
							className="fill-muted-foreground text-muted-foreground"
							size={30}
						/>
					</TouchableOpacity>
				)}

				<Text>#{workoutPlanExerciseSortOrder}</Text>

				{workoutPlanExerciseSortOrder !== totalExercises && (
					<TouchableOpacity disabled={isUpdating} onPress={onMoveDown}>
						<Triangle
							className="rotate-180 fill-muted-foreground text-muted-foreground"
							size={30}
						/>
					</TouchableOpacity>
				)}
			</View>
			<View className="flex items-center justify-center gap-2">
				<TouchableOpacity
					className="rounded-full bg-red-100 p-1.5"
					disabled={isUpdating}
					onPress={onDelete}
				>
					<Trash2 className="text-destructive" size={22} />
				</TouchableOpacity>
			</View>
		</View>
	);
};
