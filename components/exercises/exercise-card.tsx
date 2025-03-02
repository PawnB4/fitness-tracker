import { View } from 'react-native'
import {
    Card,
    CardContent,
    CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Exercise } from '~/db/schema';
import { EXERCISES } from '~/lib/constants';
import { Trash2 } from '~/lib/icons/Trash2';
import * as schema from '~/db/schema';
import { db } from '~/db/drizzle';
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

const deleteExercise = async (id: number) => {
    try {
        await db.delete(schema.exercises).where(eq(schema.exercises.id, id))
    } catch (error) {
        alert("Error deleting exercise")
    }
}


export const ExerciseCard = ({ id, name, type, primaryMuscleGroup }: Exercise) => {
    return (

        <Card className='flex-1rounded-2xl shadow'>
            <CardContent className='py-2 px-3'>
                <View className='flex flex-row justify-start items-center py-1'>
                    <CardTitle className='leading-normal'
                        style={{ fontFamily: "ContrailOne_400Regular" }}>
                        {name}
                    </CardTitle>
                    <Text className='ml-auto text-foreground/70'>
                        {type}
                    </Text>
                </View>
                <View className='h-1 bg-sky-500 rounded'></View>
                <View className='flex gap-1 py-2 '>
                    <View className='flex flex-row items-center gap-1 overflow-hidden'>
                        <Text>Primary muscle group: </Text>
                        <Text className='text-foreground/70'>{primaryMuscleGroup}</Text>
                        {!EXERCISES.includes(name) && (
                            <AlertDialog className='ml-auto'>
                                <AlertDialogTrigger asChild >
                                    <Trash2 className='size-3 text-destructive/70 ' />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this exercise? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            <Text>Cancel</Text>
                                        </AlertDialogCancel>
                                        <AlertDialogAction className='bg-destructive text-destructive-foreground'
                                            onPress={() => deleteExercise(id)}
                                        >
                                            <Text>Continue</Text>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                    </View>
                </View>
            </CardContent>
        </Card>
    )
}

