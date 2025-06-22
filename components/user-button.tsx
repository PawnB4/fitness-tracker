import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Directory, File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
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
import { TIMEZONES } from "~/lib/constants";
import { CircleUser } from "~/lib/icons/CircleUser";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

export function UserButton() {
	const [openDialog, setOpenDialog] = useState(false);
	const [configObject, setConfigObject] = useState<{
		preferredTheme?: string;
		timezone?: string;
	}>({});

	const { data: userSettings } = useLiveQuery(
		db.select().from(schema.user).limit(1),
	);
	const currentUserSettings = userSettings?.[0]?.config;

	// Initialize configObject with current settings when they load
	useEffect(() => {
		if (currentUserSettings) {
			setConfigObject(currentUserSettings);
		}
	}, [currentUserSettings]);

	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	const saveConfiguration = async () => {
		try {
			await db.update(schema.user).set({
				config: configObject,
			});
			setOpenDialog(false);
		} catch (error) {
			console.log(error);
		}
	};

	// Find timezone label
	const getTimezoneLabel = (timezoneValue?: string) => {
		if (!timezoneValue) return "";
		const timezone = TIMEZONES.find((tz) => tz.value === timezoneValue);
		return timezone?.label || timezoneValue;
	};

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
					sets: schema.workoutExercises.sets,
					reps: schema.workoutExercises.reps,
					weight: schema.workoutExercises.weight,
					notes: schema.workoutExercises.notes,
					completed: schema.workoutExercises.completed,
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

			// Create CSV headers
			let csvContent =
				"Workout ID,Workout Name,Workout Date,Exercise ID,Exercise Name,Exercise Type,Muscle Group,Sets,Reps,Weight,Notes,Completed\n";

			// Add workout data rows
			for (const workout of workoutData) {
				// Find all exercises for this workout
				const exercises = workoutExercisesData.filter(
					(e) => e.workoutId === workout.id,
				);

				// If no exercises, still add the workout with empty exercise data
				if (exercises.length === 0) {
					csvContent += `${workout.id},"${workout.name}",${workout.createdAt},,,,,,,,\n`;
				} else {
					// Add a row for each exercise in this workout
					for (const exercise of exercises) {
						csvContent += `${workout.id},"${workout.name}",${workout.createdAt},${exercise.exerciseId},"${exercise.exerciseName}","${exercise.exerciseType}","${exercise.exerciseMuscleGroup}",${exercise.sets},${exercise.reps},${exercise.weight},"${exercise.notes || ""}",${exercise.completed ? "Yes" : "No"}\n`;
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
					"Export Successful",
					"Your workout data has been exported. Would you like to share the file?",
					[
						{
							text: "No",
							style: "cancel",
						},
						{
							text: "Share",
							onPress: async () => {
								try {
									await Sharing.shareAsync(file.uri, {
										mimeType: "text/csv",
										dialogTitle: "Share your workout data",
										UTI: "public.comma-separated-values-text", // for iOS
									});
								} catch (error) {
									console.error("Error sharing file:", error);
									alert("Failed to share the file. Please try again.");
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
			console.error("Error exporting workouts:", error);
			alert("Failed to export workout data. See logs for details.");
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

			// Expected headers: Workout ID,Workout Name,Workout Date,Exercise ID,Exercise Name,Exercise Type,Muscle Group,Sets,Reps,Weight,Notes,Completed
			if (
				!headers.includes("Workout ID") ||
				!headers.includes("Exercise Name")
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

			// Group rows by workout
			const workoutGroups = new Map();
			for (const row of rows) {
				const workoutKey = `${row["Workout Name"]}-${row["Workout Date"]}`;
				if (!workoutGroups.has(workoutKey)) {
					workoutGroups.set(workoutKey, {
						name: row["Workout Name"],
						date: row["Workout Date"],
						exercises: [],
					});
				}
				if (row["Exercise Name"]) {
					workoutGroups.get(workoutKey).exercises.push(row);
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
				for (let i = 0; i < workoutData.exercises.length; i++) {
					const exerciseRow = workoutData.exercises[i];
					const exerciseId = exerciseNameToId.get(exerciseRow["Exercise Name"]);

					if (exerciseId) {
						await db.insert(schema.workoutExercises).values({
							workoutId,
							exerciseId,
							sets: Number.parseInt(exerciseRow.Sets) || 1,
							reps: Number.parseInt(exerciseRow.Reps) || 1,
							weight: Number.parseFloat(exerciseRow.Weight) || 0,
							notes: exerciseRow.Notes || null,
							completed: exerciseRow.Completed === "Yes",
							sortOrder: i,
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
		<Dialog
			open={openDialog}
			onOpenChange={(e) => {
				setOpenDialog(e);
			}}
		>
			<DialogTrigger asChild>
				<Pressable className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2">
					{({ pressed }) => (
						<View
							className={cn(
								"aspect-square flex-1 items-start justify-center web:px-5 pt-0.5",
								pressed && "opacity-70",
							)}
						>
							<CircleUser
								className="text-foreground"
								size={23}
								strokeWidth={1.25}
							/>
						</View>
					)}
				</Pressable>
			</DialogTrigger>
			<DialogContent className="flex w-[90vw] min-w-[300px] max-w-[360px] flex-col justify-center gap-4 self-center p-4">
				<DialogTitle className="">User settings</DialogTitle>

				<View className="mt-4 flex flex-row items-center justify-between gap-2">
					<Text className="font-medium">Preferred color theme</Text>

					<Select
						value={{
							// @ts-ignore
							value: configObject?.preferredTheme,
							label: configObject?.preferredTheme === "dark" ? "Dark" : "Light",
						}}
						// @ts-ignore
						onValueChange={(e) =>
							setConfigObject({
								...configObject,
								preferredTheme: e?.value,
							})
						}
					>
						<SelectTrigger className="w-[38vw]">
							<SelectValue
								placeholder="Select a theme"
								className="native:text-lg text-foreground text-sm"
							/>
						</SelectTrigger>
						<SelectContent insets={contentInsets} className="w-[38vw]">
							<SelectItem key={1} label="Dark" value="dark">
								Dark
							</SelectItem>
							<SelectItem key={2} label="Light" value="light">
								Light
							</SelectItem>
						</SelectContent>
					</Select>
				</View>

				{/* Timezone */}
				{/* <View className="mt-4 flex flex-row items-center justify-between gap-2">
					<Text className="font-medium">Timezone</Text>

					<Select
						value={{
							// @ts-ignore
							value: configObject?.timezone,
							label: getTimezoneLabel(configObject?.timezone),
						}}
						// @ts-ignore
						onValueChange={(e) =>
							setConfigObject({
								...configObject,
								timezone: e?.value,
							})
						}
					>
						<SelectTrigger className="w-[38vw]">
							<SelectValue
								placeholder="Select a timezone"
								className="native:text-lg text-foreground text-sm"
							/>
						</SelectTrigger>
						<SelectContent insets={contentInsets} className="w-[38vw]">
							<ScrollView className="max-h-56">
								{TIMEZONES.map((tz) => (
									<SelectItem key={tz.value} label={tz.label} value={tz.value}>
										{tz.label}
									</SelectItem>
								))}
							</ScrollView>
						</SelectContent>
					</Select>
				</View> */}

				<Button onPress={() => exportWorkoutData()} variant="outline">
					<Text>Export workout data</Text>
				</Button>
				<Button onPress={() => importWorkoutData()} variant="outline">
					<Text>Import workout data</Text>
				</Button>
				<Button onPress={() => saveConfiguration()}>
					<Text>Save</Text>
				</Button>
			</DialogContent>
		</Dialog>
	);
}
