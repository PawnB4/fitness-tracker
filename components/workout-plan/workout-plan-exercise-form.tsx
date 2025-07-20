import { useForm } from "@tanstack/react-form";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useState } from "react";
import {
	Keyboard,
	Pressable,
	ScrollView,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
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
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { EXERCISES_TYPES } from "~/lib/constants";
import { Clock } from "~/lib/icons/Clock";
import { Hash } from "~/lib/icons/Hash";
import { Plus } from "~/lib/icons/Plus";
import { Trash2 } from "~/lib/icons/Trash2";
import { minutesSecondsToTotalSeconds } from "~/utils/date";

const repsSchema = z
	.string()
	.min(1, { message: "Reps is required" })
	.refine((val) => !isNaN(Number(val)), {
		message: "Reps must be a number",
	})
	.refine((val) => Number(val) >= 1, { message: "Reps must be at least 1" })
	.refine((val) => Number.isInteger(Number(val)), {
		message: "Reps must be a whole number",
	});

const weightSchema = z
	.string()
	.min(0, { message: "Weight is required" })
	.refine((val) => !isNaN(Number(val)), {
		message: "Weight must be a number",
	})
	.refine((val) => Number(val) >= 0, {
		message: "Weight cannot be negative",
	});

const setsSchema = z
	.string()
	.min(1, { message: "Sets is required" })
	.refine((val) => !isNaN(Number(val)), {
		message: "Sets must be a number",
	})
	.refine((val) => Number(val) >= 1, {
		message: "Sets must be at least 1",
	})
	.refine((val) => Number.isInteger(Number(val)), {
		message: "Sets must be a whole number",
	});

export const WorkoutPlanExerciseForm = ({
	setOpen,
	openExerciseForm,
	planId,
	currentExercisesAmount,
	isUpdate = false,
	workoutPlanExerciseId,
	currentSets,
	currentReps,
	currentDurationSeconds,
	currentWeight,
	exerciseName,
	exerciseId,
	locale,
	setCreatedExercise,
	existingExerciseData,
}: {
	setOpen: (open: boolean) => void;
	openExerciseForm?: () => void;
	planId?: number;
	currentExercisesAmount: number;
	isUpdate?: boolean;
	workoutPlanExerciseId?: number;
	currentSets?: number;
	currentReps?: number;
	currentDurationSeconds?: number;
	currentWeight?: number;
	exerciseName?: string;
	exerciseId?: number;
	locale: string;
	setCreatedExercise?: (exercise: schema.Exercise | null) => void;
	existingExerciseData?: schema.WorkoutPlanExerciseData[];
}) => {
	const { data: exercises } = useLiveQuery(db.select().from(schema.exercises));

	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};

	useEffect(() => {
		return () => {
			if (setCreatedExercise) {
				setCreatedExercise(null);
			}
		};
	}, [setCreatedExercise]);

	// Initialize form values and state from existing data
	const initializeFromExistingData = () => {
		if (!existingExerciseData || existingExerciseData.length === 0) {
			return {
				valueType:
					currentReps !== undefined && currentReps !== null
						? "reps"
						: currentDurationSeconds !== undefined &&
								currentDurationSeconds !== null
							? "time"
							: "reps",
				defaultSets: currentSets?.toString() ?? "",
				defaultReps: currentReps?.toString() ?? "",
				defaultDurationSeconds: currentDurationSeconds?.toString() ?? "",
				defaultWeight: currentWeight?.toString() ?? "",
				initialDropSets: [],
				initialDurationMinutes: currentDurationSeconds
					? Math.floor(currentDurationSeconds / 60)
					: 0,
				initialDurationSeconds: currentDurationSeconds
					? currentDurationSeconds % 60
					: 30,
			};
		}

		const firstSet = existingExerciseData[0];
		const isTimeBased =
			firstSet?.defaultReps === null &&
			firstSet?.defaultDurationSeconds !== null;
		
		// Helper function to check if sets have variable values
		const hasVariableValues = (sets: schema.WorkoutPlanExerciseData[]) => {
			if (sets.length <= 1) return false;
			
			const firstSet = sets[0];
			return sets.some(set => {
				// For time-based exercises, check duration and weight
				if (isTimeBased) {
					return set.defaultDurationSeconds !== firstSet.defaultDurationSeconds ||
						   set.defaultWeight !== firstSet.defaultWeight;
				}
				// For reps-based exercises, check reps and weight
				else {
					return set.defaultReps !== firstSet.defaultReps ||
						   set.defaultWeight !== firstSet.defaultWeight;
				}
			});
		};

		// Only treat as drop sets if there are multiple sets AND values actually vary
		const isDropSets = existingExerciseData.length > 1 && hasVariableValues(existingExerciseData);

		let initialDropSets: Array<{
			setNumber: number;
			reps: string;
			durationMinutes: string;
			durationSeconds: string;
			weight: string;
		}> = [];

		if (isDropSets) {
			initialDropSets = existingExerciseData.map((set) => ({
				setNumber: set.defaultSetNumber,
				reps: set.defaultReps?.toString() ?? "",
				durationMinutes: set.defaultDurationSeconds
					? Math.floor(set.defaultDurationSeconds / 60).toString()
					: "0",
				durationSeconds: set.defaultDurationSeconds
					? (set.defaultDurationSeconds % 60).toString()
					: "30",
				weight: set.defaultWeight?.toString() ?? "",
			}));
		}

		return {
			valueType: isTimeBased ? "time" : "reps",
			defaultSets: isDropSets ? "1" : existingExerciseData.length.toString(),
			defaultReps: isDropSets
				? (initialDropSets[0]?.reps ?? "")
				: (firstSet?.defaultReps?.toString() ?? ""),
			defaultDurationSeconds:
				firstSet?.defaultDurationSeconds?.toString() ?? "",
			defaultWeight: isDropSets
				? (initialDropSets[0]?.weight ?? "")
				: (firstSet?.defaultWeight?.toString() ?? ""),
			initialDropSets,
			initialDurationMinutes: firstSet?.defaultDurationSeconds
				? Math.floor(firstSet.defaultDurationSeconds / 60)
				: 0,
			initialDurationSeconds: firstSet?.defaultDurationSeconds
				? firstSet.defaultDurationSeconds % 60
				: 30,
		};
	};

	const initData = initializeFromExistingData();

	// State for drop sets
	const [dropSets, setDropSets] = useState<
		Array<{
			setNumber: number;
			reps: string;
			durationMinutes: string;
			durationSeconds: string;
			weight: string;
		}>
	>(initData.initialDropSets);

	const [durationMinutes, setDurationMinutes] = useState(
		initData.initialDurationMinutes,
	);
	const [durationSeconds, setDurationSeconds] = useState(
		initData.initialDurationSeconds,
	);

	const form = useForm({
		defaultValues: {
			exerciseId: {
				value: exerciseId?.toString() ?? "1",
				label: exerciseName ?? "Abductor Machine",
			},
			valueType: initData.valueType,
			defaultSets: initData.defaultSets,
			defaultReps: initData.defaultReps,
			defaultDurationSeconds: initData.defaultDurationSeconds,
			defaultWeight: initData.defaultWeight,
		},
		onSubmit: async ({ value }) => {
			try {
				// Build the workout plan exercise data array
				const workoutPlanExerciseData: schema.WorkoutPlanExerciseData[] = [];

				if (dropSets.length > 0) {
					// Drop sets mode - use drop sets data
					dropSets.forEach((set) => {
						workoutPlanExerciseData.push({
							defaultSetNumber: set.setNumber,
							defaultReps:
								value.valueType === "reps" ? Number(set.reps) || null : null,
							defaultDurationSeconds:
								value.valueType === "time"
									? minutesSecondsToTotalSeconds(
											Number(set.durationMinutes),
											Number(set.durationSeconds),
										)
									: null,
							defaultWeight: Number(set.weight) || 0,
						});
					});
				} else {
					// Normal mode - create sets from form values
					const numSets = Number(value.defaultSets) || 1;
					for (let i = 1; i <= numSets; i++) {
						workoutPlanExerciseData.push({
							defaultSetNumber: i,
							defaultReps:
								value.valueType === "reps"
									? Number(value.defaultReps) || null
									: null,
							defaultDurationSeconds:
								value.valueType === "time"
									? value.defaultDurationSeconds
										? Number(value.defaultDurationSeconds)
										: minutesSecondsToTotalSeconds(
												durationMinutes,
												durationSeconds,
											)
									: null,
							defaultWeight: Number(value.defaultWeight) || 0,
						});
					}
				}

				console.log(
					"Workout Plan Exercise Data:",
					JSON.stringify(workoutPlanExerciseData, null, 2),
				);
				console.log("Form can submit:", form.state.canSubmit);
				console.log("Form errors:", form.state.errors);

				if (isUpdate && workoutPlanExerciseId) {
					await db
						.update(schema.workoutPlanExercises)
						.set({ workoutPlanExerciseData })
						.where(eq(schema.workoutPlanExercises.id, workoutPlanExerciseId));
				} else if (planId) {
					await db.insert(schema.workoutPlanExercises).values({
						workoutPlanExerciseData,
						planId,
						exerciseId: Number(value.exerciseId.value),
						sortOrder: currentExercisesAmount + 1,
					});
				}
				setOpen(false);
			} catch (error) {
				console.log(error);
				alert(`Error: ${error}`);
			}
		},
	});

	const updateDropSet = (index: number, field: string, value: string) => {
		const newDropSets = [...dropSets];
		newDropSets[index] = { ...newDropSets[index], [field]: value };
		setDropSets(newDropSets);

		// Clear errors when user starts typing
		if (dropSetsErrors) {
			setDropSetsErrors("");
		}
	};

	const addDropSet = () => {
		// Clear any previous errors when adding drop sets
		setDropSetsErrors("");

		if (dropSets.length === 0) {
			// First drop set - use current form values and reset sets to 1
			const firstSet = {
				setNumber: 1,
				reps: form.getFieldValue("defaultReps") || "",
				durationMinutes: durationMinutes.toString(),
				durationSeconds: durationSeconds.toString(),
				weight: form.getFieldValue("defaultWeight") || "",
			};
			const secondSet = {
				setNumber: 2,
				reps: form.getFieldValue("defaultReps") || "",
				durationMinutes: durationMinutes.toString(),
				durationSeconds: durationSeconds.toString(),
				weight: form.getFieldValue("defaultWeight") || "",
			};
			setDropSets([firstSet, secondSet]);
			// Reset the sets form value to "1"
			form.setFieldValue("defaultSets", "1");
		} else if (dropSets.length < 4) {
			// Add another drop set - use values from the last drop set
			const lastSet = dropSets[dropSets.length - 1];
			const newSet = {
				setNumber: dropSets.length + 1,
				reps: lastSet.reps,
				durationMinutes: lastSet.durationMinutes,
				durationSeconds: lastSet.durationSeconds,
				weight: lastSet.weight,
			};
			setDropSets([...dropSets, newSet]);
		}
	};

	const removeLastDropSet = () => {
		if (dropSets.length > 0) {
			const newDropSets = dropSets.slice(0, -1);

			// If we're down to 1 or 0 drop sets, return to normal mode
			if (newDropSets.length <= 1) {
				// Restore form values from the first drop set (main row)
				if (dropSets.length > 0 && dropSets[0]) {
					form.setFieldValue("defaultReps", dropSets[0].reps);
					form.setFieldValue("defaultWeight", dropSets[0].weight);
				}
				setDropSets([]);
				setDropSetsErrors(""); // Clear any drop sets errors
			} else {
				setDropSets(newDropSets);
			}
		}
	};

	// State for drop sets validation errors
	const [dropSetsErrors, setDropSetsErrors] = useState<string>("");

	// State for main row validation errors
	const [mainRowErrors, setMainRowErrors] = useState<{
		sets?: string;
		reps?: string;
		weight?: string;
	}>({});

	const validateDropSetsManually = () => {
		if (dropSets.length === 0) return "";

		const errors: string[] = [];

		dropSets.forEach((set) => {
			// Validate reps (only for reps mode)
			if (form.getFieldValue("valueType") === "reps") {
				try {
					repsSchema.parse(set.reps);
				} catch (error) {
					if (error instanceof z.ZodError) {
						errors.push(`Set ${set.setNumber}: ${error.errors[0]?.message}`);
					}
				}
			}

			// Validate weight
			try {
				weightSchema.parse(set.weight);
			} catch (error) {
				if (error instanceof z.ZodError) {
					errors.push(`Set ${set.setNumber}: ${error.errors[0]?.message}`);
				}
			}
		});

		return errors.length > 0 ? errors.join(", ") : "";
	};

	const validateMainRowManually = () => {
		const errors: { sets?: string; reps?: string; weight?: string } = {};

		// Get individual field values
		const defaultSets = form.getFieldValue("defaultSets");
		const defaultReps = form.getFieldValue("defaultReps");
		const defaultWeight = form.getFieldValue("defaultWeight");
		const valueType = form.getFieldValue("valueType");

		// Validate sets (always required)
		try {
			setsSchema.parse(defaultSets);
		} catch (error) {
			if (error instanceof z.ZodError) {
				errors.sets = error.errors[0]?.message;
			}
		}

		// Validate reps (only for reps mode)
		if (valueType === "reps") {
			try {
				repsSchema.parse(defaultReps);
			} catch (error) {
				if (error instanceof z.ZodError) {
					errors.reps = error.errors[0]?.message;
				}
			}
		}

		// Validate weight (always required)
		try {
			weightSchema.parse(defaultWeight);
		} catch (error) {
			if (error instanceof z.ZodError) {
				errors.weight = error.errors[0]?.message;
			}
		}

		return errors;
	};

	const handleSubmit = async () => {
		// Manual main row validation
		const mainRowValidationErrors = validateMainRowManually();
		setMainRowErrors(mainRowValidationErrors);

		// Manual drop sets validation
		let dropSetsError = "";
		if (dropSets.length > 0) {
			dropSetsError = validateDropSetsManually();
			setDropSetsErrors(dropSetsError);
		} else {
			setDropSetsErrors("");
		}

		// Check if there are any validation errors
		const hasMainRowErrors = Object.keys(mainRowValidationErrors).length > 0;
		const hasDropSetsErrors = dropSetsError.length > 0;

		if (hasMainRowErrors || hasDropSetsErrors) {
			console.log("❌ Validation failed");
			console.log("Main row errors:", mainRowValidationErrors);
			console.log("Drop sets errors:", dropSetsError);
			return; // Don't submit if there are errors
		}

		console.log("✅ All validation passed, submitting form");
		console.log(form.state.errors);
		form.handleSubmit();
	};

	return (
		<TouchableWithoutFeedback>
			<View className="p-2">
				<DialogHeader>
					<DialogTitle>{isUpdate ? "Update" : "Add"} exercise</DialogTitle>
					<DialogDescription>
						{isUpdate
							? "Update exercise of your workout plan"
							: "Add an exercise to your workout plan"}
					</DialogDescription>
				</DialogHeader>
				<View className="flex flex-col py-3">
					{!isUpdate ? (
						<View className="flex flex-row items-center justify-stretch gap-2 pb-2">
							<form.Field name="exerciseId">
								{(field) => (
									<View className="">
										<Label className="mb-1" nativeID={field.name}>
											Exercise:
										</Label>
										<Select
											// @ts-ignore
											onValueChange={field.handleChange}
											value={field.state.value}
										>
											<SelectTrigger
												className="w-[220px]"
												onPressIn={() => {
													Keyboard.dismiss();
												}}
											>
												<SelectValue
													className="native:text-lg text-foreground text-sm"
													placeholder="Select an exercise"
												/>
											</SelectTrigger>
											<SelectContent
												className="w-[220px]"
												insets={contentInsets}
											>
												<ScrollView className="max-h-72">
													{Object.entries(EXERCISES_TYPES[locale]).map(
														([typeKey, typeDisplayName]) => {
															const filteredExercises = exercises
																.filter((exercise) => exercise.type === typeKey)
																.sort((a, b) => a.name.localeCompare(b.name));

															return (
																filteredExercises.length > 0 && (
																	<SelectGroup key={typeKey}>
																		<SelectLabel className="-ml-4 font-funnel-extrabold">
																			{typeDisplayName}
																		</SelectLabel>
																		{filteredExercises.map((exercise) => (
																			<SelectItem
																				key={exercise.id}
																				label={exercise.name}
																				value={exercise.id.toString()}
																			>
																				{exercise.name}
																			</SelectItem>
																		))}
																	</SelectGroup>
																)
															);
														},
													)}
												</ScrollView>
											</SelectContent>
										</Select>
									</View>
								)}
							</form.Field>
							<Button
								className="mt-auto grow flex-row items-center justify-center gap-2 bg-sky-500/70"
								onPress={() => {
									openExerciseForm?.();
									setOpen(false);
								}}
							>
								<Plus className="text-primary" />
								<Text className="font-funnel-bold text-primary">New</Text>
							</Button>
						</View>
					) : (
						<View className="pb-2">
							<Label>Exercise:</Label>
							<Select
								value={{
									value: exerciseName ?? "",
									label: exerciseName ?? "",
								}}
							>
								<SelectTrigger className="w-[275px] cursor-not-allowed opacity-50">
									<SelectValue
										className="native:text-lg text-foreground/50 text-sm"
										placeholder={exerciseName ?? ""}
									/>
								</SelectTrigger>
							</Select>
						</View>
					)}

					{/* Value Type Toggle */}
					<form.Field name="valueType">
						{(field) => (
							<View className="py-3">
								<Label className="mb-2">Measure By:</Label>
								<View className="flex flex-row rounded-lg border border-border p-1">
									<Pressable
										className={`flex-1 flex-row items-center justify-center gap-2 rounded-md px-3 py-2 ${
											field.state.value === "reps"
												? "bg-primary"
												: "bg-transparent"
										}`}
										onPress={() => {
											if(form.getFieldValue("valueType") === "reps") return;
											field.handleChange("reps");
											setDropSets([]); // Reset drop sets when switching
											setDropSetsErrors(""); // Clear any drop sets errors
											// Reset all form values to defaults
											form.setFieldValue("defaultSets", "");
											form.setFieldValue("defaultReps", "");
											form.setFieldValue("defaultWeight", "");
											form.setFieldValue("defaultDurationSeconds", "");
											// Reset duration state
											setDurationMinutes(0);
											setDurationSeconds(30);
										}}
									>
										<Hash
											className={`${
												field.state.value === "reps"
													? "text-primary-foreground"
													: "text-muted-foreground"
											}`}
											size={16}
										/>
										<Text
											className={`font-funnel-bold ${
												field.state.value === "reps"
													? "text-primary-foreground"
													: "text-muted-foreground"
											}`}
										>
											Reps
										</Text>
									</Pressable>
									<Pressable
										className={`flex-1 flex-row items-center justify-center gap-2 rounded-md px-3 py-2 ${
											field.state.value === "time"
												? "bg-primary"
												: "bg-transparent"
										}`}
										onPress={() => {
											if(form.getFieldValue("valueType") === "time") return;
											field.handleChange("time");
											setDropSets([]); // Reset drop sets when switching
											setDropSetsErrors(""); // Clear any drop sets errors
											// Reset all form values to defaults
											form.setFieldValue("defaultSets", "");
											form.setFieldValue("defaultReps", "");
											form.setFieldValue("defaultWeight", "");
											form.setFieldValue("defaultDurationSeconds", "");
											// Reset duration state
											setDurationMinutes(0);
											setDurationSeconds(30);
										}}
									>
										<Clock
											className={`${
												field.state.value === "time"
													? "text-primary-foreground"
													: "text-muted-foreground"
											}`}
											size={16}
										/>
										<Text
											className={`font-funnel-bold ${
												field.state.value === "time"
													? "text-primary-foreground"
													: "text-muted-foreground"
											}`}
										>
											Time
										</Text>
									</Pressable>
								</View>
							</View>
						)}
					</form.Field>

					{!isUpdate && (
						<Text className="text-muted-foreground text-sm">
							Specify the number of sets,{" "}
							{form.getFieldValue("valueType") === "reps" ? "reps" : "duration"}{" "}
							and weight for the exercise.
						</Text>
					)}

					{/* Column Headers */}
					<View className="flex flex-row justify-around py-2">
						<View className="flex w-1/3 items-center justify-center ">
							<Label className="text-center">Sets</Label>
						</View>
						{form.getFieldValue("valueType") === "reps" ? (
							<View className="flex w-1/3 items-center justify-center">
								<Label className="text-center">Reps</Label>
							</View>
						) : (
							<View className="flex w-1/3 items-center justify-center">
								<Label className="text-center">Duration</Label>
							</View>
						)}
						<View className="flex w-1/3 items-center justify-center">
							<Label className="text-center">Weight (kg)</Label>
						</View>
					</View>

					<View className="flex flex-row justify-around">
						{/* Sets Input */}
						<form.Field name="defaultSets">
							{(field) => (
								<View className="w-1/3">
									<View className="flex items-center justify-center gap-2">
										<Input
											className="w-[60px]"
											editable={dropSets.length === 0}
											inputMode="numeric"
											onChangeText={(text) => {
												field.handleChange(text);
												// Clear errors when user starts typing
												if (mainRowErrors.sets) {
													setMainRowErrors((prev) => ({
														...prev,
														sets: undefined,
													}));
												}
											}}
											value={dropSets.length > 0 ? "1" : field.state.value}
										/>
									</View>
								</View>
							)}
						</form.Field>

						{/* Reps or Duration Input */}
						{form.getFieldValue("valueType") === "reps" ? (
							<form.Field name="defaultReps">
								{(field) => (
									<View className="w-1/3">
										<View className="flex items-center justify-center gap-2">
											<Input
												className="w-[60px]"
												editable={true}
												inputMode="numeric"
												onChangeText={(text) => {
													field.handleChange(text);
													// Also update first drop set if in drop sets mode
													if (dropSets.length > 0) {
														const newDropSets = [...dropSets];
														newDropSets[0] = { ...newDropSets[0], reps: text };
														setDropSets(newDropSets);
													}
													// Clear errors when user starts typing
													if (mainRowErrors.reps) {
														setMainRowErrors((prev) => ({
															...prev,
															reps: undefined,
														}));
													}
												}}
												value={
													dropSets.length > 0
														? dropSets[0]?.reps || ""
														: field.state.value
												}
											/>
										</View>
									</View>
								)}
							</form.Field>
						) : (
							<View className="w-1/3">
								<View className="flex items-center justify-center gap-2">
									<View className="flex flex-row items-center gap-1">
										<View className="relative flex items-center gap-1">
											<Input
												className="w-[50px] text-center"
												inputMode="numeric"
												onChangeText={(text) => {
													if (Number(text) > 59) return;
													const minutes = Number(text) || 0;
													setDurationMinutes(minutes);
													form.setFieldValue(
														"defaultDurationSeconds",
														minutesSecondsToTotalSeconds(
															minutes,
															durationSeconds,
														).toString(),
													);
												}}
												value={durationMinutes.toString()}
											/>
											<Text className="-bottom-5 absolute text-muted-foreground text-xs">
												min
											</Text>
										</View>
										<Text className="text-foreground">:</Text>
										<View className="relative flex items-center gap-1">
											<Input
												className="w-[50px] text-center"
												inputMode="numeric"
												onChangeText={(text) => {
													const seconds = Math.min(Number(text) || 0, 59);
													setDurationSeconds(seconds);
													form.setFieldValue(
														"defaultDurationSeconds",
														minutesSecondsToTotalSeconds(
															durationMinutes,
															seconds,
														).toString(),
													);
												}}
												value={durationSeconds.toString()}
											/>
											<Text className="-bottom-5 absolute text-muted-foreground text-xs">
												sec
											</Text>
										</View>
									</View>
								</View>
							</View>
						)}

						{/* Weight Input */}
						<form.Field name="defaultWeight">
							{(field) => (
								<View className="w-1/3">
									<View className="flex items-center justify-center gap-2">
										<Input
											className="w-[60px]"
											editable={true}
											inputMode="numeric"
											onChangeText={(text) => {
												field.handleChange(text);
												// Also update first drop set if in drop sets mode
												if (dropSets.length > 0) {
													const newDropSets = [...dropSets];
													newDropSets[0] = { ...newDropSets[0], weight: text };
													setDropSets(newDropSets);
												}
												// Clear errors when user starts typing
												if (mainRowErrors.weight) {
													setMainRowErrors((prev) => ({
														...prev,
														weight: undefined,
													}));
												}
											}}
											value={
												dropSets.length > 0
													? dropSets[0]?.weight || ""
													: field.state.value
											}
										/>
									</View>
								</View>
							)}
						</form.Field>
					</View>

					{/* Drop Sets Rows */}
					{dropSets.length > 1 && (
						<View className="">
							{dropSets.slice(1).map((set, index) => (
								<View
									className="flex flex-row justify-around pt-1"
									key={set.setNumber}
								>
									{/* Set Number */}
									<View className="w-1/3">
										<View className="flex items-center justify-center gap-2">
											<Input
												className="w-[60px]"
												editable={false}
												value={set.setNumber.toString()}
											/>
										</View>
									</View>

									{/* Reps or Duration */}
									{form.getFieldValue("valueType") === "reps" ? (
										<View className="w-1/3">
											<View className="flex items-center justify-center gap-2">
												<Input
													className="w-[60px]"
													inputMode="numeric"
													onChangeText={(text) =>
														updateDropSet(index + 1, "reps", text)
													}
													value={set.reps}
												/>
											</View>
										</View>
									) : (
										<View className="w-1/3">
											<View className="flex items-center justify-center gap-2">
												<View className="flex flex-row items-center gap-1">
													<View className="relative flex items-center gap-1">
														<Input
															className="w-[50px] text-center"
															inputMode="numeric"
															onChangeText={(text) => {
																if (Number(text) > 59) return;
																updateDropSet(
																	index + 1,
																	"durationMinutes",
																	text,
																);
															}}
															value={set.durationMinutes}
														/>
														<Text className="-bottom-5 absolute text-muted-foreground text-xs">
															min
														</Text>
													</View>
													<Text className="text-foreground">:</Text>
													<View className="relative flex items-center gap-1">
														<Input
															className="w-[50px] text-center"
															inputMode="numeric"
															onChangeText={(text) => {
																const seconds = Math.min(Number(text) || 0, 59);
																updateDropSet(
																	index + 1,
																	"durationSeconds",
																	seconds.toString(),
																);
															}}
															value={set.durationSeconds}
														/>
														<Text className="-bottom-5 absolute text-muted-foreground text-xs">
															sec
														</Text>
													</View>
												</View>
											</View>
										</View>
									)}

									{/* Weight */}
									<View className="w-1/3">
										<View className="relative flex items-center justify-center gap-2">
											<Input
												className="w-[60px]"
												inputMode="numeric"
												onChangeText={(text) =>
													updateDropSet(index + 1, "weight", text)
												}
												value={set.weight}
											/>
											{/* Delete button only on last row */}
											{index === dropSets.length - 2 && (
												<Pressable
													className="absolute right-0"
													onPress={removeLastDropSet}
												>
													<Trash2 className="text-destructive" size={16} />
												</Pressable>
											)}
										</View>
									</View>
								</View>
							))}
						</View>
					)}

					{/* Add more button - centralized */}
					<View
						className={`${form.getFieldValue("valueType") === "reps" ? "pt-4" : "pt-8"}`}
					>
						{dropSets.length < 4 && (
							<Pressable
								className="mx-auto w-32 rounded-lg border border-sky-500/30 bg-sky-50 px-2 py-1 active:bg-sky-100"
								onPress={addDropSet}
							>
								<Text className="text-center font-medium text-sky-600 text-sm">
									+ add more
								</Text>
							</Pressable>
						)}
					</View>

					{/* Error Display */}
					<View className={`flex justify-around gap-1 py-2`}>
						{/* Show main row errors for normal mode, drop sets errors for drop sets mode */}
						{dropSets.length < 2 ? (
							<>
								{mainRowErrors.sets && (
									<Text className="text-red-500 text-sm">
										<Text className="font-funnel-bold">Sets: </Text>
										{mainRowErrors.sets}
									</Text>
								)}
								{form.getFieldValue("valueType") === "reps" &&
									mainRowErrors.reps && (
										<Text className="text-red-500 text-sm">
											<Text className="font-funnel-bold">Reps: </Text>
											{mainRowErrors.reps}
										</Text>
									)}
								{mainRowErrors.weight && (
									<Text className="text-red-500 text-sm">
										<Text className="font-funnel-bold">Weight: </Text>
										{mainRowErrors.weight}
									</Text>
								)}
							</>
						) : (
							// biome-ignore lint/complexity/noUselessFragments: false positive
							<>
								{dropSetsErrors && (
									<Text className="text-red-500 text-sm">
										<Text className="font-funnel-bold">Drop Sets: </Text>
										{dropSetsErrors}
									</Text>
								)}
							</>
						)}
					</View>
				</View>
				<Button onPress={handleSubmit}>
					<Text>{isUpdate ? "Update" : "Add"}</Text>
				</Button>
			</View>
		</TouchableWithoutFeedback>
	);
};
