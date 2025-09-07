import { useForm, useStore } from "@tanstack/react-form";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Directory, File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { I18n } from "i18n-js";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
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

const a = [
	{
		code: "too_small",
		exact: false,
		inclusive: true,
		message: "Bodyweight is required",
		minimum: 1,
		path: ["bodyweight"],
		type: "string",
	},
	{
		code: "custom",
		message: "Bodyweight must be at least 1",
		path: ["bodyweight"],
	},
];

const i18n = new I18n({
	en: {
		title: "Profile",
		preferredColorTheme: "Preferred color theme",
		dark: "Dark",
		light: "Light",
		preferredLanguage: "Preferred language",
		en: "English",
		es: "Spanish",
		exportWorkoutData: "Export workout data",
		importWorkoutData: "Import workout data",
		save: "Save",
		exportSuccessful: "Export Successful",
		exportSuccessfulDescription:
			"Your workout data has been exported. Would you like to share the file?",
		no: "No",
		share: "Share",
		failedToShareFile: "Failed to share the file. Please try again.",
		formBodyweight: "Bodyweight (kg)",
		formBodyweightPlaceholder: "Enter your bodyweight",
	},
	es: {
		title: "Perfil",
		preferredColorTheme: "Tema preferido",
		dark: "Oscuro",
		light: "Claro",
		preferredLanguage: "Idioma preferido",
		en: "Inglés",
		es: "Español",
		exportWorkoutData: "Exportar datos de entrenamiento",
		importWorkoutData: "Importar datos de entrenamiento",
		save: "Guardar",
		exportSuccessful: "Exportación exitosa",
		exportSuccessfulDescription:
			"Tus datos de entrenamiento han sido exportados. ¿Te gustaría compartir el archivo?",
		no: "No",
		share: "Compartir",
		failedToShareFile:
			"Error al compartir el archivo. Por favor, inténtalo de nuevo.",
		formBodyweight: "Peso corporal (kg)",
	},
});

export function UserForm({
	setOpenDialog,
}: {
	setOpenDialog: (open: boolean) => void;
}) {
	const { data: userSettings } = useLiveQuery(
		db.select().from(schema.user).limit(1),
	);

	i18n.locale = userSettings[0]?.locale ?? "en";

	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	const form = useForm({
		defaultValues: {
			preferredTheme: {
				value: userSettings[0]?.config?.preferredTheme ?? "",
				label: i18n.t(userSettings[0]?.config?.preferredTheme ?? ""),
			},
			locale: {
				value: userSettings[0]?.locale ?? "en",
				label: i18n.t(userSettings[0]?.locale ?? "en"),
			},
			bodyweight: userSettings[0]?.bodyweight.toString() ?? "70",
		},
		onSubmit: async ({ value }) => {
			try {
				await db.update(schema.user).set({
					config: {
						timezone: userSettings[0].config.timezone,
						preferredTheme: value.preferredTheme.value,
					},
					locale: value.locale.value,
					bodyweight: Number(value.bodyweight),
				});
				setOpenDialog(false);
			} catch (error) {
				console.log(error);
				alert(`Error: ${error}`);
			}
		},
		validators: {
			onChange: schema.updateUserSchema,
		},
	});

	const errors = useStore(form.store, (state) => state.errors);

	const exportWorkoutData = async () => {
		try {
			// Query all workouts with exercises
			const workoutData = db.select().from(schema.workouts).all();

			// Query all workout exercises with join to exercises
			const workoutExercisesData = db
				.select({
					id: schema.workoutExercises.id,
					workoutId: schema.workoutExercises.workoutId,
					exerciseId: schema.workoutExercises.exerciseId,
					workoutExerciseData: schema.workoutExercises.workoutExerciseData,
					notes: schema.workoutExercises.notes,
					completed: schema.workoutExercises.completed,
					sortOrder: schema.workoutExercises.sortOrder,
					exerciseName: schema.exercises.name,
					exerciseType: schema.exercises.type,
					exerciseMuscleGroup: schema.exercises.primaryMuscleGroup,
				})
				.from(schema.workoutExercises)
				.leftJoin(
					schema.exercises,
					eq(schema.workoutExercises.exerciseId, schema.exercises.id),
				)
				.all();

			// Create CSV headers - now including Set Number and Duration
			let csvContent =
				"Workout ID,Workout Name,Workout Date,Exercise ID,Exercise Name,Exercise Type,Muscle Group,Set Number,Reps,Duration Seconds,Weight,Notes,Completed,Sort Order\n";

			// Add workout data rows
			for (const workout of workoutData) {
				// Find all exercises for this workout
				const exercises = workoutExercisesData.filter(
					(e) => e.workoutId === workout.id,
				);

				// If no exercises, still add the workout with empty exercise data
				if (exercises.length === 0) {
					csvContent += `${workout.id},"${workout.name}",${workout.createdAt},,,,,,,,,,,\n`;
				} else {
					// Add a row for each set in each exercise
					for (const exercise of exercises) {
						const exerciseSets = exercise.workoutExerciseData || [];

						if (exerciseSets.length === 0) {
							// If no sets data, add one row with empty set data
							csvContent += `${workout.id},"${workout.name}",${workout.createdAt},${exercise.exerciseId},"${exercise.exerciseName}","${exercise.exerciseType}","${exercise.exerciseMuscleGroup}",1,,,,"${exercise.notes || ""}",${exercise.completed ? "Yes" : "No"},${exercise.sortOrder}\n`;
						} else {
							// Add a row for each set
							for (const set of exerciseSets) {
								csvContent += `${workout.id},"${workout.name}",${workout.createdAt},${exercise.exerciseId},"${exercise.exerciseName}","${exercise.exerciseType}","${exercise.exerciseMuscleGroup}",${set.setNumber},${set.reps || ""},${set.durationSeconds || ""},${set.weight},"${exercise.notes || ""}",${exercise.completed ? "Yes" : "No"},${exercise.sortOrder}\n`;
							}
						}
					}
				}
			}

			// Create directory in cache instead of documents for temporary files
			const exportDir = new Directory(Paths.cache, "exports");
			if (!exportDir.exists) {
				exportDir.create();
			}

			// Generate filename with date
			const date = new Date();
			const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
			const filename = `workout_export_${dateString}.csv`;

			// Create the file
			const file = new File(exportDir, filename);
			file.create();
			file.write(csvContent);

			// Check if sharing is available
			const isAvailable = await Sharing.isAvailableAsync();

			if (isAvailable) {
				// Show success alert with option to share
				Alert.alert(
					i18n.t("exportSuccessful"),
					i18n.t("exportSuccessfulDescription"),
					[
						{
							text: "No",
							style: "cancel",
						},
						{
							text: i18n.t("share"),
							onPress: async () => {
								try {
									await Sharing.shareAsync(file.uri, {
										mimeType: "text/csv",
										dialogTitle: "Compartir datos de entrenamiento",
										UTI: "public.comma-separated-values-text", // for iOS
									});
								} catch (error) {
									console.error("Error sharing file:", error);
									alert(i18n.t("failedToShareFile"));
								}
							},
						},
					],
				);
			} else {
				// If sharing is not available, just show where the file is
				alert(
					`Workout data exported to ${file.uri}\n\nNote: This file is in your app's storage. To access it, connect your device to a computer or use a file manager app with root access.`,
				);
			}

			console.log(`File exported to: ${file.uri}`);
			return file.uri;
		} catch (error) {
			alert(i18n.t("failedToExportWorkoutData"));
		}
	};

	const importWorkoutData = async () => {
		try {
			// Pick CSV file
			const result = await DocumentPicker.getDocumentAsync({
				type: "text/csv",
				copyToCacheDirectory: true,
			});

			if (!result.assets || result.canceled) {
				return;
			}

			const fileUri = result.assets[0].uri;
			const csvContent = await FileSystem.readAsStringAsync(fileUri);

			// Parse CSV
			const lines = csvContent.split("\n").filter((line) => line.trim());
			const headers = lines[0].split(",");

			// Expected headers: Workout ID,Workout Name,Workout Date,Exercise ID,Exercise Name,Exercise Type,Muscle Group,Set Number,Reps,Duration Seconds,Weight,Notes,Completed,Sort Order
			if (
				!headers.includes("Workout ID") ||
				!headers.includes("Exercise Name") ||
				!headers.includes("Set Number")
			) {
				Alert.alert("Error", "Invalid CSV format");
				return;
			}

			const rows = lines.slice(1).map((line) => {
				const values = line.split(",");
				const row: Record<string, string> = {};
				headers.forEach((header, index) => {
					row[header.trim()] = values[index]?.replace(/"/g, "").trim() || "";
				});
				return row;
			});

			// Get unique exercises and create missing ones
			const uniqueExercises = new Map();
			for (const row of rows) {
				if (row["Exercise Name"]) {
					uniqueExercises.set(row["Exercise Name"], {
						name: row["Exercise Name"],
						type: row["Exercise Type"] || "unknown",
						primaryMuscleGroup: row["Muscle Group"] || "",
					});
				}
			}

			// Check existing exercises and create missing ones
			const existingExercises = await db.select().from(schema.exercises);
			const existingExerciseNames = new Set(
				existingExercises.map((e) => e.name),
			);

			const exerciseNameToId = new Map();
			existingExercises.forEach((e) => exerciseNameToId.set(e.name, e.id));

			// Create missing exercises
			for (const [name, exerciseData] of uniqueExercises) {
				if (!existingExerciseNames.has(name)) {
					const newExercise = await db
						.insert(schema.exercises)
						.values(exerciseData)
						.returning();
					exerciseNameToId.set(name, newExercise[0].id);
				}
			}

			// Group rows by workout and exercise
			const workoutGroups = new Map();
			for (const row of rows) {
				const workoutKey = `${row["Workout Name"]}-${row["Workout Date"]}`;
				if (!workoutGroups.has(workoutKey)) {
					workoutGroups.set(workoutKey, {
						name: row["Workout Name"],
						date: row["Workout Date"],
						exercises: new Map(),
					});
				}

				if (row["Exercise Name"]) {
					const exerciseKey = `${row["Exercise ID"]}-${row["Sort Order"] || "0"}`;
					const workout = workoutGroups.get(workoutKey);

					if (!workout.exercises.has(exerciseKey)) {
						workout.exercises.set(exerciseKey, {
							exerciseId: row["Exercise ID"],
							exerciseName: row["Exercise Name"],
							notes: row["Notes"],
							completed: row["Completed"] === "Yes",
							sortOrder: Number.parseInt(row["Sort Order"] || "0"),
							sets: [],
						});
					}

					// Add this set to the exercise
					workout.exercises.get(exerciseKey).sets.push({
						setNumber: Number.parseInt(row["Set Number"] || "1"),
						reps: row["Reps"] ? Number.parseInt(row["Reps"]) : null,
						durationSeconds: row["Duration Seconds"]
							? Number.parseInt(row["Duration Seconds"])
							: null,
						weight: Number.parseFloat(row["Weight"] || "0"),
					});
				}
			}

			// Create workouts and their exercises
			let importedWorkouts = 0;
			let importedExercises = 0;

			for (const [, workoutData] of workoutGroups) {
				// Create workout
				const newWorkout = await db
					.insert(schema.workouts)
					.values({
						name: workoutData.name,
						createdAt: workoutData.date,
					})
					.returning();

				const workoutId = newWorkout[0].id;

				// Add exercises to workout
				for (const [, exerciseData] of workoutData.exercises) {
					const exerciseId = exerciseNameToId.get(exerciseData.exerciseName);

					if (exerciseId) {
						// Sort sets by set number and build the JSON array
						const sortedSets = exerciseData.sets.sort(
							(a: schema.WorkoutExerciseData, b: schema.WorkoutExerciseData) =>
								a.setNumber - b.setNumber,
						);

						await db.insert(schema.workoutExercises).values({
							workoutId,
							exerciseId,
							workoutExerciseData: sortedSets,
							notes: exerciseData.notes || null,
							completed: exerciseData.completed,
							sortOrder: exerciseData.sortOrder,
							createdAt: workoutData.date,
							updatedAt: workoutData.date,
						});
						importedExercises++;
					}
				}
				importedWorkouts++;
			}

			Alert.alert(
				"Import Successful",
				`Imported ${importedWorkouts} workouts with ${importedExercises} exercises`,
			);
		} catch (error) {
			console.error("Error importing data:", error);
			Alert.alert("Error", "Failed to import workout data");
		}
	};

	return (
		<View className="flex flex-col justify-center gap-4">
			<DialogTitle className="">{i18n.t("title")}</DialogTitle>
			<View className="flex flex-col gap-2">
				<form.Field name="bodyweight">
					{(field) => (
						<View className="flex flex-row items-center justify-between gap-2">
							<Text className="font-funnel-medium">
								{i18n.t("formBodyweight")}
							</Text>
							<Input
								className="w-[38vw]"
								inputMode="numeric"
								onChangeText={field.handleChange}
								value={field.state.value}
							/>
						</View>
					)}
				</form.Field>

				<form.Field name="preferredTheme">
					{(field) => (
						<View className="flex flex-row items-center justify-between gap-2">
							<Text className="font-funnel-medium">
								{i18n.t("preferredColorTheme")}
							</Text>

							<Select
								// @ts-ignore
								onValueChange={field.handleChange}
								value={field.state.value}
							>
								<SelectTrigger className="w-[38vw]">
									<SelectValue
										className="native:text-lg text-foreground text-sm"
										placeholder={i18n.t("selectTheme")}
									/>
								</SelectTrigger>
								<SelectContent className="w-[38vw]" insets={contentInsets}>
									<SelectItem key={1} label={i18n.t("dark")} value="dark">
										{i18n.t("dark")}
									</SelectItem>
									<SelectItem key={2} label={i18n.t("light")} value="light">
										{i18n.t("light")}
									</SelectItem>
								</SelectContent>
							</Select>
						</View>
					)}
				</form.Field>

				<form.Field name="locale">
					{(field) => (
						<View className="flex flex-row items-center justify-between gap-2">
							<Text className="font-funnel-medium">
								{i18n.t("preferredLanguage")}
							</Text>

							<Select
								// @ts-ignore
								onValueChange={field.handleChange}
								value={field.state.value}
							>
								<SelectTrigger className="w-[38vw]">
									<SelectValue
										className="native:text-lg text-foreground text-sm"
										placeholder={i18n.t("selectLanguage")}
									/>
								</SelectTrigger>
								<SelectContent className="w-[38vw]" insets={contentInsets}>
									<SelectItem key={1} label={i18n.t("en")} value="en">
										{i18n.t("en")}
									</SelectItem>
									<SelectItem key={2} label={i18n.t("es")} value="es">
										{i18n.t("es")}
									</SelectItem>
								</SelectContent>
							</Select>
						</View>
					)}
				</form.Field>

				{errors[0] ? (
					<Text className="text-red-500">
						{form.getFieldMeta("bodyweight")?.errors[0]?.message}
					</Text>
				) : null}
			</View>

			<Button onPress={() => exportWorkoutData()} variant="outline">
				<Text>{i18n.t("exportWorkoutData")}</Text>
			</Button>
			<Button onPress={() => importWorkoutData()} variant="outline">
				<Text>{i18n.t("importWorkoutData")}</Text>
			</Button>
			<Button onPress={form.handleSubmit}>
				<Text>{i18n.t("save")}</Text>
			</Button>
		</View>
	);
}
