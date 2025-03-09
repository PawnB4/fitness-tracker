
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
import { eq } from 'drizzle-orm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { NewWorkoutPlan } from '~/db/schema';

const deleteWorkoutPlan = async (planId: number) => {
    try {
        await db.delete(schema.workoutPlans).where(eq(schema.workoutPlans.id, planId))
        router.replace("/(tabs)/workout-plans")
    } catch (error) {
        console.log(error)
        alert("Error: Workout plan not found")
    }
}

export const WorkoutPlanForm = ({ setOpen, isUpdate = false, planId, currentName, currentDescription }: { setOpen: (open: boolean) => void, isUpdate?: boolean, planId?: number, currentName?: string, currentDescription?: string }) => {

    const form = useForm({
        onSubmit: async ({ value }: { value: NewWorkoutPlan }) => {
            const workoutPlan = {
                name: value.name,
                description: value.description ? value.description : null,
            }
            try {
                if (isUpdate && planId) {
                    await db.update(schema.workoutPlans).set(workoutPlan).where(eq(schema.workoutPlans.id, planId))
                    setOpen(false)
                } else {
                    const res = await db.insert(schema.workoutPlans).values(workoutPlan).returning()
                    setOpen(false)
                    router.push(`/workout-plan/${res[0].id}`)
                }
            } catch (error) {
                console.log(error)
                alert("Error: Workout plan already exists")
            }
        },
        validators: {
            onChange: schema.workoutPlansFormSchema
        }
    })

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className='p-2'>
                <DialogHeader>
                    <DialogTitle
                        className='text-xl font-bold'
                    >{isUpdate ? "Update workout plan" : "New workout plan"}</DialogTitle>
                    <DialogDescription
                        style={{ fontFamily: "ContrailOne_400Regular" }}
                    >
                        {isUpdate ? "Update your workout plan" : "Create a new workout plan to add to your catalog. Workout plans are a collection of exercises from which you can create workouts."}
                    </DialogDescription>
                </DialogHeader>
                <View className='py-3 flex flex-col'>

                    <form.Field
                        name="name"
                        defaultValue={currentName ?? ''}
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
                        defaultValue={currentDescription ?? ''}
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
                <View className='flex grow gap-2'>
                    <Button
                        onPress={() => form.handleSubmit()}>
                        <Text>{isUpdate ? "Save" : "Create"}</Text>
                    </Button>
                    {isUpdate && planId && (
                        <AlertDialog className=''>
                            <AlertDialogTrigger asChild >
                                <Button className='bg-destructive'>
                                    <Text className='text-destructive-foreground'>Delete workout plan</Text>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this workout plan? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        <Text>Cancel</Text>
                                    </AlertDialogCancel>
                                    <AlertDialogAction className='bg-destructive text-destructive-foreground'
                                        onPress={() => deleteWorkoutPlan(planId)}
                                    >
                                        <Text>Continue</Text>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}