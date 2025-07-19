import { useForm, useStore } from "@tanstack/react-form";
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
import { minutesSecondsToTotalSeconds } from "~/utils/date";

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

	const form = useForm({
		defaultValues: {
			exerciseId: {
				value: exerciseId?.toString() ?? "1",
				label: exerciseName ?? "Abductor Machine",
			},
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
		},
		onSubmit: async ({ value }) => {
			try {
				const exerciseData = {
					defaultSets: Number(value.defaultSets),
					defaultReps:
						value.valueType === "reps" ? Number(value.defaultReps) : null,
					defaultDurationSeconds:
						value.valueType === "time"
							? value.defaultDurationSeconds
								? Number(value.defaultDurationSeconds)
								: minutesSecondsToTotalSeconds(durationMinutes, durationSeconds)
							: null,
					defaultWeight:
						value.defaultWeight === "" ? 0 : Number(value.defaultWeight),
				};
				if (isUpdate && workoutPlanExerciseId) {
					await db
						.update(schema.workoutPlanExercises)
						.set(exerciseData)
						.where(eq(schema.workoutPlanExercises.id, workoutPlanExerciseId));
				} else if (planId) {
					await db.insert(schema.workoutPlanExercises).values({
						...exerciseData,
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

	const defaultSetsObject = useStore(
		form.store,
		(state) => state.fieldMeta.defaultSets,
	);
	const defaultRepsObject = useStore(
		form.store,
		(state) => state.fieldMeta.defaultReps,
	);
	const defaultWeightObject = useStore(
		form.store,
		(state) => state.fieldMeta.defaultWeight,
	);

	const [durationMinutes, setDurationMinutes] = useState(() => {
		if (currentDurationSeconds) {
			return Math.floor(currentDurationSeconds / 60);
		}
		return 0; // Default to 0 minutes
	});

	const [durationSeconds, setDurationSeconds] = useState(() => {
		if (currentDurationSeconds) {
			return currentDurationSeconds % 60;
		}
		return 30; // Default to 30 seconds
	});

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
						<View className="flex flex-row items-center justify-stretch gap-2">
							<form.Field name="exerciseId">
								{(field) => (
									<View className="pb-2">
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
								className="grow flex-row items-center justify-center gap-2 bg-sky-500/70"
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
											field.handleChange("reps");
											// Clear duration when switching to reps
											form.setFieldValue("defaultDurationSeconds", "");
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
											field.handleChange("time");
											// Clear reps when switching to time
											form.setFieldValue("defaultReps", "");
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
							and weight for the exercise. This can all be changed later.
						</Text>
					)}

					<View className="flex flex-row justify-around gap-3 py-4">
						<form.Field
							name="defaultSets"
							validators={{
								onChange: z
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
									}),
							}}
						>
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label nativeID={field.name}>Sets</Label>
									<Input
										className="w-[60px]"
										inputMode="numeric"
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
								</View>
							)}
						</form.Field>

						{/* Conditional Reps or Duration Input */}
						{form.getFieldValue("valueType") === "reps" ? (
							<form.Field
								name="defaultReps"
								validators={{
									onChange: z.string().superRefine((val, ctx) => {
										// Only validate if we're in reps mode
										if (form.getFieldValue("valueType") === "reps") {
											// Check if field is required
											if (val.length < 1) {
												ctx.addIssue({
													code: z.ZodIssueCode.too_small,
													minimum: 1,
													type: "string",
													message: "Reps is required",
													inclusive: true,
												});
											}
											// Check if it's a valid number (only if not empty)
											if (val.length > 0 && isNaN(Number(val))) {
												ctx.addIssue({
													code: z.ZodIssueCode.invalid_type,
													message: "Reps must be a number",
													expected: "number",
													received: typeof val,
												});
											}
											// Check minimum value (only if it's a valid number)
											if (
												val.length > 0 &&
												!isNaN(Number(val)) &&
												Number(val) < 1
											) {
												ctx.addIssue({
													code: z.ZodIssueCode.too_small,
													minimum: 1,
													type: "number",
													message: "Reps must be at least 1",
													inclusive: true,
												});
											}
											// Check if it's a whole number (only if it's a valid number)
											if (
												val.length > 0 &&
												!isNaN(Number(val)) &&
												!Number.isInteger(Number(val))
											) {
												ctx.addIssue({
													code: z.ZodIssueCode.invalid_type,
													message: "Reps must be a whole number",
													expected: "integer",
													received: "float",
												});
											}
										}
									}),
								}}
							>
								{(field) => (
									<View className="flex items-center justify-center gap-2 ">
										<Label nativeID={field.name}>Reps</Label>
										<Input
											className="w-[60px]"
											inputMode="numeric"
											onChangeText={field.handleChange}
											value={field.state.value}
										/>
									</View>
								)}
							</form.Field>
						) : (
							<View className="flex items-center justify-center gap-2">
								<Label>Duration</Label>
								<View className="flex flex-row items-center gap-1">
									<View className="relative flex items-center gap-1">
										<Input
											className="w-[50px] text-center"
											inputMode="numeric"
											onChangeText={(text) => {
												if (Number(text) > 59) {
													return;
												}
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
						)}

						<form.Field
							name="defaultWeight"
							validators={{
								onChange: z
									.string()
									.refine((val) => !isNaN(Number(val)), {
										message: "Weight must be a number",
									})
									.refine((val) => Number(val) >= 0, {
										message: "Weight cannot be negative",
									}),
							}}
						>
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label nativeID={field.name}>Weight (kg)</Label>
									<Input
										className="w-[60px]"
										inputMode="numeric"
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
								</View>
							)}
						</form.Field>
					</View>

					{/* Centralized error display */}
					<View className="flex justify-around gap-1 py-2">
						{defaultSetsObject?.errors?.length > 0 && (
							<Text className="text-red-500 text-sm">
								<Text className="font-funnel-bold">{"Sets"}: </Text>{" "}
								{defaultSetsObject.errors[0]?.message}
							</Text>
						)}
						{form.getFieldValue("valueType") === "reps" &&
							defaultRepsObject?.errors?.length > 0 && (
								<Text className="text-red-500 text-sm">
									<Text className="font-funnel-bold">{"Reps"}: </Text>{" "}
									{defaultRepsObject.errors[0]?.message}
								</Text>
							)}
						{defaultWeightObject?.errors?.length > 0 && (
							<Text className="text-red-500 text-sm">
								<Text className="font-funnel-bold">{"Weight"}: </Text>{" "}
								{defaultWeightObject.errors[0]?.message}
							</Text>
						)}
					</View>
				</View>
				<Button onPress={form.handleSubmit}>
					<Text>{isUpdate ? "Update" : "Add"}</Text>
				</Button>
			</View>
		</TouchableWithoutFeedback>
	);
};
