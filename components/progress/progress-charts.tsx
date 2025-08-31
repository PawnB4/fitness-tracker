import type { Option } from "@rn-primitives/select";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { I18n } from "i18n-js";
import { useState } from "react";
import { ScrollView, View } from "react-native";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";

import * as schema from "~/db/schema";
import { EXERCISES_TYPES } from "~/lib/constants";

const i18n = new I18n({
	en: {
		selectExercise: "Select exercise",
	},
	es: {
		selectExercise: "Seleccionar ejercicio",
	},
});

type TabsValue = "strength" | "volume" | "frequency" | (string & {});

export const ProgressCharts = ({ locale }: { locale: string }) => {
	i18n.locale = locale;
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	const [value, setValue] = useState<TabsValue>("strength");

	const [exercise, setExercise] = useState<Option>({
		value: "1",
		label: "Abductor Machine",
	});

	const [triggerWidth, setTriggerWidth] = useState(0);

	const { data: exercises } = useLiveQuery(db.select().from(schema.exercises));

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

	return (
		<View className="flex flex-col gap-3">
			<Text className="font-funnel-bold text-2xl">Progress Charts</Text>
			<View className="flex flex-row items-center justify-start gap-4">
				<Text className="">{i18n.t("selectExercise")}:</Text>
				<Select
					className="flex-1"
					onValueChange={(e) => {
						setExercise(e);
					}}
					value={exercise}
				>
					<SelectTrigger
						className="border-0 bg-secondary"
						onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)}
					>
						<SelectValue
							className="native:text-lg text-foreground text-sm"
							placeholder={i18n.t("selectExercise")}
						/>
					</SelectTrigger>
					<SelectContent
						className=""
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
			<Tabs className="" onValueChange={setValue} value={value}>
				<TabsList className="flex flex-row justify-center gap-2 bg-green-500">
					<TabsTrigger value="strength">
						<Text>Strength</Text>
					</TabsTrigger>
					<TabsTrigger value="volume">
						<Text>Volume</Text>
					</TabsTrigger>
					<TabsTrigger value="frequency">
						<Text>Frequency</Text>
					</TabsTrigger>
				</TabsList>
				<TabsContent className="bg-green-500" value="strength">
					<Text>Strength</Text>
				</TabsContent>
				<TabsContent className="bg-green-500" value="volume">
					<Text>Volume</Text>
				</TabsContent>
				<TabsContent className="bg-green-500" value="frequency">
					<Text>Frequency</Text>
				</TabsContent>
			</Tabs>
		</View>
	);
};
