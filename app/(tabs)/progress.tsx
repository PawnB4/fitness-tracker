import { ContrailOne_400Regular } from "@expo-google-fonts/contrail-one";
import { useFont } from "@shopify/react-native-skia";
import { asc } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { View } from "react-native";
import { CartesianChart, Line } from "victory-native";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

export default function Page() {
	const font = useFont(ContrailOne_400Regular, 12);

	const { data: workouts, error: workoutsError } = useLiveQuery(
		db
			.select({
				id: schema.workouts.id,
				createdAt: schema.workouts.createdAt,
			})
			.from(schema.workouts)
			.orderBy(asc(schema.workouts.createdAt)),
	);

	const MONTHLY_WORKOUTS = (() => {
		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];

		const monthCounts = months.reduce(
			(acc, month) => {
				acc[month] = 0;
				return acc;
			},
			{} as Record<string, number>,
		);

		const currentYear = new Date().getFullYear();

		workouts?.forEach((workout) => {
			const workoutDate = new Date(workout.createdAt ?? "");
			const workoutYear = workoutDate.getFullYear();
			
			// Only count workouts from the current year
			if (workoutYear === currentYear) {
				const month = workoutDate.toLocaleDateString("en-US", { month: "short" });
				if (Object.prototype.hasOwnProperty.call(monthCounts, month)) {
					monthCounts[month]++;
				}
			}
		});

		return months.map((month) => ({
			month,
			count: monthCounts[month],
		}));
	})();

	console.log(MONTHLY_WORKOUTS);

	const DATA = Array.from({ length: 31 }, (_, i) => ({
		day: i,
		highTmp: 40 + 30 * Math.random(),
	}));

	return (
		<View className="mx-auto h-[300px] w-4/5">
			<Text className="py-8 text-center font-bold text-2xl">
				Workouts per month
			</Text>
			<CartesianChart
				data={MONTHLY_WORKOUTS}
				xKey="month"
				yKeys={["count"]}
				axisOptions={{
					font: font,
					tickCount: 12,
				}}
			>
				{({ points }) => (
					<Line points={points.count} color="red" strokeWidth={3} />
				)}
			</CartesianChart>
		</View>
	);
}
