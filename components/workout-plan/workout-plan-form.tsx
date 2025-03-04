
import * as React from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from '~/components/ui/button';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import { Text } from '~/components/ui/text';
import { useForm } from '@tanstack/react-form'
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { db } from '~/db/drizzle';
import * as schema from '~/db/schema';
import { Textarea } from '../ui/textarea';
import { router } from 'expo-router';

export const WorkoutPlanForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {

    const form = useForm({
        onSubmit: async ({ value }) => {
            const parseResult = await schema.insertWorkoutPlansSchema.safeParseAsync(value)
            if (!parseResult.success) {
                alert('Invalid workout plan data')
            } else {
                const newWorkoutPlan = {
                    name: parseResult.data.name,
                    description: parseResult.data.description,
                }
                try {
                    const res = await db.insert(schema.workoutPlans).values(newWorkoutPlan).returning()
                    setOpen(false)
                    router.push(`/workout-plan/${res[0].id}`)
                } catch (error) {
                    console.log(error)
                    alert("Error: Workout plan already exists")
                }
            }
        },
        validators: {
            onChange: schema.insertWorkoutPlansSchema
        }
    })

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className='p-2'>
                <DialogHeader>
                    <DialogTitle
                        className='text-xl font-bold'
                    >New workout plan</DialogTitle>
                    <DialogDescription
                        style={{ fontFamily: "ContrailOne_400Regular" }}
                    >
                        Create a new workout plan to add to your catalog. Workout plans are a collection of exercises from which you can create workouts.
                    </DialogDescription>
                </DialogHeader>
                <View className='py-3 flex flex-col'>

                    <form.Field
                        name="name"
                    >
                        {field => (
                            <>
                                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Name:</Label>
                                <Input
                                    value={field.state.value as string}
                                    onChangeText={field.handleChange}
                                    placeholder='Monday legs, Tuesday chest, etc.' />
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
                        name="description"
                    >
                        {field => (
                            <>
                                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Description:</Label>
                                <Textarea aria-labelledby='textareaLabel' value={field.state.value as string} onChangeText={field.handleChange} placeholder='(Optional) Add a description to your workout plan' />
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
                        form.handleSubmit()
                    }}
                >
                    <Text>Save</Text>
                </Button>
            </View>
        </TouchableWithoutFeedback>
    );
}