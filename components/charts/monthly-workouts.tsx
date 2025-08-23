import { FunnelSans_400Regular } from "@expo-google-fonts/funnel-sans";
import { Circle, useFont } from "@shopify/react-native-skia";
import { asc } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { TextInput, View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedProps,
} from "react-native-reanimated";
import { Bar, CartesianChart, useChartPressState } from "victory-native";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { CHART_THEME } from "~/lib/constants";
import { TrendingDown } from "~/lib/icons/TrendingDown";
import { TrendingUp } from "~/lib/icons/TrendingUp";
import { useColorScheme } from "~/lib/useColorScheme";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// const MONTHLY_WORKOUTS = [
// 	{ month: "Jan", count: 8 },
// 	{ month: "Feb", count: 12 },
// 	{ month: "Mar", count: 15 },
// 	{ month: "Apr", count: 11 },
// 	{ month: "May", count: 16 },
// 	{ month: "Jun", count: 14 },
// 	{ month: "Jul", count: 9 },
// 	{ month: "Aug", count: 13 },
// 	{ month: "Sep", count: 7 },
// 	{ month: "Oct", count: 10 },
// 	{ month: "Nov", count: 6 },
// 	{ month: "Dec", count: 4 },
// ];

export const MonthlyWorkouts = ({ height }: { height: number }) => {
	const font = useFont(FunnelSans_400Regular, 12);
	const { colorScheme } = useColorScheme();
	const colors = CHART_THEME[colorScheme];

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
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
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
			const workoutDate = new Date(workout.createdAt);
			const workoutYear = workoutDate.getFullYear();

			// Only count workouts from the current year
			if (workoutYear === currentYear) {
				const month = workoutDate.toLocaleDateString("en-US", {
					month: "long",
				});
				if (Object.hasOwn(monthCounts, month)) {
					monthCounts[month]++;
				}
			}
		});

		return months.map((month) => ({
			month,
			count: monthCounts[month],
		}));
	})();

	const { state, isActive } = useChartPressState({
		x: MONTHLY_WORKOUTS[new Date().getMonth()].month,
		y: { count: MONTHLY_WORKOUTS[new Date().getMonth()].count },
	});

	useEffect(() => {
		if (isActive) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	}, [isActive]);

	const animatedMonthCountText = useAnimatedProps(() => {
		return {
			text: `${state.y.count.value.value} ${state.y.count.value.value !== 1 ? "workouts" : "workout"} in ${state.x.value.value}`,
			defaultValue: `${MONTHLY_WORKOUTS[new Date().getMonth()].count} workouts in ${MONTHLY_WORKOUTS[new Date().getMonth()].month}`,
		};
	});

	// Calculate trend: current month vs previous 3 months average
	const calculateTrend = () => {
		const currentMonthIndex = new Date().getMonth(); // Get actual current month (0-based)
		const currentMonthCount = MONTHLY_WORKOUTS[currentMonthIndex]?.count;

		// If current month doesn't exist in data or not enough previous months
		if (!currentMonthCount || currentMonthIndex < 3) {
			return { trend: 0, isPositive: true };
		}

		// Get previous 3 months
		const previous3Months = MONTHLY_WORKOUTS.slice(
			currentMonthIndex - 3,
			currentMonthIndex,
		);

		if (previous3Months.length !== 3) return { trend: 0, isPositive: true };

		const previous3Avg =
			previous3Months.reduce((sum, month) => sum + month.count, 0) /
			previous3Months.length;

		const percentChange =
			((currentMonthCount - previous3Avg) / previous3Avg) * 100;
		return { trend: Math.abs(percentChange), isPositive: percentChange > 0 };
	};

	const { trend, isPositive } = calculateTrend();

	const maxValue = Math.max(...MONTHLY_WORKOUTS.map((m) => m.count));
	const yAxisTicks = Array.from({ length: 5 }, (_, i) =>
		Math.ceil((maxValue / 4) * i),
	);

	return (
		<View className="w-full flex-col gap-2 bg-card">
			<View className="flex-col gap-2">
				<Card className="p-2">
					<Text className="font-funnel-bold text-2xl text-foreground">
						Monthly Workouts
					</Text>
				</Card>
				<View className="flex-row">
					<AnimatedTextInput
						animatedProps={animatedMonthCountText}
						className="p-0 font-funnel-medium text-base text-muted-foreground"
						editable={false}
						underlineColorAndroid={"transparent"}
					/>
				</View>
			</View>

			<View style={{ height: height }}>
				<CartesianChart
					chartPressState={state}
					data={MONTHLY_WORKOUTS}
					domainPadding={{ left: 20, right: 20 }}
					padding={{ top: 10 }}
					xAxis={{
						font: font,
						tickCount: MONTHLY_WORKOUTS.length,
						lineColor: colors.border,
						labelColor: colors.mutedForeground,
						lineWidth: 0,
						formatXLabel: (label) => String(label).slice(0, 3),
					}}
					xKey="month"
					yAxis={[
						{
							font: font,
							tickValues: yAxisTicks,
							lineColor: colors.border,
							labelColor: colors.mutedForeground,
							lineWidth: 1,
						},
					]}
					yKeys={["count"]}
				>
					{({ points, chartBounds }) => (
						<>
							<Bar
								animate={{ type: "spring", duration: 1200 }}
								chartBounds={chartBounds}
								color={colors.gradient.start}
								points={points.count}
								roundedCorners={{ topLeft: 6, topRight: 6 }}
							/>
							{isActive && (
								<ToolTip
									colorScheme={colorScheme}
									x={state.x.position}
									y={state.y.count.position}
								/>
							)}
						</>
					)}
				</CartesianChart>
			</View>
			<View className="flex-row items-center justify-center gap-2 border-border border-t pt-2">
				{trend !== 0 && (
					<>
						<View className="flex-row items-center gap-2">
							{isPositive ? (
								<TrendingUp className="text-green-500" size={16} />
							) : (
								<TrendingDown className="text-red-500" size={16} />
							)}
							<Text
								className="font-funnel-medium text-sm"
								style={{
									color: isPositive
										? colors.trendPositive
										: colors.trendNegative,
								}}
							>
								{isPositive ? "+" : ""}
								{trend.toFixed(1)}%
							</Text>
						</View>
						<Text className="font-funnel-regular text-muted-foreground text-sm">
							{isPositive ? "more" : "fewer"} workouts in{" "}
							{new Date().toLocaleString("en-US", { month: "long" })} vs
							previous 3 months
						</Text>
					</>
				)}
			</View>
		</View>
	);
};

function ToolTip({
	x,
	y,
	colorScheme,
}: {
	x: SharedValue<number>;
	y: SharedValue<number>;
	colorScheme: "light" | "dark";
}) {
	const colors = CHART_THEME[colorScheme];

	return (
		<>
			{/* Tooltip Indicator Dot */}
			<Circle color={colors.gradient.start} cx={x} cy={y} r={6} />
			<Circle color={colors.background} cx={x} cy={y} r={3} />
		</>
	);
}
