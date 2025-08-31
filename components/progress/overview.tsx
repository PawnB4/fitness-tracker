import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { I18n } from "i18n-js";
import { useMemo } from "react";
import { View } from "react-native";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

const i18n = new I18n({
	en: {
		currentStreak: "Current Streak",
		thisWeekVolume: "This Week Volume",
		thisWeekProgress: "This Week Progress",
		noTargetSet: "No target set",
		crushingIt: "Crushing it! 💪",
		targetReached: "Target reached! 🎯",
		targetMissed: "Target missed 😔",
		pushHard: "Push hard! 💥",
		onTrack: "On track 👍",
		keepItUp: "Keep it up! 🔥",
		week: "week",
		workout: "workout",
		vsLastWeek: "vs last week",
		with: "with",
		atLeast: "at least",
		inARow: "in a row",
	},
	es: {
		currentStreak: "Racha actual",
		thisWeekVolume: "Volumen de esta semana",
		thisWeekProgress: "Progreso de esta semana",
		noTargetSet: "No hay objetivo establecido",
		crushingIt: "¡Crack! 💪",
		targetReached: "¡Objetivo alcanzado! 🎯",
		targetMissed: "¡Objetivo perdido! 😔",
		pushHard: "¡Metele! 💥",
		onTrack: "En camino 👍",
		keepItUp: "¡Seguí así! 🔥",
		week: "semana",
		workout: "entrenamiento",
		vsLastWeek: "vs semana pasada",
		with: "con",
		atLeast: "al menos",
		inARow: "seguida",
	},
});

export const Overview = ({ locale }: { locale: string }) => {
	i18n.locale = locale;

	const { data: workouts, error: workoutsError } = useLiveQuery(
		db.select().from(schema.workouts),
	);

	const { data: workoutExercises, error: workoutExercisesError } = useLiveQuery(
		db.select().from(schema.workoutExercises),
	);

	const { data: currentWeeklyTarget, error: currentWeeklyTargetError } =
		useLiveQuery(
			db
				.select({ weeklyTarget: schema.user.weeklyTarget })
				.from(schema.user)
				.limit(1),
		);

	const currentStreak = useMemo(() => {
		if (!workouts || !currentWeeklyTarget?.[0]?.weeklyTarget) {
			return 0;
		}

		const target =
			currentWeeklyTarget[0].weeklyTarget > 1
				? currentWeeklyTarget[0].weeklyTarget - 1
				: 1;
		const now = new Date();
		let currentStreakCount = 0;

		// Get start of current week (Monday)
		const getWeekStart = (date: Date) => {
			const d = new Date(date);
			const day = d.getDay();
			const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
			return new Date(d.setDate(diff));
		};

		// Count workouts in a given week
		const getWorkoutsInWeek = (weekStart: Date) => {
			const weekEnd = new Date(weekStart);
			weekEnd.setDate(weekEnd.getDate() + 6);
			weekEnd.setHours(23, 59, 59, 999);

			const weekWorkouts = workouts.filter((workout) => {
				const workoutDate = new Date(`${workout.createdAt}Z`);
				return workoutDate >= weekStart && workoutDate <= weekEnd;
			});

			return weekWorkouts.length;
		};

		// Start from current week and go backwards
		const weekStart = getWeekStart(new Date(now));
		weekStart.setHours(0, 0, 0, 0);

		while (true) {
			const workoutsThisWeek = getWorkoutsInWeek(weekStart);

			if (workoutsThisWeek >= target) {
				currentStreakCount++;
			} else {
				break;
			}

			// Move to previous week
			weekStart.setDate(weekStart.getDate() - 7);
		}

		return currentStreakCount;
	}, [workouts, currentWeeklyTarget]);

	const volumeData = useMemo(() => {
		if (!workouts || !workoutExercises) {
			return {
				thisWeekVolume: 0,
				lastWeekVolume: 0,
				difference: 0,
				percentageChange: 0,
			};
		}

		const now = new Date();

		// Get start of current week (Monday)
		const getWeekStart = (date: Date) => {
			const d = new Date(date);
			const day = d.getDay();
			const diff = d.getDate() - day + (day === 0 ? -6 : 1);
			return new Date(d.setDate(diff));
		};

		// Calculate volume for a given week
		const getWeekVolume = (weekStart: Date) => {
			const weekEnd = new Date(weekStart);
			weekEnd.setDate(weekEnd.getDate() + 6);
			weekEnd.setHours(23, 59, 59, 999);

			// Get workouts in this week
			const weekWorkouts = workouts.filter((workout) => {
				const workoutDate = new Date(workout.createdAt);
				return workoutDate >= weekStart && workoutDate <= weekEnd;
			});

			// Calculate total volume for this week
			let totalVolume = 0;

			weekWorkouts.forEach((workout) => {
				// Get all exercises for this workout
				const workoutExs = workoutExercises.filter(
					(we) => we.workoutId === workout.id,
				);

				workoutExs.forEach((workoutExercise) => {
					// Calculate volume for each exercise: sum of (sets × reps × weight)
					const exerciseVolume = workoutExercise.workoutExerciseData.reduce(
						(sum, set) => {
							// Only count sets with reps (skip time-based exercises)
							if (set.reps && set.reps > 0) {
								return sum + set.reps * set.weight;
							}
							return sum;
						},
						0,
					);

					totalVolume += exerciseVolume;
				});
			});

			return totalVolume;
		};

		// Current week
		const currentWeekStart = getWeekStart(new Date(now));
		currentWeekStart.setHours(0, 0, 0, 0);

		// Previous week
		const previousWeekStart = new Date(currentWeekStart);
		previousWeekStart.setDate(previousWeekStart.getDate() - 7);

		const thisWeekVolume = getWeekVolume(currentWeekStart);
		const lastWeekVolume = getWeekVolume(previousWeekStart);
		const difference = thisWeekVolume - lastWeekVolume;
		const percentageChange =
			lastWeekVolume > 0 ? (difference / lastWeekVolume) * 100 : 0;

		return { thisWeekVolume, lastWeekVolume, difference, percentageChange };
	}, [workouts, workoutExercises]);

	const workoutProgress = useMemo(() => {
		if (!workouts || !currentWeeklyTarget?.[0]?.weeklyTarget) {
			return {
				count: 0,
				target: 0,
				message: "No target set",
				status: "neutral",
			};
		}

		const target = currentWeeklyTarget[0].weeklyTarget;
		const now = new Date();

		// Get start of current week (Monday)
		const getWeekStart = (date: Date) => {
			const d = new Date(date);
			const day = d.getDay();
			const diff = d.getDate() - day + (day === 0 ? -6 : 1);
			return new Date(d.setDate(diff));
		};

		// Get current week workouts
		const currentWeekStart = getWeekStart(new Date(now));
		currentWeekStart.setHours(0, 0, 0, 0);
		const weekEnd = new Date(currentWeekStart);
		weekEnd.setDate(weekEnd.getDate() + 6);
		weekEnd.setHours(23, 59, 59, 999);

		const thisWeekWorkouts = workouts.filter((workout) => {
			const workoutDate = new Date(workout.createdAt);
			return workoutDate >= currentWeekStart && workoutDate <= weekEnd;
		});

		const count = thisWeekWorkouts.length;
		const remaining = target - count;

		// Calculate days remaining in week
		const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
		const daysRemainingInWeek = today === 0 ? 0 : 7 - today; // Sunday = 0 days left

		// Determine message and status
		let message: string;
		let status: "good" | "warning" | "danger" | "excellent" | "neutral";

		if (count >= target) {
			// Target achieved or exceeded
			if (count > target) {
				message = i18n.t("crushingIt");
				status = "excellent";
			} else {
				message = i18n.t("targetReached");
				status = "good";
			}
		} else if (remaining > daysRemainingInWeek) {
			// Physically impossible to reach target
			message = i18n.t("targetMissed");
			status = "danger";
		} else if (remaining === daysRemainingInWeek) {
			// Need to workout every remaining day
			message = i18n.t("pushHard");
			status = "warning";
		} else {
			// On track - have buffer days
			if (daysRemainingInWeek >= 3) {
				message = i18n.t("onTrack");
				status = "good";
			} else {
				message = i18n.t("keepItUp");
				status = "good";
			}
		}

		return { count, target, remaining, daysRemainingInWeek, message, status };
	}, [workouts, currentWeeklyTarget]);

	return (
		<View className="flex flex-col gap-3">
			{/* Current Streak Card */}
			<Card className="overflow-hidden">
				<View className="flex flex-row">
					{/* Icon Ribbon */}
					<View className="flex w-16 items-center justify-center bg-orange-500">
						<Text className="text-2xl text-white">🔥</Text>
					</View>
					{/* Content */}
					<View className="flex flex-1 flex-col gap-1 px-4 py-2">
						<Text className="font-funnel-medium text-muted-foreground text-sm">
							{i18n.t("currentStreak")}
						</Text>
						<Text className="font-funnel-bold text-3xl text-foreground">
							{currentStreak}
						</Text>
						<Text className="text-muted-foreground text-xs">
							{i18n.t("week")}
							{currentStreak !== 1 && "s"} {i18n.t("inARow")}
							{currentStreak !== 1 && i18n.locale === "es" && "s"}{" "}
							{i18n.t("with")} {i18n.t("atLeast")}{" "}
							{currentWeeklyTarget?.[0]?.weeklyTarget &&
							currentWeeklyTarget[0].weeklyTarget > 1
								? currentWeeklyTarget[0].weeklyTarget - 1
								: 1}{" "}
							{i18n.t("workout")}
							{currentWeeklyTarget?.[0]?.weeklyTarget &&
								currentWeeklyTarget[0].weeklyTarget - 1 > 1 &&
								"s"}
						</Text>
					</View>
				</View>
			</Card>

			{/* Volume Card */}
			<Card className="overflow-hidden">
				<View className="flex flex-row">
					{/* Icon Ribbon */}
					<View className="flex w-16 items-center justify-center bg-violet-500">
						<Text className="text-2xl text-white">💪</Text>
					</View>
					{/* Content */}
					<View className="flex flex-1 flex-col gap-1 px-4 py-2">
						<Text className="font-funnel-medium text-muted-foreground text-sm">
							{i18n.t("thisWeekVolume")}
						</Text>
						<Text className="font-funnel-bold text-3xl text-foreground">
							{volumeData.thisWeekVolume}kg
						</Text>
						<Text
							className={`text-xs ${
								volumeData.difference > 0
									? "text-green-600 dark:text-green-400"
									: volumeData.difference < 0
										? "text-red-600 dark:text-red-400"
										: "text-muted-foreground"
							}`}
						>
							{volumeData.difference > 0 ? "+" : ""}
							{volumeData.percentageChange.toFixed(1)}% {i18n.t("vsLastWeek")}
						</Text>
					</View>
				</View>
			</Card>

			{/* Progress Card */}
			<Card className="overflow-hidden">
				<View className="flex flex-row">
					{/* Icon Ribbon */}
					<View
						className={`flex w-16 items-center justify-center ${
							workoutProgress.status === "excellent"
								? "bg-purple-500"
								: workoutProgress.status === "good"
									? "bg-green-500"
									: workoutProgress.status === "warning"
										? "bg-yellow-500"
										: workoutProgress.status === "danger"
											? "bg-red-500"
											: "bg-gray-500"
						}`}
					>
						<Text className="text-2xl text-white">🎯</Text>
					</View>
					{/* Content */}
					<View className="flex flex-1 flex-col gap-1 px-4 py-2">
						<Text className="font-funnel-medium text-muted-foreground text-sm">
							{i18n.t("thisWeekProgress")}
						</Text>
						<Text className="font-funnel-bold text-3xl text-foreground">
							{workoutProgress.count}/{workoutProgress.target}
						</Text>
						<Text
							className={`text-xs ${
								workoutProgress.status === "excellent"
									? "text-purple-600 dark:text-purple-400"
									: workoutProgress.status === "good"
										? "text-green-600 dark:text-green-400"
										: workoutProgress.status === "warning"
											? "text-yellow-600 dark:text-yellow-400"
											: workoutProgress.status === "danger"
												? "text-red-600 dark:text-red-400"
												: "text-muted-foreground"
							}`}
						>
							{workoutProgress.message}
						</Text>
					</View>
				</View>
			</Card>
		</View>
	);
};
