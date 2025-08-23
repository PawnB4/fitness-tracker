import { router } from "expo-router";
import { I18n } from "i18n-js";
import { Pressable, View } from "react-native";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { CircleCheck } from "~/lib/icons/CircleCheck";
import { CircleX } from "~/lib/icons/CircleX";
import { Clock } from "~/lib/icons/Clock";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { formatDate, formatTime } from "~/utils/date";

const i18n = new I18n({
	en: {
		workoutOf: "Workout of",
		completed: "Completed",
		notCompleted: "Not completed",
		exercise: "Exercise",
	},
	es: {
		workoutOf: "Entrenamiento del",
		completed: "Completado",
		notCompleted: "No completado",
		exercise: "Ejercicio",
	},
});

interface WorkoutCardProps {
	id: number;
	createdAt: string;
	totalExercises: number;
	isCompleted: boolean;
	locale: string;
}

export const WorkoutCard = ({
	id,
	createdAt,
	totalExercises,
	isCompleted,
	locale,
}: WorkoutCardProps) => {
	i18n.locale = locale;
	return (
		<Card className="flex-grow rounded-2xl shadow">
			<Pressable onPress={() => router.push(`/workout/${id}`)}>
				<CardContent className="m-0 flex gap-2 px-3 py-2">
					<CardTitle className="font-funnel-bold leading-normal tracking-wider">
						{i18n.t("workoutOf")} {formatDate(createdAt)}
					</CardTitle>

					<View className="h-1 rounded bg-sky-500/70" />
					<View className="mt-2 flex-row">
						<View className="w-1/3 flex-row items-center justify-center gap-1 border-0">
							<Clock className="size-3 text-primary" />
							<Text className="text-primary text-sm">
								{formatTime(createdAt)}
							</Text>
						</View>
						<View className="w-1/3 flex-row items-center justify-stretch gap-2 border-0">
							<Dumbbell className="size-3 text-primary" />
							<Text className="text-primary text-sm">
								{totalExercises} {i18n.t("exercise")}
								{totalExercises === 1 ? "" : "s"}
							</Text>
						</View>
						<View className="w-1/3 flex-row items-center justify-stretch gap-1 border-0">
							{totalExercises > 0 && isCompleted ? (
								<View className="flex-row items-center gap-1 border-0">
									<CircleCheck
										className="size-3 text-primary"
										fill={"#4ade80"}
									/>
									<Text className="text-primary text-sm">
										{i18n.t("completed")}
									</Text>
								</View>
							) : (
								<View className="flex-row items-center gap-1 border-0">
									<CircleX className="size-3 text-primary" fill={"#f87171"} />
									<Text className="text-primary text-sm">
										{i18n.t("notCompleted")}
									</Text>
								</View>
							)}
						</View>
					</View>
				</CardContent>
			</Pressable>
		</Card>
	);
};
