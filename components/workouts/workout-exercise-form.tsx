import { useForm, useStore } from "@tanstack/react-form";
import {
	Keyboard,
	ScrollView,
	TouchableWithoutFeedback,
	View,
} from "react-native";
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

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { EXERCISES_TYPES } from "~/lib/constants";
import { Plus } from "~/lib/icons/Plus";
import { useEffect } from "react";

export const WorkoutExerciseForm = ({
	setOpen,
	openExerciseForm,
	workoutId,
	currentExercisesAmount,
	isUpdate = false,
	workoutExerciseId,
	currentSets,
	currentReps,
	currentWeight,
	exerciseName,
	exerciseId,
	setCreatedExercise,
}: {
	setOpen: (open: boolean) => void;
	openExerciseForm?: () => void;
	workoutId?: number;
	currentExercisesAmount: number;
	isUpdate?: boolean;
	workoutExerciseId?: number;
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
			sets: currentSets?.toString() ?? "",
			reps: currentReps?.toString() ?? "",
			weight: currentWeight?.toString() ?? "",
		},
		onSubmit: async ({ value }) => {
			try {
				const exerciseData = {
					sets: Number(value.sets),
					reps: Number(value.reps),
					weight: value.weight === "" ? 0 : Number(value.weight),
				};
				if (isUpdate && workoutExerciseId) {
					await db
						.update(schema.workoutExercises)
						.set(exerciseData)
						.where(eq(schema.workoutExercises.id, workoutExerciseId));
				} else if (workoutId) {
					await db.insert(schema.workoutExercises).values({
						...exerciseData,
						workoutId,
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
			onChange: schema.workoutExerciseFormSchema,
		},
	});

	const setsObject = useStore(form.store, (state) => state.fieldMeta.sets);
	const repsObject = useStore(form.store, (state) => state.fieldMeta.reps);
	const weightObject = useStore(form.store, (state) => state.fieldMeta.weight);

	return (
		<TouchableWithoutFeedback>
			<View className="p-2">
				<DialogHeader>
					<DialogTitle>{isUpdate ? "Update" : "Add"} exercise</DialogTitle>
					<DialogDescription style={{ fontFamily: "ContrailOne_400Regular" }}>
						{isUpdate
							? "Update exercise of your workout"
							: "Add an exercise to your workout"}
					</DialogDescription>
				</DialogHeader>
				<View className="flex flex-col py-3">
					{!isUpdate ? (
						<View className="flex flex-row items-center justify-stretch gap-2">
							<form.Field name="exerciseId">
								{(field) => (
									<View className="">
										<Label
											style={{ fontFamily: "ContrailOne_400Regular" }}
											className="mb-1"
											nativeID={field.name}
										>
											Exercise:
										</Label>
										<Select
											value={field.state.value}
											// @ts-ignore
											onValueChange={field.handleChange}
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
												insets={contentInsets}
												className="w-[220px]"
											>
												<ScrollView className="max-h-72">
													{EXERCISES_TYPES.map(
														(type) =>
															exercises.filter(
																(exercise) => exercise.type === type,
															).length > 0 && (
																<SelectGroup key={type}>
																	<SelectLabel className="-ml-4 font-extrabold">
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
								<Text className="font-bold text-primary">New</Text>
							</Button>
						</View>
					) : (
						<View className="pb-2">
							<Label style={{ fontFamily: "ContrailOne_400Regular" }}>
								Exercise:
							</Label>
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
						<form.Field name="sets">
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label
										style={{ fontFamily: "ContrailOne_400Regular" }}
										nativeID={field.name}
									>
										Sets
									</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
										inputMode="numeric"
										className="w-[60px]"
										placeholder="4"
									/>
								</View>
							)}
						</form.Field>

						<form.Field name="reps">
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label
										style={{ fontFamily: "ContrailOne_400Regular" }}
										nativeID={field.name}
									>
										Reps
									</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
										inputMode="numeric"
										className="w-[60px]"
										placeholder="12"
									/>
								</View>
							)}
						</form.Field>

						<form.Field name="weight">
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label
										style={{ fontFamily: "ContrailOne_400Regular" }}
										nativeID={field.name}
									>
										Weight (kg)
									</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
										inputMode="numeric"
										className="w-[60px]"
										placeholder="25"
									/>
								</View>
							)}
						</form.Field>
					</View>

					{/* Centralized error display */}
					<View className="flex justify-around gap-1 py-2">
						{setsObject?.errors?.length > 0 && (
							<Text className="text-red-500 text-sm">
								<Text className="font-bold">{"Sets"}: </Text>{" "}
								{setsObject.errors[0]?.message}
							</Text>
						)}
						{repsObject?.errors?.length > 0 && (
							<Text className="text-red-500 text-sm">
								<Text className="font-bold">{"Reps"}: </Text>{" "}
								{repsObject.errors[0]?.message}
							</Text>
						)}
						{weightObject?.errors?.length > 0 && (
							<Text className="text-red-500 text-sm">
								<Text className="font-bold">{"Weight"}: </Text>{" "}
								{weightObject.errors[0]?.message}
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
