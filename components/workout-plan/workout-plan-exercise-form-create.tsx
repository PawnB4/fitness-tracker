import * as React from 'react';
import { Keyboard, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from '~/components/ui/button';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import { Text } from '~/components/ui/text';
import { useForm } from '@tanstack/react-form'
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { db } from '~/db/drizzle';
import * as schema from '~/db/schema';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXERCISES_TYPES, MUSCLE_GROUPS } from '~/lib/constants';
import { Option } from '@rn-primitives/select';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';

export const WorkoutPlanExerciseFormCreate = ({ setOpen, planId, currentExercisesAmount }: { setOpen: (open: boolean) => void, planId: number, currentExercisesAmount: number }) => {

    const [setsError, setSetsError] = useState<string | undefined>(undefined)
    const [repsError, setRepsError] = useState<string | undefined>(undefined)
    const [weightError, setWeightError] = useState<string | undefined>(undefined)

    const { data: exercises } = useLiveQuery(db.select().from(schema.exercises))


    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    const form = useForm({
        onSubmit: async ({ value }) => {
            console.log("form submitted", value)
            const parseResult = await schema.insertWorkoutPlanExercisesSchema.safeParseAsync(value)
            if (!parseResult.success) {
                alert('Invalid exercise data')
            } else {
                const newExercise = {
                    planId: planId,
                    exerciseId: parseResult.data.exerciseId.value,
                    defaultSets: parseResult.data.defaultSets,
                    defaultReps: parseResult.data.defaultReps,
                    defaultWeight: parseResult.data.defaultWeight,
                    sortOrder: ++currentExercisesAmount,
                }
                try {
                      await db.insert(schema.workoutPlanExercises).values(newExercise)
                    setOpen(false)
                } catch (error) {
                    console.log(error)
                    alert("Error: Exercise already exists")
                }
            }
        },
        validators: {
            onChange: schema.insertWorkoutPlanExercisesSchema
        }
    })



    return (
        <TouchableWithoutFeedback >
            <View className='p-2'>
                <DialogHeader>
                    <DialogTitle
                    >Add exercise</DialogTitle>
                    <DialogDescription
                        style={{ fontFamily: "ContrailOne_400Regular" }}
                    >
                        Add an exercise to your workout plan.
                    </DialogDescription>
                </DialogHeader>
                <View className='py-3 flex flex-col'>

                    <form.Field
                        name="exerciseId"
                    >
                        {field => (
                            <View className='pb-2'>
                                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Exercise:</Label>
                                <Select
                                    value={field.state.value as Option}
                                    // @ts-ignore
                                    onValueChange={(e) => field.handleChange({ value: Number(e.value), label: e.label })}>
                                    <SelectTrigger className='w-[275px]'
                                        onPressIn={() => {
                                            Keyboard.dismiss();
                                        }}
                                    >
                                        <SelectValue
                                            className='text-foreground text-sm native:text-lg'
                                            placeholder='Select an exercise'
                                        />
                                    </SelectTrigger>
                                    <SelectContent insets={contentInsets} className='w-[275px]'>
                                        <ScrollView className='max-h-72'>
                                            <>
                                                {EXERCISES_TYPES.map(type => (
                                                    exercises.filter(exercise => exercise.type === type).length > 0 && (
                                                        <SelectGroup key={type}>
                                                            <SelectLabel
                                                                className='-ml-4 font-extrabold'
                                                            >{type}</SelectLabel>
                                                            {exercises.filter(exercise => exercise.type === type).map((exercise) => (
                                                                <SelectItem key={exercise.id} label={exercise.name} value={exercise.id.toString()}>
                                                                    {exercise.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    )
                                                ))}
                                            </>

                                        </ScrollView>
                                    </SelectContent>

                                </Select>
                                {
                                    field.state.meta.errors
                                        ? <Text className='text-red-500 mt-1'>
                                            {field.state.meta.errors[0]?.message}</Text>
                                        : null
                                }
                            </View>

                        )
                        }
                    </form.Field>

                    <Text
                        className='text-muted-foreground text-sm'
                    >Specify the number of sets, reps and weight for the exercise. This can all be changed later.</Text>

                    <View className='flex flex-row justify-around gap-3 py-4'>
                        <form.Field
                            name="defaultSets"
                        >
                            {field => (
                                <View className='flex items-center justify-center gap-2 '>
                                    <Label style={{ fontFamily: "ContrailOne_400Regular" }}
                                        nativeID={field.name}>Sets</Label>
                                    <Input
                                        value={field.state.value as string}
                                        onChangeText={(e) => {
                                            field.handleChange(Number(e))
                                            setSetsError(field.state.meta.errors[0]?.message)
                                        }}
                                        inputMode='numeric'
                                        className='w-[60px]'
                                        placeholder='4' />

                                </View>
                            )
                            }
                        </form.Field>

                        <form.Field
                            name="defaultReps"
                        >
                            {field => (
                                <View className='flex  items-center justify-center gap-2 '>
                                    <Label style={{ fontFamily: "ContrailOne_400Regular" }}
                                        nativeID={field.name}>Reps</Label>
                                    <Input
                                        value={field.state.value as string}
                                        onChangeText={(e) => {
                                            field.handleChange(Number(e))
                                            setRepsError(field.state.meta.errors[0]?.message)
                                        }}
                                        inputMode='numeric'
                                        className='w-[60px]'
                                        placeholder='12' />

                                </View>
                            )
                            }
                        </form.Field>

                        <form.Field
                            name="defaultWeight"
                        >
                            {field => (
                                <View className='flex  items-center justify-center gap-2 '>
                                    <Label style={{ fontFamily: "ContrailOne_400Regular" }}
                                        nativeID={field.name}>Weight (kg)</Label>
                                    <Input
                                        value={field.state.value as string}
                                        onChangeText={(e) => {
                                            field.handleChange(Number(e))
                                            setWeightError(field.state.meta.errors[0]?.message)
                                        }}
                                        inputMode='numeric'
                                        className='w-[60px]'
                                        placeholder='25' />

                                </View>
                            )
                            }
                        </form.Field>
                    </View>

                    {/* Centralized error display */}
                    <View className='flex  justify-around gap-1 py-2'>
                        {setsError && (
                            <Text className='text-red-500 text-sm'>
                                <Text className='font-bold'>{"Sets"}: </Text> {setsError}
                            </Text>
                        )}
                        {repsError && (
                            <Text className='text-red-500 text-sm'>
                                <Text className='font-bold'>{"Reps"}: </Text> {repsError}
                            </Text>
                        )}
                        {weightError && (
                            <Text className='text-red-500 text-sm'>
                                <Text className='font-bold'>{"Weight"}: </Text> {weightError}
                            </Text>
                        )}
                    </View>



                </View>
                <Button
                    onPressIn={() => {
                        setSetsError(form.fieldInfo.defaultSets?.instance?.state.meta.errors[0]?.message)
                        setRepsError(form.fieldInfo.defaultReps?.instance?.state.meta.errors[0]?.message)
                        setWeightError(form.fieldInfo.defaultWeight?.instance?.state.meta.errors[0]?.message)
                    }}

                    onPress={() => {
                        form.handleSubmit()
                    }}
                >
                    <Text>Save</Text>
                </Button>
            </View>
        </TouchableWithoutFeedback >
    );
}