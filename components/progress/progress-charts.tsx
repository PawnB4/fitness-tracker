/** biome-ignore-all lint/correctness/useExhaustiveDependencies: Cause I want */

import DateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import type { Option } from "@rn-primitives/select";
import { and, eq, gte, lte } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { I18n } from "i18n-js";
import { useEffect, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { EXERCISES_TYPES } from "~/lib/constants";
import { Calendar } from "~/lib/icons/Calendar";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { ProgressChartsTabs } from "./progress-charts-tabs";

const i18n = new I18n({
	en: {
		progressCharts: "Progress charts",
		selectExercise: "Select exercise",
		selectTimeframe: "Select timeframe",
		selectStartDate: "Select start date",
		selectEndDate: "Select end date",
		ok: "OK",
		cancel: "Cancel",
		months3: "Last 3 months",
		months6: "Last 6 months",
		months12: "Last 12 months",
		custom: "Custom...",
	},
	es: {
		progressCharts: "Gráficos de progreso",
		selectExercise: "Seleccionar ejercicio",
		selectTimeframe: "Seleccionar tiempo",
		selectStartDate: "Selecciona fecha de inicio",
		selectEndDate: "Selecciona fecha de fin",
		ok: "Aceptar",
		cancel: "Cancelar",
		months3: "Últimos 3 meses",
		months6: "Últimos 6 meses",
		months12: "Últimos 12 meses",
		custom: "Personalizado...",
	},
});

type TimeframeKey = "3m" | "6m" | "12m" | "custom";
type TimeframeState = {
	key: TimeframeKey;
	from: string; // SQLite UTC timestamp: YYYY-MM-DD HH:MM:SS
	to: string; // SQLite UTC timestamp: YYYY-MM-DD HH:MM:SS
	label: string;
};

const toSQLiteTimestampUTC = (date: Date) => {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
};

const monthsAgo = (months: number) => {
	const d = new Date();
	d.setMonth(d.getMonth() - months);
	return d;
};

const addMonths = (date: Date, months: number) => {
	const d = new Date(date);
	const day = d.getDate();
	d.setMonth(d.getMonth() + months);
	if (d.getDate() !== day) d.setDate(0);
	return d;
};

export const ProgressCharts = ({ locale }: { locale: string }) => {
	i18n.locale = locale;
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	const [exercise, setExercise] = useState<Option>({
		value: "1",
		label: "Abductor Machine",
	});

	const [triggerWidth, setTriggerWidth] = useState(0);

	const [exerciseData, setExerciseData] = useState<schema.WorkoutExercise[]>(
		[],
	);

	const [timeframe, setTimeframe] = useState<TimeframeState>(() => {
		const to = toSQLiteTimestampUTC(new Date());
		const from = toSQLiteTimestampUTC(monthsAgo(3));
		return { key: "3m", from, to, label: "Last 3 months" };
	});

	const [timeframeOption, setTimeframeOption] = useState<Option>({
		value: "3m",
		label: "Last 3 months",
	});

	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);
	const [tempFrom, setTempFrom] = useState<Date>(monthsAgo(3));
	const [tempTo, setTempTo] = useState<Date>(new Date());

	const formatLabelRange = (fromDate: Date, toDate: Date) => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		};
		return `${fromDate.toLocaleDateString(locale, options)} – ${toDate.toLocaleDateString(locale, options)}`;
	};

	const finalizeCustomRange = (fromDate: Date, toDate: Date) => {
		const from = toSQLiteTimestampUTC(fromDate);
		const to = toSQLiteTimestampUTC(toDate);
		const label = formatLabelRange(fromDate, toDate);
		setTimeframe({ key: "custom", from, to, label });
		setTimeframeOption({ value: "custom", label });
	};

	const openCustomRange = () => {
		setTempFrom(monthsAgo(3));
		setTempTo(new Date());
		setShowStartPicker(true);
	};

	const resetDefaultTimeframe = () => {
		const to = toSQLiteTimestampUTC(new Date());
		const from = toSQLiteTimestampUTC(monthsAgo(3));
		const label = i18n.t("months3");
		setTimeframe({ key: "3m", from, to, label });
		setTimeframeOption({ value: "3m", label });
		setShowStartPicker(false);
		setShowEndPicker(false);
	};

	const onChangeStart = (event: DateTimePickerEvent, date?: Date) => {
		if (Platform.OS === "android") {
			if (event.type === "set" && date) {
				setTempFrom(date);
				setShowStartPicker(false);
				setShowEndPicker(true);
			} else {
				// canceled
				resetDefaultTimeframe();
			}
		} else {
			if (date) {
				setTempFrom(date);
				setShowStartPicker(false);
				setShowEndPicker(true);
			} else {
				// iOS: guard just in case
				resetDefaultTimeframe();
			}
		}
	};

	const onChangeEnd = (event: DateTimePickerEvent, date?: Date) => {
		if (Platform.OS === "android") {
			if (event.type === "set" && date) {
				setTempTo(date);
				setShowEndPicker(false);
				finalizeCustomRange(tempFrom, date);
			} else {
				// canceled second step
				resetDefaultTimeframe();
			}
		} else {
			if (date) {
				setTempTo(date);
				setShowEndPicker(false);
				finalizeCustomRange(tempFrom, date);
			} else {
				resetDefaultTimeframe();
			}
		}
	};

	const { data: exercises } = useLiveQuery(db.select().from(schema.exercises));

	const fetchExerciseData = async () => {
		if (!exercise?.value) return;
		try {
			const data = await db
				.select()
				.from(schema.workoutExercises)
				.where(
					and(
						eq(schema.workoutExercises.exerciseId, Number(exercise.value)),
						gte(schema.workoutExercises.createdAt, timeframe.from),
						lte(schema.workoutExercises.createdAt, timeframe.to),
					),
				);
			setExerciseData(data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchExerciseData();
	}, [exercise, timeframe]);

	return (
		<View className="flex flex-col gap-3">
			<Text className="font-funnel-bold text-2xl">
				{i18n.t("progressCharts")}
			</Text>
			<View className="flex flex-row items-center justify-start gap-4">
				<View className="rounded-full bg-secondary p-2">
					<Dumbbell />
				</View>
				<Select
					className="flex-1"
					onValueChange={(e) => {
						setExercise(e);
					}}
					value={exercise}
				>
					<SelectTrigger
						className="rounded-lg border-0 bg-secondary"
						onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)}
					>
						<SelectValue
							className="mx-auto font-funnel text-foreground text-lg"
							placeholder={i18n.t("selectExercise")}
						/>
					</SelectTrigger>
					<SelectContent
						className="rounded-lg border-0 bg-secondary"
						insets={contentInsets}
						style={{ width: triggerWidth }}
					>
						<ScrollView className="max-h-72">
							{Object.entries(EXERCISES_TYPES[locale]).map(
								([typeKey, typeDisplayName]) => {
									const filteredExercises = exercises
										.filter((exercise) => exercise.type === typeKey)
										.sort((a, b) => a.name.localeCompare(b.name));

									return (
										filteredExercises.length > 0 && (
											<SelectGroup key={typeKey}>
												<SelectLabel className="-ml-4 font-funnel-extrabold">
													{typeDisplayName}
												</SelectLabel>
												{filteredExercises.map((exercise) => (
													<SelectItem
														key={exercise.id}
														label={exercise.name}
														value={exercise.id.toString()}
													>
														{exercise.name}
													</SelectItem>
												))}
											</SelectGroup>
										)
									);
								},
							)}
						</ScrollView>
					</SelectContent>
				</Select>
			</View>
			<View className="flex flex-row items-center justify-start gap-4">
				<View className="rounded-full bg-secondary p-2">
					<Calendar />
				</View>
				<Select
					className="flex-1"
					onValueChange={(opt) => {
						if (!opt) return;
						setTimeframeOption(opt);
						if (opt.value === "custom") {
							openCustomRange();
							return;
						}
						const map: Record<string, number> = { "3m": 3, "6m": 6, "12m": 12 };
						const months = map[String(opt.value)] ?? 3;
						const fromDate = monthsAgo(months);
						const toDate = new Date();
						setTimeframe({
							key: opt.value as TimeframeKey,
							from: toSQLiteTimestampUTC(fromDate),
							to: toSQLiteTimestampUTC(toDate),
							label: opt.label ?? String(opt.value),
						});
					}}
					value={timeframeOption}
				>
					<SelectTrigger
						className="rounded-lg border-0 bg-secondary"
						onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)}
					>
						<SelectValue
							className="mx-auto font-funnel text-foreground text-lg"
							placeholder={i18n.t("selectTimeframe")}
						/>
					</SelectTrigger>
					<SelectContent
						className="rounded-lg border-0 bg-secondary"
						insets={contentInsets}
						style={{ width: triggerWidth }}
					>
						<ScrollView className="max-h-72">
							<SelectItem
								className="m-0 native:mx-0 justify-center p-0 native:px-0"
								label={i18n.t("months3")}
								value={"3m"}
							>
								{i18n.t("months3")}
							</SelectItem>
							<SelectItem
								className="m-0 native:mx-0 justify-center p-0 native:px-0"
								label={i18n.t("months6")}
								value={"6m"}
							>
								{i18n.t("months6")}
							</SelectItem>
							<SelectItem
								className="m-0 native:mx-0 justify-center p-0 native:px-0"
								label={i18n.t("months12")}
								value={"12m"}
							>
								{i18n.t("months12")}
							</SelectItem>
							<SelectItem
								className="m-0 native:mx-0 justify-center p-0 native:px-0"
								label={
									timeframe.key === "custom"
										? timeframe.label
										: i18n.t("custom")
								}
								value={"custom"}
							>
								{timeframe.key === "custom"
									? timeframe.label
									: i18n.t("custom")}
							</SelectItem>
						</ScrollView>
					</SelectContent>
				</Select>
			</View>

			{showStartPicker && (
				<DateTimePicker
					display="default"
					mode="date"
					onChange={onChangeStart}
					value={tempFrom}
				/>
			)}
			{showEndPicker && (
				<DateTimePicker
					display="default"
					maximumDate={(($from: Date) => {
						const cap = addMonths($from, 18);
						const today = new Date();
						return cap < today ? cap : today;
					})(tempFrom)}
					minimumDate={tempFrom}
					mode="date"
					onChange={onChangeEnd}
					value={tempTo}
				/>
			)}
			<ProgressChartsTabs
				exerciseData={exerciseData}
				locale={locale}
				timeframeFrom={timeframe.from}
				timeframeTo={timeframe.to}
			/>
		</View>
	);
};
