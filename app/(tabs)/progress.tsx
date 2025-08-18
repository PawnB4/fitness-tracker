import { count } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ScrollView, View } from "react-native";
import { MonthlyWorkouts } from "~/components/charts/monthly-workouts";
import { Overview } from "~/components/progress/overview";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

export default function Page() {
	const { data: workoutCount, error: workoutCountError } = useLiveQuery(
		db
			.select({
				count: count(),
			})
			.from(schema.workouts),
	);

	// 15 workouts to see your progress
	// if (workoutCount?.[0]?.count < 15) {
	// 	return (
	// 		<View className="flex flex-1 items-center justify-center">
	// 			<Text>You need to do at least 15 workouts to see your progress.</Text>
	// 		</View>
	// 	);
	// }

	// return (
	// 	<View className="flex flex-1 items-center justify-center">
	// 		{/* <Text>You need to do at least 15 workouts to see your progress.</Text> */}
	// 		<Text>Nothing to see here yet.</Text>
	// 	</View>
	// );

	return (
		<ScrollView className="flex flex-1 flex-col gap-6 p-4">
			{/* OVERVIEW STATS ROW */}
			<Overview />
			<View className="flex flex-row gap-3">
				<View className="flex-1 rounded-lg bg-purple-200 p-4">
					<Text className="text-gray-600 text-sm">Current Streak</Text>
					<Text className="font-bold text-2xl">12 days</Text>
				</View>
				<View className="flex-1 rounded-lg bg-purple-200 p-4">
					<Text className="text-gray-600 text-sm">This Week Volume</Text>
					<Text className="font-bold text-2xl">8,450kg</Text>
					<Text className="text-green-600 text-xs">+17% vs last week</Text>
				</View>
				<View className="flex-1 rounded-lg bg-purple-200 p-4">
					<Text className="text-gray-600 text-sm">Workouts</Text>
					<Text className="font-bold text-2xl">4/4</Text>
					<Text className="text-green-600 text-xs">On track</Text>
				</View>
			</View>

			{/* RECENT ACHIEVEMENTS */}
			<View className="rounded-lg bg-green-100 p-4">
				<Text className="mb-3 font-bold text-lg">
					🏆 Recent Personal Records
				</Text>
				<View className="gap-2">
					<Text className="text-sm">
						• New 5RM: Bench Press 70kg (3 days ago)
					</Text>
					<Text className="text-sm">• Volume PR: Squat 2,100kg this week</Text>
					<Text className="text-sm">• First time: Deadlift 2x bodyweight</Text>
				</View>
			</View>

			{/* MAIN PROGRESS CHARTS */}
			<View className="gap-4">
				<Text className="font-bold text-xl">📈 Progress Charts</Text>

				{/* Exercise Selector */}
				<View className="rounded bg-gray-100 p-3">
					<Text className="text-sm">Select Exercise: Bench Press ▼</Text>
				</View>

				{/* Chart Selection Tabs */}
				<View className="flex flex-row gap-2">
					<View className="rounded bg-blue-500 px-4 py-2">
						<Text className="text-sm text-white">Strength</Text>
					</View>
					<View className="rounded bg-gray-300 px-4 py-2">
						<Text className="text-gray-700 text-sm">Volume</Text>
					</View>
					<View className="rounded bg-gray-300 px-4 py-2">
						<Text className="text-gray-700 text-sm">Frequency</Text>
					</View>
				</View>

				{/* Main Chart */}
				<View className="h-48 items-center justify-center rounded-lg bg-blue-200 p-6">
					<Text className="font-bold text-lg">
						Estimated 1RM Progression Chart
					</Text>
					<Text className="text-gray-600 text-sm">
						Bench: 65kg → 70kg → 75kg
					</Text>
					<Text className="text-gray-600 text-sm">
						Squat: 80kg → 85kg → 90kg
					</Text>
				</View>
			</View>

			{/* VOLUME ANALYSIS */}
			<View className="gap-4">
				<Text className="font-bold text-xl">💪 Volume Analysis</Text>

				<View className="flex flex-row gap-3">
					{/* Volume Chart */}
					<View className="h-32 flex-1 items-center justify-center rounded-lg bg-blue-200 p-4">
						<Text className="font-bold text-sm">Weekly Volume Trend</Text>
						<Text className="text-gray-600 text-xs">7.2k → 8.1k → 8.4k kg</Text>
					</View>

					{/* Muscle Group Distribution */}
					<View className="h-32 flex-1 items-center justify-center rounded-lg bg-orange-200 p-4">
						<Text className="font-bold text-sm">Muscle Group Balance</Text>
						<Text className="text-gray-600 text-xs">Chest 25% | Back 20%</Text>
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
				<Text className="font-bold text-xl">🔥 Consistency & Frequency</Text>

				{/* Workout Frequency Heatmap */}
				<View className="h-32 items-center justify-center rounded-lg bg-green-200 p-4">
					<Text className="font-bold text-sm">Workout Frequency Heatmap</Text>
					<Text className="text-gray-600 text-xs">
						(GitHub-style calendar view)
					</Text>
					<Text className="text-gray-600 text-xs">14 workouts this month</Text>
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

				{/* Set & Rep Performance */}
				<View className="rounded-lg bg-gray-100 p-4">
					<Text className="mb-2 font-bold text-sm">
						📋 Set & Rep Performance
					</Text>
					<View className="h-20 items-center justify-center rounded bg-yellow-200 p-3">
						<Text className="text-xs">Set Completion Rate: 87%</Text>
						<Text className="text-xs">
							Rep Progression: +2.3 avg reps/session
						</Text>
					</View>
				</View>

				{/* Exercise Breakdown */}
				<View className="rounded-lg bg-gray-100 p-4">
					<Text className="mb-2 font-bold text-sm">🏋️ Exercise Breakdown</Text>
					<View className="h-20 items-center justify-center rounded bg-blue-200 p-3">
						<Text className="text-xs">Most Improved: Bench Press (+15kg)</Text>
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
			</View>

			{/* INSIGHTS & RECOMMENDATIONS */}
			<View className="rounded-lg bg-orange-100 p-4">
				<Text className="mb-3 font-bold text-lg">💡 Smart Insights</Text>
				<View className="gap-2">
					<Text className="text-sm">
						• Consider increasing bench press weight by 2.5kg next session
					</Text>
					<Text className="text-sm">
						• You haven't trained legs in 4 days - consider a leg workout
					</Text>
					<Text className="text-sm">
						• Your Tuesday performance is 15% better than other days
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

			{/* ORIGINAL MONTHLY CHART - MOVED TO BOTTOM */}
			<View className="rounded-lg bg-gray-100 p-4">
				<Text className="mb-2 font-bold text-sm">
					📈 Monthly Workout Frequency
				</Text>
				<MonthlyWorkouts height={200} />
			</View>
		</ScrollView>
	);
}
