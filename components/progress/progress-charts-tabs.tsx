import { I18n } from "i18n-js";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Text } from "~/components/ui/text";

import type * as schema from "~/db/schema";
import { ProgressVolumeChart } from "~/components/charts/progress-volume-chart";
import { ProgressStrengthChart } from "~/components/charts/progress-strenght-chart";
import { ProgressFrequencyChart } from "~/components/charts/progress-frequency-chart";

const i18n = new I18n({
	en: {
		selectExercise: "Select exercise",
		strength: "Strength",
		volume: "Volume",
		frequency: "Frequency",
	},
	es: {
		selectExercise: "Seleccionar ejercicio",
		strength: "Fuerza",
		volume: "Volumen",
		frequency: "Frecuencia",
	},
});

type TabsValue = "strength" | "volume" | "frequency" | (string & {});

export const ProgressChartsTabs = ({
	locale,
	exerciseData,
	timeframeFrom,
	timeframeTo,
}: {
	locale: string;
	exerciseData: schema.WorkoutExercise[];
	timeframeFrom: string;
	timeframeTo: string;
}) => {
	i18n.locale = locale;

	const [value, setValue] = useState<TabsValue>("strength");

	return (
		<Tabs className="" onValueChange={setValue} value={value}>
			<TabsList className="flex flex-row justify-stretch gap-2 bg-inherit">
				<TabsTrigger
					className={`flex-1 rounded ${value === "strength" ? "bg-sky-500" : "bg-secondary"}`}
					value="strength"
				>
					<Text
						className={
							value === "strength"
								? "text-primary-foreground"
								: "text-secondary-foreground"
						}
					>
						{i18n.t("strength")}
					</Text>
				</TabsTrigger>
				<TabsTrigger
					className={`flex-1 rounded ${value === "volume" ? "bg-sky-500" : "bg-secondary"}`}
					value="volume"
				>
					<Text
						className={
							value === "volume"
								? "text-primary-foreground"
								: "text-secondary-foreground"
						}
					>
						{i18n.t("volume")}
					</Text>
				</TabsTrigger>
				<TabsTrigger
					className={`flex-1 rounded ${value === "frequency" ? "bg-sky-500" : "bg-secondary"}`}
					value="frequency"
				>
					<Text
						className={
							value === "frequency"
								? "text-primary-foreground"
								: "text-secondary-foreground"
						}
					>
						{i18n.t("frequency")}
					</Text>
				</TabsTrigger>
			</TabsList>
			<TabsContent className="" value="strength">
				<ProgressStrengthChart
					exerciseData={exerciseData}
					height={250}
					locale={locale}
					timeframeFrom={timeframeFrom}
					timeframeTo={timeframeTo}
				/>
			</TabsContent>
			<TabsContent className="" value="volume">
				<ProgressVolumeChart
					exerciseData={exerciseData}
					height={250}
					locale={locale}
					timeframeFrom={timeframeFrom}
					timeframeTo={timeframeTo}
				/>
			</TabsContent>
			<TabsContent className="" value="frequency">
				<ProgressFrequencyChart
					exerciseData={exerciseData}
					height={250}
					locale={locale}
					timeframeFrom={timeframeFrom}
					timeframeTo={timeframeTo}
				/>
			</TabsContent>
		</Tabs>
	);
};
