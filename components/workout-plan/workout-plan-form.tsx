import { useForm } from "@tanstack/react-form";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { I18n } from "i18n-js";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
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
import { Button } from "~/components/ui/button";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { Textarea } from "../ui/textarea";

const i18n = new I18n({
	en: {
		updateWorkoutPlan: "Update workout plan",
		newWorkoutPlan: "New workout plan",
		updateWorkoutPlanDescription: "Update your workout plan",
		newWorkoutPlanDescription:
			"Create a new workout plan to add to your catalog. Workout plans are a collection of exercises from which you can create workouts.",
		name: "Name",
		namePlaceholder: "Monday legs, Tuesday chest, etc.",
		description: "Description",
		descriptionPlaceholder: "Add a description to your workout plan",
		save: "Save",
		create: "Create",
		deleteWorkoutPlan: "Delete workout plan",
		deleteWorkoutPlanConfirmation:
			"Are you sure you want to delete this workout plan? This action cannot be undone.",
		deleteWorkoutPlanConfirmationTitle: "Confirm Delete",
		cancel: "Cancel",
		continue: "Continue",
		workoutPlanAlreadyExists: "Workout plan already exists",
		workoutPlanNotFound: "Workout plan not found",
	},
	es: {
		updateWorkoutPlan: "Actualizar rutina",
		newWorkoutPlan: "Nueva rutina",
		updateWorkoutPlanDescription: "Actualiza tu rutina",
		newWorkoutPlanDescription:
			"Crea una nueva rutina para agregar a tu catálogo. Las rutinas son una colección de ejercicios de las que puedes crear entrenamientos.",
		name: "Nombre",
		namePlaceholder: "Lunes piernas, Martes pecho, etc.",
		description: "Descripción",
		descriptionPlaceholder: "Agrega una descripción a tu rutina",
		save: "Guardar",
		create: "Crear",
		deleteWorkoutPlan: "Eliminar rutina",
		deleteWorkoutPlanConfirmation:
			"¿Estás seguro de querer eliminar esta rutina? Esta acción no se puede deshacer.",
		deleteWorkoutPlanConfirmationTitle: "Confirmar eliminación",
		cancel: "Cancelar",
		continue: "Continuar",
		workoutPlanAlreadyExists: "La rutina ya existe",
		workoutPlanNotFound: "La rutina no fue encontrada",
	},
});
const deleteWorkoutPlan = async (planId: number) => {
	try {
		await db
			.delete(schema.workoutPlans)
			.where(eq(schema.workoutPlans.id, planId));
		router.replace("/(tabs)/workout-plans");
	} catch (error) {
		console.log(error);
		alert(i18n.t("workoutPlanNotFound"));
	}
};

export const WorkoutPlanForm = ({
	setOpen,
	isUpdate = false,
	planId,
	currentName,
	currentDescription,
}: {
	setOpen: (open: boolean) => void;
	isUpdate?: boolean;
	planId?: number;
	currentName?: string;
	currentDescription?: string;
}) => {
	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";
	const form = useForm({
		onSubmit: async ({ value }: { value: schema.NewWorkoutPlan }) => {
			const workoutPlan = {
				name: value.name.trim(),
				description: value.description ? value.description.trim() : null,
			};
			try {
				if (isUpdate && planId) {
					await db
						.update(schema.workoutPlans)
						.set(workoutPlan)
						.where(eq(schema.workoutPlans.id, planId));
					setOpen(false);
				} else {
					const res = await db
						.insert(schema.workoutPlans)
						.values(workoutPlan)
						.returning();
					setOpen(false);
					router.push(`/workout-plan/${res[0].id}`);
				}
			} catch (error) {
				console.log(error);
				alert(i18n.t("workoutPlanAlreadyExists"));
			}
		},
		validators: {
			onChange: schema.insertWorkoutPlansSchema,
		},
	});

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="p-2">
				<DialogHeader>
					<DialogTitle className="font-funnel-bold text-xl">
						{isUpdate ? i18n.t("updateWorkoutPlan") : i18n.t("newWorkoutPlan")}
					</DialogTitle>
					<DialogDescription>
						{isUpdate
							? i18n.t("updateWorkoutPlanDescription")
							: i18n.t("newWorkoutPlanDescription")}
					</DialogDescription>
				</DialogHeader>
				<View className="flex flex-col py-3">
					<form.Field defaultValue={currentName ?? ""} name="name">
						{(field) => (
							<>
								<Label nativeID={field.name}>{i18n.t("name")}:</Label>
								<Input
									onChangeText={field.handleChange}
									placeholder={i18n.t("namePlaceholder")}
									value={field.state.value as string}
								/>
								{field.state.meta.errors ? (
									<Text className="text-red-500">
										{field.state.meta.errors[0]?.message}
									</Text>
								) : null}
							</>
						)}
					</form.Field>

					<form.Field
						defaultValue={currentDescription ?? ""}
						name="description"
					>
						{(field) => (
							<>
								<Label nativeID={field.name}>{i18n.t("description")}:</Label>
								<Textarea
									aria-labelledby="textareaLabel"
									onChangeText={field.handleChange}
									placeholder={i18n.t("descriptionPlaceholder")}
									value={field.state.value as string}
								/>
								{field.state.meta.errors ? (
									<Text className="text-red-500">
										{field.state.meta.errors[0]?.message}
									</Text>
								) : null}
							</>
						)}
					</form.Field>
				</View>
				<View className="flex grow gap-2">
					<Button onPress={() => form.handleSubmit()}>
						<Text>{isUpdate ? i18n.t("save") : i18n.t("create")}</Text>
					</Button>
					{isUpdate && planId && (
						<AlertDialog className="">
							<AlertDialogTrigger asChild>
								<Button className="bg-destructive">
									<Text className="text-destructive-foreground">
										{i18n.t("deleteWorkoutPlan")}
									</Text>
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										{i18n.t("deleteWorkoutPlanConfirmationTitle")}
									</AlertDialogTitle>
									<AlertDialogDescription>
										{i18n.t("deleteWorkoutPlanConfirmation")}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										<Text>{i18n.t("cancel")}</Text>
									</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive text-destructive-foreground"
										onPress={() => deleteWorkoutPlan(planId)}
									>
										<Text>{i18n.t("continue")}</Text>
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
};
