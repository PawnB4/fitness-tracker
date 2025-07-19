import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { I18n } from "i18n-js";
import { useState } from "react";
import { View } from "react-native";
import { ExerciseCard } from "~/components/exercises/exercise-card";
import { ExerciseForm } from "~/components/exercises/exercise-form";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

const i18n = new I18n({
	en: {
		addExercise: "Add exercise",
		noExercisesFound: "No exercises found",
	},
	es: {
		addExercise: "Agregar ejercicio",
		noExercisesFound: "No hay ejercicios encontrados",
	},
});

export default function Page() {
	const { data: exercises, error } = useLiveQuery(
		db.select().from(schema.exercises),
	);
	const [open, setOpen] = useState(false);
	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";

	if (error) {
		return (
			<View>
				<Text>Something went wrong</Text>
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
					<Text>{i18n.t("addExercise")}</Text>
				</Button>
			</DialogTrigger>
			<FlashList
				data={exercises}
				estimatedItemSize={50}
				ItemSeparatorComponent={() => <View className="h-4" />}
				renderItem={({ item, index }) => (
					<ExerciseCard {...item} key={index} locale={i18n.locale} />
				)}
				showsVerticalScrollIndicator={false}
			/>
			<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center px-2">
				<ExerciseForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}
