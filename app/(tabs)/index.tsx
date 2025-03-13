import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
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
import { WorkoutCard } from "~/components/workouts/workout-card";
import { fitnessTrackerDb } from "~/db/drizzle";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import migrations from "~/drizzle/migrations";

export default function Page() {
	useDrizzleStudio(fitnessTrackerDb);

	const [selectedWorkoutPlan, setSelectedWorkoutPlan] =
		useState<Option>(undefined);
	const [openDialog, setOpenDialog] = useState(false);

	const { success, error: migrationsError } = useMigrations(db, migrations);

	const { data: workouts, error: workoutsError } = useLiveQuery(
		db.select().from(schema.workouts),
	);

	const { data: workoutPlans, error: workoutPlansError } = useLiveQuery(
		db.select().from(schema.workoutPlans),
	);

	const createWorkoutFromPlan = async () => {
		try {
			if (!selectedWorkoutPlan) {
				alert("Please select a workout plan");
				return;
			}

			// Get all exercises from the selected workout plan
			const workoutPlanExercises = await db
				.select({
					exerciseId: schema.workoutPlanExercises.exerciseId,
					defaultSets: schema.workoutPlanExercises.defaultSets,
					defaultReps: schema.workoutPlanExercises.defaultReps,
					defaultWeight: schema.workoutPlanExercises.defaultWeight,
					sortOrder: schema.workoutPlanExercises.sortOrder,
				})
				.from(schema.workoutPlanExercises)
				.where(
					eq(
						schema.workoutPlanExercises.planId,
						Number(selectedWorkoutPlan.value),
					),
				)
				.orderBy(schema.workoutPlanExercises.sortOrder);

			// Create a new workout
			const res = await db.insert(schema.workouts).values({}).returning();
			const workoutId = res[0].id;

			// Add all exercises from the plan to the workout
			for (const exercise of workoutPlanExercises) {
				await db.insert(schema.workoutExercises).values({
					workoutId: workoutId,
					exerciseId: exercise.exerciseId,
					sets: exercise.defaultSets,
					reps: exercise.defaultReps,
					weight: exercise.defaultWeight,
					sortOrder: exercise.sortOrder,
				});
			}

			// Close dialog and navigate to the new workout
			setOpenDialog(false);
			setSelectedWorkoutPlan(undefined);
			router.push(`/workout/${workoutId}`);
		} catch (error) {
			console.error(error);
			alert("Error creating workout");
		}
	};

	const createWorkoutFromScratch = async () => {
		try {
			const res = await db.insert(schema.workouts).values({}).returning();
			setSelectedWorkoutPlan(undefined);
			setOpenDialog(false);
			router.push(`/workout/${res[0].id}`);
		} catch (error) {
			alert("Error creating workout");
		}
	};

	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	if (migrationsError) {
		console.log("migrationsError", migrationsError);
		return (
			<View>
				<Text>Migrations failed</Text>
			</View>
		);
	}

	if (!success) {
		return (
			<View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
				<ActivityIndicator size="large" color="##0284c7" />
			</View>
		);
	}

	if (workoutPlansError || workoutsError) {
		return (
			<View>
				<Text>Workouts failed</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 items-stretch gap-4 bg-secondary/30 p-4">
			<Dialog
				open={openDialog}
				onOpenChange={(e) => {
					setOpenDialog(e);
					setSelectedWorkoutPlan(undefined);
				}}
			>
				<DialogTrigger asChild>
					<Button
						className="shadow shadow-foreground/5"
						onPress={() => setOpenDialog(true)}
					>
						<Text>New Workout</Text>
					</Button>
				</DialogTrigger>
				<DialogContent className="flex w-[90vw] min-w-[300px] max-w-[360px] flex-col justify-center gap-4 self-center p-4">
					<DialogTitle className="text-center">Create Workout</DialogTitle>

					{/* OPTION 1: FROM WORKOUT PLAN */}
					<View className="rounded-xl bg-muted/30 p-3">
						<Text className="mb-3 font-medium">
							Use a workout plan template
						</Text>

						<Select
							className="mb-3 w-full"
							value={selectedWorkoutPlan}
							onValueChange={(e) => setSelectedWorkoutPlan(e)}
						>
							<SelectTrigger>
								<SelectValue
									placeholder="Select a plan"
									className="native:text-lg text-foreground text-sm"
								/>
							</SelectTrigger>
							<SelectContent insets={contentInsets} className="w-[80vw]">
								<ScrollView className="max-h-[300px]">
									{workoutPlans?.map((plan) => (
										<SelectItem
											key={plan.id}
											label={plan.name}
											value={plan.id.toString()}
										>
											{plan.name}
										</SelectItem>
									))}
								</ScrollView>
							</SelectContent>
						</Select>

						<Button
							className="w-full"
							disabled={!selectedWorkoutPlan}
							onPress={createWorkoutFromPlan}
						>
							<Text>
								{selectedWorkoutPlan
									? `Create ${selectedWorkoutPlan.label} workout`
									: "Select a plan first"}
							</Text>
						</Button>
					</View>

					{/* Divider */}
					<View className="flex w-full flex-row items-center justify-between gap-2">
						<Separator className="my-1 w-[45%]" />
						<Text className="text-muted-foreground">or</Text>
						<Separator className="my-1 w-[45%]" />
					</View>

					{/* OPTION 2: FROM SCRATCH */}
					<View className="rounded-xl bg-muted/30 p-3">
						<Text className="mb-3 font-medium">
							Start with an empty workout
						</Text>
						<Button
							className="w-full"
							variant="outline"
							onPress={createWorkoutFromScratch}
						>
							<Text>Create empty workout</Text>
						</Button>
					</View>
				</DialogContent>
			</Dialog>
			<FlashList
				data={workouts}
				renderItem={({ item }) => (
					<WorkoutCard
						id={item.id}
						name={item.name || ""}
						notes={item.notes}
						createdAt={item.createdAt}
						updatedAt={item.updatedAt}
					/>
				)}
				estimatedItemSize={50}
				showsVerticalScrollIndicator={false}
				ItemSeparatorComponent={() => <View className="h-4" />}
			/>
		</View>
	);
}
