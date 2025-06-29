import { ContrailOne_400Regular } from "@expo-google-fonts/contrail-one";
import { useFont } from "@shopify/react-native-skia";
import { asc } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { View } from "react-native";
import { Bar, CartesianChart } from "victory-native";
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

	// const MONTHLY_WORKOUTS = (() => {
	// 	const months = [
	// 		"Jan",
	// 		"Feb",
	// 		"Mar",
	// 		"Apr",
	// 		"May",
	// 		"Jun",
	// 		"Jul",
	// 		"Aug",
	// 		"Sep",
	// 		"Oct",
	// 		"Nov",
	// 		"Dec",
	// 	];

	// 	const monthCounts = months.reduce(
	// 		(acc, month) => {
	// 			acc[month] = 0;
	// 			return acc;
	// 		},
	// 		{} as Record<string, number>,
	// 	);

	// 	const currentYear = new Date().getFullYear();

	// 	workouts?.forEach((workout) => {
	// 		const workoutDate = new Date(workout.createdAt ?? "");
	// 		const workoutYear = workoutDate.getFullYear();

	// 		// Only count workouts from the current year
	// 		if (workoutYear === currentYear) {
	// 			const month = workoutDate.toLocaleDateString("en-US", { month: "short" });
	// 			if (Object.prototype.hasOwnProperty.call(monthCounts, month)) {
	// 				monthCounts[month]++;
	// 			}
	// 		}
	// 	});

	// 	return months.map((month) => ({
	// 		month,
	// 		count: monthCounts[month],
	// 	}));

	// })();

	const MONTHLY_WORKOUTS = [
		{ month: "Jan", count: 8 },
		{ month: "Feb", count: 12 },
		{ month: "Mar", count: 15 },
		{ month: "Apr", count: 11 },
		{ month: "May", count: 16 },
		{ month: "Jun", count: 14 },
		{ month: "Jul", count: 9 },
		{ month: "Aug", count: 13 },
		{ month: "Sep", count: 7 },
		{ month: "Oct", count: 10 },
		{ month: "Nov", count: 6 },
		{ month: "Dec", count: 4 },
	];

	console.log(MONTHLY_WORKOUTS);

	return (
		<View className="mx-auto h-[300px] w-4/5">
			<Text className="py-8 text-center font-bold text-2xl">
				Workouts per month
			</Text>
			<CartesianChart
				data={MONTHLY_WORKOUTS}
				padding={10}
				viewport={{ x: [0, 11], y: [0, 16] }}
				xAxis={{
					font: font,
					tickCount: 12,
				}}
				xKey="month"
				yKeys={["count"]}
				// yAxis={{
				// 	font: font,
				// 	tickCount: 12,
				// }}
			>
				{({ points, chartBounds }) => (
					// <Line points={points.count} color="red" strokeWidth={3} />
					<Bar
						chartBounds={chartBounds}
						color="red"
						points={points.count}
						roundedCorners={{ topLeft: 10, topRight: 10 }}
					/>
				)}
			</CartesianChart>
		</View>
	);
}
