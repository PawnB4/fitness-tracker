import { useForm, useStore } from "@tanstack/react-form";
import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useState } from "react";
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
import { Info } from "~/lib/icons/Info";
import { Plus } from "~/lib/icons/Plus";
import { formatDate } from "~/utils/date";

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
	setCreatedExercise?: (exercise: schema.NewExercise | null) => void;
}) => {
	const { data: exercises } = useLiveQuery(db.select().from(schema.exercises));
	const [lastExercise, setLastExercise] =
		useState<schema.WorkoutExercise | null>(null);

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
			onChange: schema.insertWorkoutExerciseSchema,
		},
	});

	// Fetch last exercise data when selectedExerciseId changes
	useEffect(() => {
		const fetchLastExercise = async () => {
			try {
				const result = await db
					.select()
					.from(schema.workoutExercises)
					.where(
						eq(
							schema.workoutExercises.exerciseId,
							Number(form.state.values.exerciseId.value),
						),
					)
					.orderBy(desc(schema.workoutExercises.createdAt))
					.limit(1);
				setLastExercise(result[0]);
			} catch (error) {
				console.error("Error fetching last exercise:", error);
				setLastExercise(null);
			}
		};

		fetchLastExercise();
	}, [form.state.values.exerciseId.value]);

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
				<View className="flex flex-col py-3 ">
					{!isUpdate ? (
						<View className="flex">
							<View className="flex flex-row items-center justify-stretch gap-2 pb-2 ">
								<form.Field name="exerciseId">
									{(field) => (
										<View className="">
											<Label
												className="mb-1"
												nativeID={field.name}
												style={{ fontFamily: "ContrailOne_400Regular" }}
											>
												Exercise:
											</Label>
											<Select
												onValueChange={field.handleChange}
												// @ts-ignore
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
									<Text className="font-bold text-primary">New</Text>
								</Button>
							</View>
							{lastExercise && (
								<View className="mb-4 flex gap-1 rounded-md bg-primary/10 p-2">
									<View className="flex flex-row items-center gap-2">
										<Info className="text-primary" />
										<Text className="text-primary">
											Last stats for this exercise (
											{formatDate(lastExercise.createdAt ?? "")}):
										</Text>
									</View>
									<View className="flex flex-row justify-around gap-8 self-center">
										<Text className="font-bold text-primary">
											Sets: {lastExercise.sets}
										</Text>
										<Text className="font-bold text-primary">
											Reps: {lastExercise.reps}
										</Text>
										<Text className="font-bold text-primary">
											Weight: {lastExercise.weight}kg
										</Text>
									</View>
								</View>
							)}
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
										nativeID={field.name}
										style={{ fontFamily: "ContrailOne_400Regular" }}
									>
										Sets
									</Label>
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

						<form.Field name="reps">
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label
										nativeID={field.name}
										style={{ fontFamily: "ContrailOne_400Regular" }}
									>
										Reps
									</Label>
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

						<form.Field name="weight">
							{(field) => (
								<View className="flex items-center justify-center gap-2 ">
									<Label
										nativeID={field.name}
										style={{ fontFamily: "ContrailOne_400Regular" }}
									>
										Weight (kg)
									</Label>
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
