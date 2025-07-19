import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { I18n } from "i18n-js";
import { Dumbbell } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import { WorkoutPlanCard } from "~/components/workout-plan/workout-plan-card";
import { WorkoutPlanForm } from "~/components/workout-plan/workout-plan-form";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

const i18n = new I18n({
	en: {
		noWorkoutPlansFound: "No workout plans found",
		addWorkoutPlan: "Add a workout plan",
		noWorkoutPlansCreatedYet: "No workout plans created yet.",
		tapAddWorkoutPlanToGetStarted: "Tap 'Add Workout Plan' to get started!",
	},
	es: {
		noWorkoutPlansFound: "No hay planes de entrenamiento encontrados",
		addWorkoutPlan: "Crear una rutina",
		noWorkoutPlansCreatedYet: "No hay rutinas creadas todavía.",
		tapAddWorkoutPlanToGetStarted: "Toca 'Crear una rutina' para empezar!",
	},
});

export default function Page() {
	const [open, setOpen] = useState(false);
	const { data: workoutPlans, error: workoutPlansError } = useLiveQuery(
		db.select().from(schema.workoutPlans),
	);
	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";

	if (workoutPlansError) {
		return (
			<View>
				<Text>Something went wrong</Text>
			</View>
		);
	}

	if (!workoutPlans) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator color="##0284c7" size="large" />
			</View>
		);
	}

	return (
		<Dialog
			className="flex-1 items-stretch gap-4 bg-secondary/30 p-4"
			onOpenChange={setOpen}
			open={open}
		>
			<DialogTrigger asChild>
				<Button className="shadow shadow-foreground/5">
					<Text>{i18n.t("addWorkoutPlan")}</Text>
				</Button>
			</DialogTrigger>
			{workoutPlans.length === 0 ? (
				<View className="items-center rounded-lg bg-card p-6">
					<Dumbbell className="mb-4 size-10 text-muted-foreground" />
					<Text className="text-center text-muted-foreground">
						{i18n.t("noWorkoutPlansCreatedYet")}
					</Text>
					<Text className="text-center text-muted-foreground">
						{i18n.t("tapAddWorkoutPlanToGetStarted")}
					</Text>
				</View>
			) : (
				<FlashList
					data={workoutPlans}
					estimatedItemSize={50}
					ItemSeparatorComponent={() => <View className="h-4" />}
					renderItem={({ item, index }) => (
						<WorkoutPlanCard {...item} key={index} locale={i18n.locale} />
					)}
					showsVerticalScrollIndicator={false}
				/>
			)}
			<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
				<WorkoutPlanForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}
