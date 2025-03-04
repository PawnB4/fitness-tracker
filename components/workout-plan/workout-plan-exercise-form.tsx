
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

export const WorkoutPlanExerciseForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {

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
            console.log(value)
            const parseResult = await schema.insertWorkoutPlanExercisesSchema.safeParseAsync(value)
            if (!parseResult.success) {
                alert('Invalid exercise data')
            } else {
                const newExercise = {

                }
                try {
                    //   await db.insert(schema.workoutPlanExercises).values(newExercise)
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                            <>
                                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Exercise:</Label>
                                <Select
                                    value={field.state.value as Option}
                                    onValueChange={field.handleChange}>
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
                                        ? <Text className='text-red-500 '>{field.state.meta.errors[0]?.message}</Text>
                                        : null
                                }
                            </>
                        )
                        }
                    </form.Field>
                    <Text>Specify the number of sets, reps and weight for the exercise. This can all be changed later.</Text>
                    <form.Field
                        name="defaultSets"
                    >
                        {field => (
                            <>
                                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Sets:</Label>
                                <Input
                                    value={field.state.value as string}
                                    onChangeText={field.handleChange}
                                    inputMode='numeric'
                                    placeholder='4' />
                                {
                                    field.state.meta.errors
                                        ? <Text className='text-red-500'>{field.state.meta.errors[0]?.message}</Text>
                                        : null
                                }
                            </>
                        )
                        }
                    </form.Field>

                    <form.Field
                        name="defaultReps"
                    >
                        {field => (
                            <>
                                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Reps:</Label>
                                <Input
                                    value={field.state.value as string}
                                    onChangeText={field.handleChange}
                                    inputMode='numeric'
                                    placeholder='12' />
                                {
                                    field.state.meta.errors
                                        ? <Text className='text-red-500'>{field.state.meta.errors[0]?.message}</Text>
                                        : null
                                }
                            </>
                        )
                        }
                    </form.Field>

                    <form.Field
                        name="defaultWeight"
                    >
                        {field => (
                            <>
                                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Weight:</Label>
                                <Input
                                    value={field.state.value as string}
                                    onChangeText={field.handleChange}
                                    inputMode='numeric'
                                    placeholder='25' />
                                {
                                    field.state.meta.errors
                                        ? <Text className='text-red-500'>{field.state.meta.errors[0]?.message}</Text>
                                        : null
                                }
                            </>
                        )
                        }
                    </form.Field>


                </View>
                <Button
                    onPress={async () => {
                        console.log(form.state.values)
                        form.handleSubmit()
                    }}
                >
                    <Text>Save</Text>
                </Button>
            </View>
        </TouchableWithoutFeedback >
    );
}