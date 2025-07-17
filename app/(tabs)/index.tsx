import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
import { UserIcon } from "~/components/user/user-icon";
import { db, fitnessTrackerDb } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { History } from "~/lib/icons/History";
import { formatDate, formatTime } from "~/utils/date";

// Define the structure for the processed data passed to WorkoutCard
type ProcessedWorkoutData = schema.Workout & {
	totalExercises: number;
	isCompleted: boolean;
};

export default function Page() {
	useDrizzleStudio(fitnessTrackerDb);

	const [selectedWorkoutPlan, setSelectedWorkoutPlan] =
		useState<Option>(undefined);
	const [openDialog, setOpenDialog] = useState(false);
	const [user, setUser] = useState<schema.User[] | null>(null);
	const [hasCheckedForUser, setHasCheckedForUser] = useState(false);

	// Fetch workouts ordered by creation date
	const { data: workouts, error: workoutsError } = useLiveQuery(
		db.select().from(schema.workouts).orderBy(desc(schema.workouts.createdAt)),
	);

	// Fetch user on component mount
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const result = await db.select().from(schema.user).limit(1);
				setUser(result);
				setHasCheckedForUser(true);
			} catch (error) {
				console.error("Error fetching user:", error);
				setUser([]);
				setHasCheckedForUser(true);
			}
		};

		fetchUser();
	}, []);

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

	const { data: weeklyTargetQuery, error: weeklyTargetError } = useLiveQuery(
		db
			.select({ weeklyTarget: schema.user.weeklyTarget })
			.from(schema.user)
			.limit(1),
	);

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
	const increaseWeeklyTarget = async () => {
		if(weeklyTargetQuery?.[0]?.weeklyTarget && weeklyTargetQuery?.[0]?.weeklyTarget <7){
		await db
			.update(schema.user)
			.set({ weeklyTarget: weeklyTargetQuery?.[0]?.weeklyTarget + 1 });
		} else{
			alert("You can't have more than 7 workouts per week");
		}
	};
	const decreaseWeeklyTarget = async () => {
		if (weeklyTargetQuery?.[0]?.weeklyTarget && weeklyTargetQuery?.[0]?.weeklyTarget > 1) {
			await db
				.update(schema.user)
				.set({ weeklyTarget: weeklyTargetQuery?.[0]?.weeklyTarget - 1 });
		} else {
			alert("You can't have less than 1 workout per week");
		}
	};

	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	// Show loading while data is being fetched
	if (!hasCheckedForUser || !processedWorkouts) {
		return (
			<View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
				<ActivityIndicator color="#0284c7" size="large" />
			</View>
		);
	}

	// Only redirect if we've confirmed there are no users
	if (hasCheckedForUser && user && user.length === 0) {
		return <Redirect href="/welcome" />;
	}

	return (
		<SafeAreaView className="flex-1 justify-center gap-4 bg-secondary/30 px-4 py-8">
			<View className="flex flex-row items-center justify-between gap-2 px-2">
				<View className="flex flex-col gap-2">
					<Text className="text-4xl ">Hello,</Text>
					<Text className="font-funnel-bold text-6xl">{user?.[0]?.name}</Text>
				</View>
				<UserIcon />
			</View>
			<Card className="p-2">
				<View className="flex flex-col gap-3">
					<Text className="text-center font-funnel-semibold text-lg">
						Your weekly target
					</Text>
					<View className="flex flex-row items-center justify-center gap-4">
						<Button
							className="h-12 w-12 rounded-full bg-secondary shadow-sm"
							variant="secondary"
							onPress={decreaseWeeklyTarget}
						>
							<Text className="font-funnel-bold text-foreground text-xl">
								-
							</Text>
						</Button>
						<View className="flex flex-col items-center gap-1">
							<View className="rounded-xl bg-sky-500/40 px-6 py-3">
								<Text className="font-funnel-bold text-4xl text-primary">
									{weeklyTargetQuery?.[0]?.weeklyTarget ?? "-"}
								</Text>
							</View>
						</View>
						<Button
							className="h-12 w-12 rounded-full bg-secondary shadow-sm"
							variant="secondary"
							onPress={increaseWeeklyTarget}
						>
							<Text className="font-funnel-bold text-foreground text-xl">
								+
							</Text>
						</Button>
					</View>
					<Text className="text-center text-muted-foreground text-xs">
						workouts per week
					</Text>
				</View>
			</Card>
			<Dialog
				onOpenChange={(e) => {
					setOpenDialog(e);
					setSelectedWorkoutPlan(undefined);
				}}
				open={openDialog}
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
						<Text className="mb-3 font-funnel-medium">
							Use a workout plan template
						</Text>
						{workoutPlans?.length > 0 ? (
							<Select
								className="mb-3 w-full"
								onValueChange={(e) => setSelectedWorkoutPlan(e)}
								value={selectedWorkoutPlan}
							>
								<SelectTrigger>
									<SelectValue
										className="native:text-lg text-foreground text-sm"
										placeholder="Select a plan"
									/>
								</SelectTrigger>
								<SelectContent className="w-[80vw]" insets={contentInsets}>
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
						) : (
							<Select
								className="mb-3 w-full"
								value={{
									value: "No workout plans found",
									label: "No workout plans found",
								}}
							>
								<SelectTrigger className="w-[275px] cursor-not-allowed opacity-50">
									<SelectValue
										className="native:text-lg text-foreground/50 text-sm"
										placeholder={"No workout plans found"}
									/>
								</SelectTrigger>
							</Select>
						)}

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
						<Text className="mb-3 font-funnel-medium">
							Start with an empty workout
						</Text>
						<Button
							className="w-full"
							onPress={createWorkoutFromScratch}
							variant="outline"
						>
							<Text>Create empty workout</Text>
						</Button>
					</View>
				</DialogContent>
			</Dialog>
			<View className="flex flex-col gap-2">
				<Card className="px-4 py-2">
					<View className="flex flex-col gap-3">
						<Text className="font-funnel-semibold text-lg">
							Weekly Progress
						</Text>
						<View className="flex-row items-center justify-between">
							<View>
								<Text className="font-funnel-bold text-2xl text-primary">
									{
										processedWorkouts.filter((w) => {
											const now = new Date();
											const startOfWeek = new Date(now);
											// Get Monday of current week (0 = Sunday, 1 = Monday)
											const dayOfWeek = now.getDay();
											const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
											startOfWeek.setDate(now.getDate() - daysToMonday);
											startOfWeek.setHours(0, 0, 0, 0);

											return new Date(w.createdAt || "") >= startOfWeek;
										}).length
									}
								</Text>
								<Text className="text-muted-foreground text-sm">
									Workouts this week
								</Text>
							</View>
							<View>
								<Text className="font-funnel-bold text-2xl text-green-600">
									{
										processedWorkouts.filter((w) => {
											const now = new Date();
											const startOfWeek = new Date(now);
											// Get Monday of current week (0 = Sunday, 1 = Monday)
											const dayOfWeek = now.getDay();
											const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
											startOfWeek.setDate(now.getDate() - daysToMonday);
											startOfWeek.setHours(0, 0, 0, 0);

											return (
												new Date(w.createdAt || "") >= startOfWeek &&
												w.isCompleted
											);
										}).length
									}
								</Text>
								<Text className="text-muted-foreground text-sm">Completed</Text>
							</View>
						</View>
					</View>
				</Card>
				<Card className="px-4 py-2">
					<View className="flex flex-col gap-3">
						<Text className="font-funnel-semibold text-lg">
							Monthly Progress
						</Text>
						<View className="flex-row items-center justify-between">
							<View>
								<Text className="font-funnel-bold text-2xl text-primary">
									{
										processedWorkouts.filter((w) => {
											const now = new Date();
											const startOfMonth = new Date(
												now.getFullYear(),
												now.getMonth(),
												1,
											);
											startOfMonth.setHours(0, 0, 0, 0);

											return new Date(w.createdAt || "") >= startOfMonth;
										}).length
									}
								</Text>
								<Text className="text-muted-foreground text-sm">
									Workouts this month
								</Text>
							</View>
							<View>
								<Text className="font-funnel-bold text-2xl text-green-600">
									{
										processedWorkouts.filter((w) => {
											const now = new Date();
											const startOfMonth = new Date(
												now.getFullYear(),
												now.getMonth(),
												1,
											);
											startOfMonth.setHours(0, 0, 0, 0);

											return (
												new Date(w.createdAt || "") >= startOfMonth &&
												w.isCompleted
											);
										}).length
									}
								</Text>
								<Text className="text-muted-foreground text-sm">Completed</Text>
							</View>
						</View>
					</View>
				</Card>
			</View>
			<View className="h-1 rounded bg-sky-500/70" />

			<View className="flex flex-col gap-4">
				{processedWorkouts && processedWorkouts.length > 0 ? (
					<TouchableOpacity
						activeOpacity={0.6}
						onPress={() => router.push(`/workout/${processedWorkouts[0].id}`)}
					>
						<Card className="flex flex-row items-center justify-center gap-10 px-4 py-2">
							<Dumbbell className="text-primary" size={40} />
							<View className="flex flex-col gap-2">
								<Text className="font-funnel-bold text-2xl">
									Your last workout
								</Text>

								<View className="flex flex-row items-center justify-around gap-2">
									<Text className="text-muted-foreground text-sm">
										{formatDate(processedWorkouts[0].createdAt ?? "")}
									</Text>
									<Text className="text-muted-foreground text-sm">
										{formatTime(processedWorkouts[0].createdAt ?? "")}
									</Text>
									<Text className="text-muted-foreground text-sm">
										{processedWorkouts[0].totalExercises} Exercise
										{processedWorkouts[0].totalExercises === 1 ? "" : "s"}
									</Text>
								</View>
							</View>
						</Card>
					</TouchableOpacity>
				) : (
					<Card className="flex flex-row items-center justify-center gap-4 px-8 py-6">
						<Dumbbell className="text-muted-foreground" size={40} />
						<View className="flex flex-col items-center gap-1">
							<Text className="font-funnel-bold text-muted-foreground text-xl">
								No workouts yet
							</Text>
							<Text className="text-center text-muted-foreground">
								Create your first workout to get started!
							</Text>
						</View>
					</Card>
				)}

				<Button
					className="flex-row items-center justify-center gap-2"
					onPress={() => router.push("/workout/history")}
					variant="secondary"
				>
					<History className="text-primary" />
					<Text className="font-funnel-bold text-primary">
						View all workouts
					</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
