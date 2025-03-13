import { ActivityIndicator, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Dumbbell } from "lucide-react-native";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { WorkoutPlanCard } from "~/components/workout-plan/workout-plan-card";
import { WorkoutPlanForm } from "~/components/workout-plan/workout-plan-form";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

export default function Page() {
	const [open, setOpen] = useState(false);
	const { data: workoutPlans, error: workoutPlansError } = useLiveQuery(
		db.select().from(schema.workoutPlans),
	);

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
				<ActivityIndicator size="large" color="##0284c7" />
			</View>
		);
	}

	return (
		<Dialog
			className="flex-1 items-stretch gap-4 bg-secondary/30 p-4"
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button className="shadow shadow-foreground/5">
					<Text>Add a workout plan</Text>
				</Button>
			</DialogTrigger>
			{workoutPlans.length === 0 ? (
				<View className="items-center rounded-lg bg-card p-6">
					<Dumbbell className="mb-4 size-10 text-muted-foreground" />
					<Text className="text-center text-muted-foreground">
						No workout plans created yet.
					</Text>
					<Text className="text-center text-muted-foreground">
						Tap "Add Workout Plan" to get started!
					</Text>
				</View>
			) : (
				<FlashList
					data={workoutPlans}
					renderItem={({ item, index }) => (
						<WorkoutPlanCard {...item} key={index} />
					)}
					estimatedItemSize={50}
					showsVerticalScrollIndicator={false}
					ItemSeparatorComponent={() => <View className="h-4" />}
				/>
			)}
			<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
				<WorkoutPlanForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}
