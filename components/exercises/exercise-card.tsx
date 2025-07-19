import { eq, sql } from "drizzle-orm";
import { I18n } from "i18n-js";
import { TouchableOpacity, View } from "react-native";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import type { Exercise } from "~/db/schema";
import * as schema from "~/db/schema";
import { EXERCISES, EXERCISES_TYPES, MUSCLE_GROUPS } from "~/lib/constants";
import { Trash2 } from "~/lib/icons/Trash2";

const i18n = new I18n({
	en: {
		primaryMuscle: "Primary muscle",
		confirmDelete: "Confirm Delete",
		confirmDeleteDescription:
			"Are you sure you want to delete this exercise? This action cannot be undone.",
		cancel: "Cancel",
		continue: "Continue",
	},
	es: {
		primaryMuscle: "Grupo muscular principal",
		confirmDelete: "Confirmar eliminación",
		confirmDeleteDescription:
			"¿Estás seguro de querer eliminar este ejercicio? Esta acción no se puede deshacer.",
		cancel: "Cancelar",
		continue: "Continuar",
	},
});

const deleteExercise = async (id: number) => {
	try {
		// First, get all workout plan exercises that will be affected
		const affectedPlans = await db
			.select({
				planId: schema.workoutPlanExercises.planId,
				sortOrder: schema.workoutPlanExercises.sortOrder,
			})
			.from(schema.workoutPlanExercises)
			.where(eq(schema.workoutPlanExercises.exerciseId, id));

		// Group by planId to handle multiple workout plans
		const planGroups = new Map();
		affectedPlans.forEach((item) => {
			if (!planGroups.has(item.planId)) {
				planGroups.set(item.planId, []);
			}
			planGroups.get(item.planId).push(item.sortOrder);
		});

		// Delete the exercise (this will cascade delete all related workout plan exercises)
		await db.delete(schema.exercises).where(eq(schema.exercises.id, id));

		// For each affected plan, update the sort order of remaining exercises
		for (const [planId, sortOrders] of planGroups.entries()) {
			// Sort the orders to process lowest first
			sortOrders.sort((a: number, b: number) => a - b);

			// Process each deleted sort order in sequence, adjusting for previously deleted items
			let offset = 0;
			for (const deletedSortOrder of sortOrders) {
				const adjustedSortOrder = deletedSortOrder - offset;

				// Update all exercises with higher sort order than the deleted one
				await db
					.update(schema.workoutPlanExercises)
					.set({
						sortOrder: sql`${schema.workoutPlanExercises.sortOrder} - 1`,
					})
					.where(
						sql`${schema.workoutPlanExercises.planId} = ${planId} AND ${schema.workoutPlanExercises.sortOrder} > ${adjustedSortOrder}`,
					);

				// Increment offset for each processed deletion
				offset++;
			}
		}
	} catch (error) {
		alert(`Error deleting exercise: ${error}`);
	}
};

export const ExerciseCard = ({
	id,
	name,
	type,
	primaryMuscleGroup,
	locale,
}: Exercise & { locale: string }) => {
	i18n.locale = locale;
	return (
		<Card className="flex-1 overflow-hidden rounded-2xl border-sky-500/70 border-t-2">
			<CardContent className="bg-gradient-to-br from-background to-background/80 px-4 py-3">
				<View className="flex flex-row items-center justify-start py-1">
					<CardTitle className="font-funnel-semibold text-lg leading-normal">
						{name}
					</CardTitle>
					<View className="ml-auto rounded-full bg-sky-100 px-2 py-0.5 dark:bg-sky-900/30">
						<Text className="font-funnel-medium text-foreground/80 text-sm">
							{EXERCISES_TYPES[locale][type]}
						</Text>
					</View>
				</View>

				<View className="my-2 flex flex-row items-center gap-2">
					<View
						className="h-6 w-1.5 rounded-full"
						style={{
							backgroundColor:
								EXERCISES_TYPES[locale][type] ===
								EXERCISES_TYPES[locale].upper_body
									? "#16a34a"
									: EXERCISES_TYPES[locale][type] ===
											EXERCISES_TYPES[locale].lower_body
										? "#8b5cf6"
										: EXERCISES_TYPES[locale][type] ===
												EXERCISES_TYPES[locale].cardio
											? "#eab308"
											: EXERCISES_TYPES[locale][type] ===
													EXERCISES_TYPES[locale].core
												? "#ef4444"
												: "#0284c7",
						}}
					/>
					<View className="flex flex-row flex-wrap items-center gap-1">
						<Text className="font-funnel-semibold text-sm">
							{i18n.t("primaryMuscle")}:
						</Text>
						{primaryMuscleGroup && (
							<Text className="rounded bg-muted/50 px-2 py-0.5 font-funnel-medium text-foreground/80 text-sm">
								{MUSCLE_GROUPS[locale][primaryMuscleGroup]}
							</Text>
						)}
					</View>

					{!EXERCISES.includes(name) && (
						<View className="ml-auto">
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<TouchableOpacity className="rounded-full bg-red-100 p-1.5">
										<Trash2 className="size-3 text-destructive " />
									</TouchableOpacity>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											{i18n.t("confirmDelete")}
										</AlertDialogTitle>
										<AlertDialogDescription>
											{i18n.t("confirmDeleteDescription")}
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											<Text>{i18n.t("cancel")}</Text>
										</AlertDialogCancel>
										<AlertDialogAction
											className="bg-destructive text-destructive-foreground"
											onPress={() => deleteExercise(id)}
										>
											<Text>{i18n.t("continue")}</Text>
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</View>
					)}
				</View>
			</CardContent>
		</Card>
	);
};
