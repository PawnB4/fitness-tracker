import type { Option } from "@rn-primitives/select";
import { useForm } from "@tanstack/react-form";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { I18n } from "i18n-js";
import { useEffect, useRef } from "react";
import {
	Keyboard,
	ScrollView,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { EXERCISES_TYPES, MUSCLE_GROUPS } from "~/lib/constants";

const i18n = new I18n({
	en: {
		newExercise: "New exercise",
		newExerciseDescription: "Create a new exercise to add to your catalog.",
		name: "Name",
		namePlaceholder: "Pushups, Split Squats, etc.",
		type: "Type",
		typePlaceholder: "Select the type of exercise",
		primaryMuscleGroup: "Primary muscle group",
		primaryMuscleGroupPlaceholder: "Select muscle group",
		create: "Create",
		exerciseAlreadyExists: "Exercise already exists",
	},
	es: {
		newExercise: "Nuevo ejercicio",
		newExerciseDescription:
			"Crea un nuevo ejercicio para agregar a tu catálogo.",
		name: "Nombre",
		namePlaceholder: "Flexiones, Sentadillas, etc.",
		type: "Tipo",
		typePlaceholder: "Seleccionar el tipo de ejercicio",
		primaryMuscleGroup: "Grupo muscular principal",
		primaryMuscleGroupPlaceholder: "Seleccionar grupo muscular",
		create: "Crear",
		exerciseAlreadyExists: "El ejercicio ya existe",
	},
});

export const ExerciseForm = ({
	setOpen,
	openWorkoutPlanExerciseForm,
	openWorkoutExerciseForm,
	setCreatedExercise,
}: {
	setOpen: (open: boolean) => void;
	openWorkoutPlanExerciseForm?: () => void;
	openWorkoutExerciseForm?: () => void;
	setCreatedExercise?: (exercise: schema.Exercise | null) => void;
}) => {
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	const { data: userLocale, error: userLocaleError } = useLiveQuery(
		db.select({ locale: schema.user.locale }).from(schema.user).limit(1),
	);

	i18n.locale = userLocale?.[0]?.locale ?? "en";

	const wasSubmitted = useRef(false);

	useEffect(() => {
		wasSubmitted.current = false;
	}, []);

	useEffect(() => {
		return () => {
			// Only reopen the previous form if the user DID NOT submit
			if (!wasSubmitted.current) {
				console.log("Executed cleanup");
				if (setCreatedExercise) {
					setCreatedExercise(null);
				}
				if (openWorkoutPlanExerciseForm) {
					openWorkoutPlanExerciseForm();
				} else if (openWorkoutExerciseForm) {
					openWorkoutExerciseForm();
				}
			}
		};
	}, [
		openWorkoutExerciseForm,
		openWorkoutPlanExerciseForm,
		setCreatedExercise,
	]);

	const form = useForm({
		onSubmit: async ({ value }: { value: schema.NewExercise }) => {
			const newExercise = {
				name: value.name.trim(),
				type: value.type.value,
				primaryMuscleGroup: value.primaryMuscleGroup?.value ?? null,
			};
			try {
				const [createdExercise] = await db
					.insert(schema.exercises)
					.values(newExercise)
					.returning();
				if (setCreatedExercise) {
					setCreatedExercise(createdExercise);
				}
				wasSubmitted.current = true;
				setOpen(false);
				if (openWorkoutPlanExerciseForm) {
					openWorkoutPlanExerciseForm();
				} else if (openWorkoutExerciseForm) {
					openWorkoutExerciseForm();
				}
			} catch (error) {
				console.log(error);
				alert(i18n.t("exerciseAlreadyExists"));
			}
		},
		validators: {
			onChange: schema.insertExerciseSchema,
		},
	});

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="p-2">
				<DialogHeader>
					<DialogTitle>{i18n.t("newExercise")}</DialogTitle>
					<DialogDescription>
						{i18n.t("newExerciseDescription")}
					</DialogDescription>
				</DialogHeader>
				<View className="flex flex-col py-3">
					<form.Field name="name">
						{(field) => (
							<>
								<Label nativeID={field.name}>{i18n.t("name")}:</Label>
								<Input
									onChangeText={field.handleChange}
									placeholder={i18n.t("namePlaceholder")}
									value={field.state.value}
								/>
								{field.state.meta.errors ? (
									<Text className="text-red-500">
										{field.state.meta.errors[0]?.message}
									</Text>
								) : null}
							</>
						)}
					</form.Field>
					<form.Field name="type">
						{(field) => (
							<>
								<Label nativeID={field.name}>{i18n.t("type")}:</Label>
								<Select
									// @ts-expect-error
									onValueChange={field.handleChange}
									value={field.state.value}
								>
									<SelectTrigger
										className="w-[275px]"
										onPressIn={() => {
											Keyboard.dismiss();
										}}
									>
										<SelectValue
											className="native:text-lg text-foreground text-sm"
											placeholder={i18n.t("typePlaceholder")}
										/>
									</SelectTrigger>
									<SelectContent className="w-[275px]" insets={contentInsets}>
										{Object.entries(EXERCISES_TYPES[i18n.locale]).map(
											([key, value]) => (
												<SelectItem key={key} label={value} value={key}>
													{value}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
								{field.state.meta.errors ? (
									<Text className="text-red-500">
										{field.state.meta.errors[0]?.message}
									</Text>
								) : null}
							</>
						)}
					</form.Field>

					<form.Field name="primaryMuscleGroup">
						{(field) => (
							<>
								<Label nativeID={field.name}>
									{i18n.t("primaryMuscleGroup")}:
								</Label>

								<Select
									onValueChange={field.handleChange}
									value={field.state.value as Option}
								>
									<SelectTrigger
										className="w-[275px]"
										onPressIn={() => {
											Keyboard.dismiss();
										}}
									>
										<SelectValue
											className="native:text-lg text-foreground text-sm"
											placeholder={i18n.t("primaryMuscleGroupPlaceholder")}
										/>
									</SelectTrigger>

									<SelectContent className="w-[275px]" insets={contentInsets}>
										<ScrollView className="max-h-56">
											{Object.entries(MUSCLE_GROUPS[i18n.locale]).map(
												([key, value]) => (
													<SelectItem key={key} label={value} value={key}>
														{value}
													</SelectItem>
												),
											)}
										</ScrollView>
									</SelectContent>
								</Select>
								{field.state.meta.errors ? (
									<Text className="text-red-500">
										{field.state.meta.errors[0]?.message}
									</Text>
								) : null}
							</>
						)}
					</form.Field>
				</View>
				<Button onPress={() => form.handleSubmit()}>
					<Text>{i18n.t("create")}</Text>
				</Button>
			</View>
		</TouchableWithoutFeedback>
	);
};
