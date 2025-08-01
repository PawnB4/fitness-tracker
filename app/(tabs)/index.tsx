import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Redirect, router } from "expo-router";
import { I18n } from "i18n-js";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
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

const i18n = new I18n({
	en: {
		hello: "Hello",
		weeklyTarget: "Your weekly target",
		workoutsThisWeek: "Workouts this week",
		completed: "Completed",
		monthlyProgress: "Monthly Progress",
		workoutsThisMonth: "Workouts this month",
		lastWorkout: "Your last workout",
		workoutsPerWeek: "workouts per week",
		newWorkout: "New Workout",
		createWorkout: "Create Workout",
		useWorkoutPlanTemplate: "Use a workout plan template",
		startWithEmptyWorkout: "Start with an empty workout",
		createEmptyWorkout: "Create empty workout",
		or: "or",
		weeklyProgress: "Weekly Progress",
		viewAllWorkouts: "View all workouts",
		noWorkoutsYet: "No workouts yet",
		createYourFirstWorkout: "Create your first workout to get started!",
		exercise: "exercise",
		selectPlan: "Select a plan",
		noWorkoutPlansFound: "No workout plans found",
		create: "Create",
		workout: "workout",
		selectPlanFirst: "Select a plan first",
		pleaseSelectPlan: "Please select a workout plan",
		maxWorkoutsPerWeek: "You can't have more than 14 workouts per week",
		minWorkoutsPerWeek: "You can't have less than 1 workout per week",
	},
	es: {
		hello: "Hola",
		weeklyTarget: "Tu objetivo semanal",
		workoutsThisWeek: "Entrenamientos esta semana",
		completed: "Completado",
		monthlyProgress: "Progreso mensual",
		workoutsThisMonth: "Entrenamientos este mes",
		lastWorkout: "Tu último entrenamiento",
		workoutsPerWeek: "entrenamientos por semana",
		newWorkout: "Nuevo entrenamiento",
		createWorkout: "Crear entrenamiento",
		useWorkoutPlanTemplate: "Usar una rutina existente",
		startWithEmptyWorkout: "Comenzar con un entrenamiento vacío",
		createEmptyWorkout: "Crear entrenamiento desde cero",
		or: "o",
		weeklyProgress: "Progreso semanal",
		viewAllWorkouts: "Ver todos los entrenamientos",
		noWorkoutsYet: "No hay entrenamientos todavía",
		createYourFirstWorkout: "Crea tu primer entrenamiento para empezar!",
		exercise: "ejercicio",
		selectPlan: "Seleccionar una rutina",
		noWorkoutPlansFound: "No hay rutinas encontradas",
		create: "Crear",
		workout: "entrenamiento",
		selectPlanFirst: "Seleccionar una rutina primero",
		pleaseSelectPlan: "Por favor, selecciona una rutina",
		maxWorkoutsPerWeek: "No podés tener más de 14 entrenamientos por semana",
		minWorkoutsPerWeek: "No podés tener menos de 1 entrenamiento por semana",
	},
});

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

	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";

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
				alert(i18n.t("pleaseSelectPlan"));
				return;
			}

			// Get all exercises from the selected workout plan
			const workoutPlanExercises = await db
				.select({
					exerciseId: schema.workoutPlanExercises.exerciseId,
					workoutPlanExerciseData:
						schema.workoutPlanExercises.workoutPlanExerciseData,
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
				// Transform workoutPlan data format to workout data format
				const workoutExerciseData = exercise.workoutPlanExerciseData.map(
					(planSet) => ({
						setNumber: planSet.defaultSetNumber,
						reps: planSet.defaultReps,
						durationSeconds: planSet.defaultDurationSeconds,
						weight: planSet.defaultWeight,
					}),
				);

				await db.insert(schema.workoutExercises).values({
					workoutId: workoutId,
					exerciseId: exercise.exerciseId,
					workoutExerciseData: workoutExerciseData,
					sortOrder: exercise.sortOrder,
				});
			}

			// Close dialog and navigate to the new workout
			setOpenDialog(false);
			setSelectedWorkoutPlan(undefined);
			router.push(`/workout/${workoutId}`);
		} catch (error) {
			console.error(error);
			alert(`Error creating workout: ${error}`);
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
			alert(`Error creating workout: ${error}`);
		}
	};
	const increaseWeeklyTarget = async () => {
		if (
			weeklyTargetQuery?.[0]?.weeklyTarget &&
			weeklyTargetQuery?.[0]?.weeklyTarget < 14
		) {
			await db
				.update(schema.user)
				.set({ weeklyTarget: weeklyTargetQuery?.[0]?.weeklyTarget + 1 });
		} else {
			alert(i18n.t("maxWorkoutsPerWeek"));
		}
	};
	const decreaseWeeklyTarget = async () => {
		if (
			weeklyTargetQuery?.[0]?.weeklyTarget &&
			weeklyTargetQuery?.[0]?.weeklyTarget > 1
		) {
			await db
				.update(schema.user)
				.set({ weeklyTarget: weeklyTargetQuery?.[0]?.weeklyTarget - 1 });
		} else {
			alert(i18n.t("minWorkoutsPerWeek"));
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
					<Text className="text-4xl ">{i18n.t("hello")},</Text>
					<Text className="font-funnel-bold text-6xl">{user?.[0]?.name}</Text>
				</View>
				<UserIcon />
			</View>
			<Card className="p-2">
				<View className="flex flex-col gap-3">
					<Text className="text-center font-funnel-semibold text-lg">
						{i18n.t("weeklyTarget")}
					</Text>
					<View className="flex flex-row items-center justify-center gap-4">
						<Button
							className="h-12 w-12 rounded-full bg-secondary shadow-sm"
							onPress={decreaseWeeklyTarget}
							variant="secondary"
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
							onPress={increaseWeeklyTarget}
							variant="secondary"
						>
							<Text className="font-funnel-bold text-foreground text-xl">
								+
							</Text>
						</Button>
					</View>
					<Text className="text-center text-muted-foreground text-xs">
						{i18n.t("workoutsPerWeek")}
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
						<Text>{i18n.t("newWorkout")}</Text>
					</Button>
				</DialogTrigger>
				<DialogContent className="flex w-[90vw] min-w-[300px] max-w-[360px] flex-col justify-center gap-4 self-center p-4">
					<DialogTitle className="text-center">
						{i18n.t("createWorkout")}
					</DialogTitle>

					{/* OPTION 1: FROM WORKOUT PLAN */}
					<View className="rounded-xl bg-muted/30 p-3">
						<Text className="mb-3 font-funnel-medium">
							{i18n.t("useWorkoutPlanTemplate")}
						</Text>
						{workoutPlans?.length > 0 ? (
							<Select
								className="mx-auto mb-3 w-[75vw]"
								onValueChange={(e) => setSelectedWorkoutPlan(e)}
								value={selectedWorkoutPlan}
							>
								<SelectTrigger>
									<SelectValue
										className="native:text-lg text-foreground text-sm"
										placeholder={i18n.t("selectPlan")}
									/>
								</SelectTrigger>
								<SelectContent className="w-[75vw]" insets={contentInsets}>
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
								className="mx-auto mb-3 w-[75vw]"
								// value={{
								// 	value: "No workout plans found",
								// 	label: "No workout plans found",
								// }}
							>
								<SelectTrigger className="w-[75vw] cursor-not-allowed opacity-50">
									<SelectValue
										className="native:text-lg text-foreground/50 text-sm"
										placeholder={i18n.t("noWorkoutPlansFound")}
									/>
								</SelectTrigger>
							</Select>
						)}

						<Button
							className="mx-auto w-[75vw]"
							disabled={!selectedWorkoutPlan}
							onPress={createWorkoutFromPlan}
						>
							<Text>
								{selectedWorkoutPlan
									? `${i18n.t("create")} ${i18n.t("workout")} - ${selectedWorkoutPlan.label}`
									: i18n.t("selectPlanFirst")}
							</Text>
						</Button>
					</View>

					{/* Divider */}
					<View className="flex w-full flex-row items-center justify-between gap-2">
						<Separator className="my-1 w-[45%]" />
						<Text className="text-muted-foreground">{i18n.t("or")}</Text>
						<Separator className="my-1 w-[45%]" />
					</View>

					{/* OPTION 2: FROM SCRATCH */}
					<View className="rounded-xl bg-muted/30 p-3">
						<Text className="mb-3 font-funnel-medium">
							{i18n.t("startWithEmptyWorkout")}
						</Text>
						<Button
							className="mx-auto w-[75vw]"
							onPress={createWorkoutFromScratch}
							variant="outline"
						>
							<Text>{i18n.t("createEmptyWorkout")}</Text>
						</Button>
					</View>
				</DialogContent>
			</Dialog>
			<View className="flex flex-col gap-2">
				<Card className="px-4 py-2">
					<View className="flex flex-col gap-3">
						<Text className="font-funnel-semibold text-lg">
							{i18n.t("weeklyProgress")}
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
									{i18n.t("workoutsThisWeek")}
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
								<Text className="text-muted-foreground text-sm">
									{i18n.t("completed")}
									{i18n.locale === "es" && "s"}
								</Text>
							</View>
						</View>
					</View>
				</Card>
				<Card className="px-4 py-2">
					<View className="flex flex-col gap-3">
						<Text className="font-funnel-semibold text-lg">
							{i18n.t("monthlyProgress")}
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
									{i18n.t("workoutsThisMonth")}
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
								<Text className="text-muted-foreground text-sm">
									{i18n.t("completed")}
									{i18n.locale === "es" && "s"}
								</Text>
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
									{i18n.t("lastWorkout")}
								</Text>

								<View className="flex flex-row items-center justify-around gap-2">
									<Text className="text-muted-foreground text-sm">
										{formatDate(processedWorkouts[0].createdAt ?? "")}
									</Text>
									<Text className="text-muted-foreground text-sm">
										{formatTime(processedWorkouts[0].createdAt ?? "")}
									</Text>
									<Text className="text-muted-foreground text-sm">
										{processedWorkouts[0].totalExercises} {i18n.t("exercise")}
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
								{i18n.t("noWorkoutsYet")}
							</Text>
							<Text className="text-center text-muted-foreground">
								{i18n.t("createYourFirstWorkout")}
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
						{i18n.t("viewAllWorkouts")}
					</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
