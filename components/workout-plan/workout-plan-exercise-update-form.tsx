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
import { useForm, useStore } from '@tanstack/react-form'
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
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
import { eq } from 'drizzle-orm';
import { db } from '~/db/drizzle';


export const WorkoutPlanExerciseUpdateForm = ({ setOpen, workoutPlanExerciseId, exerciseName, defaultSets, defaultReps, defaultWeight }: { setOpen: (open: boolean) => void, workoutPlanExerciseId: number, exerciseName: string, defaultSets: number, defaultReps: number, defaultWeight: number }) => {

    const form = useForm({
        defaultValues: {
            defaultSets: defaultSets.toString(),
            defaultReps: defaultReps.toString(),
            defaultWeight: defaultWeight.toString(),
        },
        onSubmit: async ({value}) => {
            const updatedExercise = {
                defaultSets: Number(value.defaultSets),
                defaultReps: Number(value.defaultReps),
                defaultWeight: Number(value.defaultWeight),
            }
            try {
                await db.update(schema.workoutPlanExercises).set(updatedExercise).where(eq(schema.workoutPlanExercises.id, workoutPlanExerciseId))
                setOpen(false)
            } catch (error) {
                alert(`Error: ${error}`)
            }

        },
        validators: {
            onChange: schema.updateWorkoutPlanExercisesFormSchema
        }
    })

    const defaultSetsObject = useStore(form.store, (state) => state.fieldMeta.defaultSets)
    const defaultRepsObject = useStore(form.store, (state) => state.fieldMeta.defaultReps)
    const defaultWeightObject = useStore(form.store, (state) => state.fieldMeta.defaultWeight)

    return (
        <TouchableWithoutFeedback >
            <View className='p-2'>
                <DialogHeader>
                    <DialogTitle
                    >Update exercise</DialogTitle>
                    <DialogDescription
                        style={{ fontFamily: "ContrailOne_400Regular" }}
                    >
                        Update the exercise in your workout plan.
                    </DialogDescription>
                </DialogHeader>
                <View className='py-3 flex flex-col'>


                    <View className='pb-2'>
                        <Label style={{ fontFamily: "ContrailOne_400Regular" }} >Exercise:</Label>
                        <Select
                            value={{
                                value: exerciseName,
                                label: exerciseName
                            }}
                        >
                            <SelectTrigger className='w-[275px] opacity-50 cursor-not-allowed'>
                                <SelectValue
                                    className='text-foreground/50 text-sm native:text-lg'
                                    placeholder='Select an exercise'
                                />
                            </SelectTrigger>
                        </Select>
                    </View>

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
                                        onChangeText={field.handleChange}
                                        inputMode='numeric'
                                        className='w-[60px]'
                                        placeholder={defaultSets.toString()} />

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
                                        onChangeText={field.handleChange}
                                        inputMode='numeric'
                                        className='w-[60px]'
                                        placeholder={defaultReps.toString()} />

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
                                        onChangeText={field.handleChange}
                                        inputMode='numeric'
                                        className='w-[60px]'
                                        placeholder={defaultWeight.toString()} />

                                </View>
                            )
                            }
                        </form.Field>
                    </View>

                    {/* Centralized error display */}
                    <View className='flex  justify-around gap-1 py-2'>
                        {defaultSetsObject?.errors?.length > 0 && (
                            <Text className='text-red-500 text-sm'>
                                <Text className='font-bold'>{"Sets"}: </Text> {defaultSetsObject.errors[0]?.message}
                            </Text>
                        )}
                        {defaultRepsObject?.errors?.length > 0 && (
                            <Text className='text-red-500 text-sm'>
                                <Text className='font-bold'>{"Reps"}: </Text> {defaultRepsObject.errors[0]?.message}
                            </Text>
                        )}
                        {defaultWeightObject?.errors?.length > 0 && (
                            <Text className='text-red-500 text-sm'>
                                <Text className='font-bold'>{"Weight"}: </Text> {defaultWeightObject.errors[0]?.message}
                            </Text>
                        )}
                    </View>



                </View>
                <Button
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