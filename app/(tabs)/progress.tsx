import { count } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { I18n } from "i18n-js";
import { ScrollView, View } from "react-native";
import { MonthlyWorkouts } from "~/components/charts/monthly-workouts";
import { Overview } from "~/components/progress/overview";
import { ProgressCharts } from "~/components/progress/progress-charts";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

const i18n = new I18n({});

export default function Page() {
	const { data: workoutCount } = useLiveQuery(
		db
			.select({
				count: count(),
			})
			.from(schema.workouts),
	);

	const { data: userLocale } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";

	if (workoutCount?.[0]?.count < 15) {
		return (
			<View className="flex flex-1 items-center justify-center">
				<Text>You need to do at least 15 workouts to see your progress.</Text>
			</View>
		);
	}

	return (
		<ScrollView className="flex flex-1">
			<View className="flex flex-col gap-6 p-4">
				{/* OVERVIEW STATS ROW */}
				<Overview locale={i18n.locale} />

				{/* RECENT ACHIEVEMENTS */}
				{/* <View className="rounded-lg bg-green-100 p-4">
				<Text className="mb-3 font-bold text-lg">
					🏆 Recent Personal Records
				</Text>
				<View className="gap-2">
					<Text className="text-sm">
						• Est 1RM PR: Bench Press 92.5kg (today)
					</Text>
					<Text className="text-sm">• 5RM PR: Squat 120kg (last week)</Text>
					<Text className="text-sm">
						• Volume PR: Deadlift 3,150kg (this week)
					</Text>
				</View>
			</View> */}

				{/* MAIN PROGRESS CHARTS */}

				<ProgressCharts locale={i18n.locale} />
				{/* VOLUME ANALYSIS */
				/* Feasible via sum(reps*weight) per period; duration-only sets excluded from tonnage. */}
				<View className="gap-4">
					<Text className="font-bold text-xl">💪 Volume Analysis</Text>

					<View className="flex flex-row gap-3">
						{/* Volume Chart */}
						<View className="h-32 flex-1 items-center justify-center rounded-lg bg-blue-200 p-4">
							<Text className="font-bold text-sm">Weekly Volume Trend</Text>
							<Text className="text-gray-600 text-xs">
								7.2k → 8.1k → 8.4k kg
							</Text>
						</View>

						{/* Muscle Group Distribution */}
						<View className="h-32 flex-1 items-center justify-center rounded-lg bg-orange-200 p-4">
							<Text className="font-bold text-sm">Muscle Group Balance</Text>
							<Text className="text-gray-600 text-xs">
								Chest 25% | Back 20%
							</Text>
							<Text className="text-red-600 text-xs">⚠️ Imbalance detected</Text>
						</View>
					</View>

					{/* Monthly Volume Comparison */}
					<View className="h-24 items-center justify-center rounded-lg bg-blue-200 p-4">
						<Text className="font-bold text-sm">
							This Month vs Last Month Volume
						</Text>
						<Text className="text-gray-600 text-xs">
							32,100kg vs 28,500kg (+12.6%)
						</Text>
					</View>
				</View>

				{/* CONSISTENCY TRACKING */}
				<View className="gap-4">
					<Text className="font-bold text-xl">Consistency & Frequency</Text>
					<MonthlyWorkouts height={200} />

					{/* Workout Frequency Heatmap */}
					<View className="h-32 items-center justify-center rounded-lg bg-green-200 p-4">
						<Text className="font-bold text-sm">Workout Frequency Heatmap</Text>
						<Text className="text-gray-600 text-xs">
							(GitHub-style calendar view)
						</Text>
						<Text className="text-gray-600 text-xs">
							14 workouts this month
						</Text>
					</View>

					<View className="flex flex-row gap-3">
						<View className="flex-1 rounded bg-purple-200 p-3">
							<Text className="text-gray-600 text-sm">Avg Days Between</Text>
							<Text className="font-bold text-lg">1.8 days</Text>
						</View>
						<View className="flex-1 rounded bg-purple-200 p-3">
							<Text className="text-gray-600 text-sm">Best Day</Text>
							<Text className="font-bold text-lg">Tuesday</Text>
							<Text className="text-gray-600 text-xs">+15% performance</Text>
						</View>
					</View>
				</View>

				{/* DETAILED ANALYTICS EXPANDABLE SECTIONS */}
				<View className="gap-4">
					<Text className="font-bold text-xl">📊 Detailed Analytics</Text>

					{/* Execution & Rep Performance (feasible now) */}
					<View className="rounded-lg bg-gray-100 p-4">
						<Text className="mb-2 font-bold text-sm">
							📋 Execution & Rep Performance
						</Text>
						<View className="h-20 items-center justify-center rounded bg-yellow-200 p-3">
							<Text className="text-xs">
								Exercise Completion: 92% (based on completed flag)
							</Text>
							<Text className="text-xs">
								Bench 8–10 reps range: +2 reps vs last month
							</Text>
						</View>
					</View>

					{/* Exercise Breakdown */}
					<View className="rounded-lg bg-gray-100 p-4">
						<Text className="mb-2 font-bold text-sm">🏋️ Exercise Breakdown</Text>
						<View className="h-20 items-center justify-center rounded bg-blue-200 p-3">
							<Text className="text-xs">
								Most Improved: Bench Press (+15kg)
							</Text>
							<Text className="text-xs">
								Needs Attention: Squats (plateau 3 weeks)
							</Text>
						</View>
					</View>

					{/* Historical Comparison */}
					<View className="rounded-lg bg-gray-100 p-4">
						<Text className="mb-2 font-bold text-sm">
							📅 Historical Comparison
						</Text>
						<View className="h-20 items-center justify-center rounded bg-purple-200 p-3">
							<Text className="text-xs">vs 3 months ago: +23% stronger</Text>
							<Text className="text-xs">vs last year: +45% total volume</Text>
						</View>
					</View>

					{/* Data Quality & Unlocks */}
					<View className="gap-2 rounded-lg bg-gray-100 p-4">
						<Text className="font-bold text-sm">🧪 Data Quality</Text>
						<View className="h-20 items-center justify-center rounded bg-gray-200 p-3">
							<Text className="text-xs">3 exercises missing muscle group</Text>
							<Text className="text-xs">
								Set bodyweight to enable relative strength
							</Text>
						</View>
					</View>
				</View>

				{/* INSIGHTS & RECOMMENDATIONS */}
				<View className="rounded-lg bg-orange-100 p-4">
					<Text className="mb-3 font-bold text-lg">💡 Smart Insights</Text>
					<View className="gap-2">
						<Text className="text-sm">
							• Hit top of rep range twice → +2.5kg next session
						</Text>
						<Text className="text-sm">
							• Back volume is 3× lower than chest → add rows
						</Text>
						<Text className="text-sm">
							• Keep 3+ workouts this week to maintain streak
						</Text>
					</View>
				</View>

				{/* ACHIEVEMENTS & BADGES */}
				<View className="rounded-lg bg-green-100 p-4">
					<Text className="mb-3 font-bold text-lg">🏅 Recent Achievements</Text>
					<View className="flex flex-row flex-wrap gap-2">
						<View className="rounded-full bg-yellow-400 px-3 py-1">
							<Text className="font-bold text-xs">Week Warrior</Text>
						</View>
						<View className="rounded-full bg-blue-400 px-3 py-1">
							<Text className="font-bold text-white text-xs">Volume King</Text>
						</View>
						<View className="rounded-full bg-red-400 px-3 py-1">
							<Text className="font-bold text-white text-xs">
								Consistency Master
							</Text>
						</View>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
