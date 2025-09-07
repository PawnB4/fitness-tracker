/** biome-ignore-all lint/suspicious/noExplicitAny: I wanted it */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: I wanted it */
import { FunnelSans_400Regular } from "@expo-google-fonts/funnel-sans";
import { Circle, DashPathEffect, useFont } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo } from "react";
import { TextInput, View } from "react-native";
import Animated, {
	Easing,
	type SharedValue,
	useAnimatedProps,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import {
	CartesianChart,
	Line,
	type PointsArray,
	useChartPressState,
} from "victory-native";
import { Text } from "~/components/ui/text";
import type * as schema from "~/db/schema";
import { CHART_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const MONTHS_SHORT = {
	en: [
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
	],
	es: [
		"Ene",
		"Feb",
		"Mar",
		"Abr",
		"May",
		"Jun",
		"Jul",
		"Ago",
		"Sep",
		"Oct",
		"Nov",
		"Dic",
	],
} as const;
const MONTHS_LONG = {
	en: [
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
	],
	es: [
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre",
	],
} as const;

export const ProgressFrequencyChart = ({
	height,
	exerciseData,
	timeframeFrom,
	timeframeTo,
	locale,
}: {
	height: number;
	exerciseData: schema.WorkoutExercise[];
	timeframeFrom: string;
	timeframeTo: string;
	locale: string;
}) => {
	const font = useFont(FunnelSans_400Regular, 12);
	const { colorScheme } = useColorScheme();
	const colors = CHART_THEME[colorScheme];

	// Helpers
	const parseUtc = (s: string) => new Date(`${s}Z`);
	const toUtcDate = (d: Date) =>
		new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
	const sameMonth = (a: Date, b: Date) =>
		a.getUTCFullYear() === b.getUTCFullYear() &&
		a.getUTCMonth() === b.getUTCMonth();
	const monthKey = (d: Date) =>
		`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
	const dayKey = (d: Date) =>
		`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
	const monthStartUTC = (d: Date) =>
		new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
	const monthEndUTC = (d: Date) =>
		new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
	const formatDDMMUTC = (d: Date) =>
		`${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

	// Per-session frequency
	const computeSessionSetsAndReps = (
		we: schema.WorkoutExercise,
	): { sets: number; reps: number } => {
		const sets = (we.workoutExerciseData ?? []).length;
		const reps = (we.workoutExerciseData ?? [])
			.map((s) => s.reps ?? 0)
			.reduce((a, b) => a + b, 0);
		return { sets, reps };
	};

	// Build the x-axis domain based on timeframe
	const start = toUtcDate(parseUtc(timeframeFrom));
	const end = toUtcDate(parseUtc(timeframeTo));
	const useDays = sameMonth(start, end);

	const buildMonths = () => {
		const items: Date[] = [];
		const cursor = new Date(
			Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
		);
		const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
		while (cursor <= last) {
			items.push(new Date(cursor));
			cursor.setUTCMonth(cursor.getUTCMonth() + 1);
		}
		return items;
	};
	const buildDays = () => {
		const items: Date[] = [];
		const cursor = new Date(start);
		while (cursor <= end) {
			items.push(new Date(cursor));
			cursor.setUTCDate(cursor.getUTCDate() + 1);
		}
		return items;
	};

	const xDomain = useDays ? buildDays() : buildMonths();

	// Aggregate totals per bucket
	const sumSetsMap = new Map<string, number>(
		xDomain.map((d) => [useDays ? dayKey(d) : monthKey(d), 0]),
	);
	const sumRepsMap = new Map<string, number>(
		xDomain.map((d) => [useDays ? dayKey(d) : monthKey(d), 0]),
	);

	exerciseData.forEach((we) => {
		const dt = parseUtc(we.createdAt);
		const k = useDays ? dayKey(dt) : monthKey(dt);
		const { sets, reps } = computeSessionSetsAndReps(we);
		if (sumSetsMap.has(k)) {
			sumSetsMap.set(k, (sumSetsMap.get(k) ?? 0) + sets);
			sumRepsMap.set(k, (sumRepsMap.get(k) ?? 0) + reps);
		}
	});

	type SeriesPoint = {
		x: string;
		label: string;
		sets: number;
		reps: number;
		isPartial?: boolean;
		rangeLabel?: string;
		monthIndex?: number;
	};

	const series: SeriesPoint[] = useDays
		? xDomain.map((d) => {
				const x = dayKey(d);
				return {
					x,
					label: `${String(d.getUTCDate()).padStart(2, "0")}/${String(
						d.getUTCMonth() + 1,
					).padStart(2, "0")}`,
					sets: sumSetsMap.get(x) ?? 0,
					reps: sumRepsMap.get(x) ?? 0,
				};
			})
		: xDomain.map((d) => {
				const x = monthKey(d);
				const mi = d.getUTCMonth();
				const shortLabel =
					(MONTHS_SHORT as any)[locale]?.[mi] ?? MONTHS_SHORT.en[mi];
				const mStart = monthStartUTC(d);
				const mEnd = monthEndUTC(d);
				const bucketStart = start > mStart ? start : mStart;
				const bucketEnd = end < mEnd ? end : mEnd;
				const isPartial =
					bucketStart.getTime() > mStart.getTime() ||
					bucketEnd.getTime() < mEnd.getTime();
				return {
					x,
					label: shortLabel,
					sets: sumSetsMap.get(x) ?? 0,
					reps: sumRepsMap.get(x) ?? 0,
					isPartial,
					rangeLabel: isPartial
						? `${formatDDMMUTC(bucketStart)} - ${formatDDMMUTC(bucketEnd)}`
						: undefined,
					monthIndex: mi,
				};
			});

	// Use plain objects (not Map) so the worklet can safely capture them
	const labelByXObj: Record<string, string> = Object.fromEntries(
		series.map((p) => [p.x, p.label]),
	);
	const pointByXObj: Record<string, SeriesPoint> = Object.fromEntries(
		series.map((p) => [p.x, p]),
	);

	const lastPoint = series[series.length - 1] ?? {
		x: "",
		label: "",
		sets: 0,
		reps: 0,
	};
	const { state, isActive } = useChartPressState({
		x: lastPoint.x,
		y: { sets: lastPoint.sets, reps: lastPoint.reps },
	});

	useEffect(() => {
		if (isActive) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	}, [isActive]);

	const animatedText = useAnimatedProps(() => {
		const selectedX = String(state.x.value.value || lastPoint.x);
		const item = (pointByXObj[selectedX] ??
			(lastPoint as SeriesPoint)) as SeriesPoint;
		const setsVal = Number(state.y.sets.value.value || item.sets);
		const repsVal = Number(state.y.reps.value.value || item.reps);
		const monthFull =
			!useDays && item.monthIndex != null
				? ((MONTHS_LONG as any)[locale]?.[item.monthIndex] ??
					MONTHS_LONG.en[item.monthIndex])
				: item.label;
		const suffix =
			!useDays && item.isPartial && item.rangeLabel
				? ` (${item.rangeLabel})`
				: "";
		return {
			text: `${setsVal} ${locale === "en" ? "sets" : "series"}, ${repsVal} ${locale === "en" ? "reps" : "reps"} ${locale === "en" ? "in" : "en"} ${monthFull}${suffix}`,
			defaultValue: `${lastPoint.sets} ${locale === "en" ? "sets" : "series"}, ${lastPoint.reps} ${locale === "en" ? "reps" : "reps"} ${locale === "en" ? "in" : "en"} ${monthFull}`,
		};
	});

	const maxValue = Math.max(0, ...series.flatMap((m) => [m.sets, m.reps]));
	const allZero =
		series.length > 0 && series.every((s) => s.sets === 0 && s.reps === 0);
	const yAxisTicks = allZero
		? [0, 1]
		: Array.from({ length: 5 }, (_, i) => Math.ceil((maxValue / 4) * i));
	const labelHasDataX = new Set(
		series.filter((s) => s.sets > 0 || s.reps > 0).map((s) => s.x),
	);

	if (series.length === 0 || allZero) {
		return (
			<View className="w-full flex-col gap-2 bg-card" style={{ height }}>
				<View className="flex-1 items-center justify-center">
					<Text className="font-funnel-medium text-muted-foreground">
						No data for the selected period
					</Text>
				</View>
			</View>
		);
	}

	const drawKey = `${useDays ? "D" : "M"}:${series[0]?.x}:${series[series.length - 1]?.x}:${series.length}`;

	return (
		<View className="w-full flex-col gap-2 bg-card">
			<View style={{ height: height }}>
				<CartesianChart
					chartPressState={state}
					data={series}
					domainPadding={{ left: 20, right: 20, top: 10 }}
					padding={{ top: 20, bottom: 20 }}
					xAxis={{
						font: font,
						tickCount: series.length,
						lineColor: colors.border,
						labelColor: colors.mutedForeground,
						lineWidth: 0,
						formatXLabel: (xVal) => {
							const key = String(xVal);
							const label = labelByXObj[key] ?? "";
							return useDays ? (labelHasDataX.has(key) ? label : "") : label;
						},
						labelRotate: 45,
					}}
					xKey="x"
					yAxis={[
						{
							font: font,
							tickValues: yAxisTicks,
							lineColor: colors.border,
							labelColor: colors.mutedForeground,
							lineWidth: 1,
							formatYLabel: (yVal) => `${Math.round(yVal)}`,
						},
					]}
					yKeys={["sets", "reps"]}
				>
					{({ points }) => (
						<>
							<DrawnLine
								color={colors.gradient.start}
								drawKey={`${drawKey}:sets`}
								key={`${drawKey}:sets`}
								points={points.sets}
								strokeWidth={1}
							/>
							<DrawnLine
								color={colors.gradient.end ?? colors.mutedForeground}
								drawKey={`${drawKey}:reps`}
								key={`${drawKey}:reps`}
								points={points.reps}
								strokeWidth={1}
							/>
							{isActive && (
								<>
									<ToolTip
										colorScheme={colorScheme}
										x={state.x.position}
										y={state.y.sets.position}
									/>
									<ToolTip
										colorScheme={colorScheme}
										x={state.x.position}
										y={state.y.reps.position}
									/>
								</>
							)}
						</>
					)}
				</CartesianChart>
			</View>
			<View className="flex-row items-center justify-center gap-2 border-border border-t pt-2">
				<View className="flex-row">
					<AnimatedTextInput
						animatedProps={animatedText}
						className="p-0 font-funnel-medium text-base text-muted-foreground"
						editable={false}
						underlineColorAndroid={"transparent"}
					/>
				</View>
			</View>
		</View>
	);
};

function DrawnLine({
	points,
	color,
	strokeWidth,
	drawKey,
}: {
	points: PointsArray;
	color: string;
	strokeWidth: number;
	drawKey: string;
}) {
	// approximate path length in screen units
	const length = useMemo(() => {
		let sum = 0;
		for (let i = 1; i < points.length; i++) {
			const dx = (points[i].x as number) - (points[i - 1].x as number);
			const dy = (points[i].y as number) - (points[i - 1].y as number);
			sum += Math.hypot(dx, dy);
		}
		return Math.max(1, Math.round(sum));
	}, [points]);

	const phase = useSharedValue(length);
	useEffect(() => {
		phase.value = length;
		phase.value = withTiming(0, {
			duration: 1200,
			easing: Easing.out(Easing.cubic),
		});
	}, [drawKey, length]);

	return (
		<Line color={color} points={points} strokeWidth={strokeWidth}>
			<DashPathEffect intervals={[length, length]} phase={phase} />
		</Line>
	);
}

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
			<Circle color={colors.gradient.start} cx={x} cy={y} r={4} />
			<Circle color={colors.background} cx={x} cy={y} r={2} />
		</>
	);
}
