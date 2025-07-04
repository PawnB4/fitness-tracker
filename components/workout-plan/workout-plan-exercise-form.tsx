import { useForm, useStore } from "@tanstack/react-form";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect } from "react";
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
import { Plus } from "~/lib/icons/Plus";

export const WorkoutPlanExerciseForm = ({
	setOpen,
	openExerciseForm,
	planId,
	currentExercisesAmount,
	isUpdate = false,
	workoutPlanExerciseId,
	currentSets,
	currentReps,
	currentWeight,
	exerciseName,
	exerciseId,
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
	currentWeight?: number;
	exerciseName?: string;
	exerciseId?: number;
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
			defaultSets: currentSets?.toString() ?? "",
			defaultReps: currentReps?.toString() ?? "",
			defaultWeight: currentWeight?.toString() ?? "",
		},
		onSubmit: async ({ value }) => {
			try {
				const exerciseData = {
					defaultSets: Number(value.defaultSets),
					defaultReps: Number(value.defaultReps),
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
		validators: {
			onChange: schema.insertWorkoutPlanExerciseSchema,
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
													{EXERCISES_TYPES.map(
														(type) =>
															exercises.filter(
																(exercise) => exercise.type === type,
															).length > 0 && (
																<SelectGroup key={type}>
																	<SelectLabel className="-ml-4 font-funnel-extrabold">
																		{type}
																	</SelectLabel>
																	{exercises
																		.filter(
																			(exercise) => exercise.type === type,
																		)
																		.map((exercise) => (
																			<SelectItem
																				key={exercise.id}
																				label={exercise.name}
																				value={exercise.id.toString()}
																			>
																				{exercise.name}
																			</SelectItem>
																		))}
																</SelectGroup>
															),
													)}
												</ScrollView>
											</SelectContent>
										</Select>
										{field.state.meta.errors ? (
											<Text className="mt-1 text-red-500">
												{field.state.meta.errors[0]?.message}
											</Text>
										) : null}
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

					{!isUpdate && (
						<Text className="text-muted-foreground text-sm">
							Specify the number of sets, reps and weight for the exercise. This
							can all be changed later.
						</Text>
					)}

					<View className="flex flex-row justify-around gap-3 py-4">
						<form.Field name="defaultSets">
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label nativeID={field.name}>Sets</Label>
									<Input
										className="w-[60px]"
										inputMode="numeric"
										onChangeText={field.handleChange}
										placeholder="4"
										value={field.state.value}
									/>
								</View>
							)}
						</form.Field>

						<form.Field name="defaultReps">
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label nativeID={field.name}>Reps</Label>
									<Input
										className="w-[60px]"
										inputMode="numeric"
										onChangeText={field.handleChange}
										placeholder="12"
										value={field.state.value}
									/>
								</View>
							)}
						</form.Field>

						<form.Field name="defaultWeight">
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label nativeID={field.name}>Weight (kg)</Label>
									<Input
										className="w-[60px]"
										inputMode="numeric"
										onChangeText={field.handleChange}
										placeholder="25"
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
						{defaultRepsObject?.errors?.length > 0 && (
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
				<Button onPress={() => form.handleSubmit()}>
					<Text>{isUpdate ? "Update" : "Add"}</Text>
				</Button>
			</View>
		</TouchableWithoutFeedback>
	);
};
