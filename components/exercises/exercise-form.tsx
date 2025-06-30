import type { Option } from "@rn-primitives/select";
import { useForm } from "@tanstack/react-form";
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
				name: value.name,
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
				alert("Error: Exercise already exists");
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
					<DialogTitle>New exercise</DialogTitle>
					<DialogDescription style={{ fontFamily: "ContrailOne_400Regular" }}>
						Create a new exercise to add to your catalog.
					</DialogDescription>
				</DialogHeader>
				<View className="flex flex-col py-3">
					<form.Field name="name">
						{(field) => (
							<>
								<Label
									nativeID={field.name}
									style={{ fontFamily: "ContrailOne_400Regular" }}
								>
									Name:
								</Label>
								<Input
									onChangeText={field.handleChange}
									placeholder="Pushups, Split Squats, etc."
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
						defaultValue={{
							value: EXERCISES_TYPES[0],
							label: EXERCISES_TYPES[0],
						}}
						name="type"
					>
						{(field) => (
							<>
								<Label
									nativeID={field.name}
									style={{ fontFamily: "ContrailOne_400Regular" }}
								>
									Type:
								</Label>
								<Select
									// @ts-ignore
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
											placeholder="Select the type of exercise"
										/>
									</SelectTrigger>
									<SelectContent className="w-[275px]" insets={contentInsets}>
										{EXERCISES_TYPES.map((type) => (
											<SelectItem key={type} label={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors ? (
									<Text className="text-red-500 ">
										{field.state.meta.errors[0]?.message}
									</Text>
								) : null}
							</>
						)}
					</form.Field>

					<form.Field name="primaryMuscleGroup">
						{(field) => (
							<>
								<Label
									nativeID={field.name}
									style={{ fontFamily: "ContrailOne_400Regular" }}
								>
									Primary muscle group:
								</Label>

								<Select
									// @ts-ignore
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
											placeholder="(Optional) Select muscle group"
										/>
									</SelectTrigger>

									<SelectContent className="w-[275px]" insets={contentInsets}>
										<ScrollView className="max-h-56">
											{MUSCLE_GROUPS.map((muscleGroup) => (
												<SelectItem
													key={muscleGroup}
													label={muscleGroup}
													value={muscleGroup}
												>
													{muscleGroup}
												</SelectItem>
											))}
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
					<Text>Create</Text>
				</Button>
			</View>
		</TouchableWithoutFeedback>
	);
};
