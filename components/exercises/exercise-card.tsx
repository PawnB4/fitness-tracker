import { TouchableOpacity, View } from 'react-native'
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
        <Card className='flex-1 rounded-2xl overflow-hidden border-t-2 border-sky-500/70'>
            <CardContent className='py-3 px-4 bg-gradient-to-br from-background to-background/80'>
                <View className='flex flex-row justify-start items-center py-1'>
                    <CardTitle className='leading-normal text-lg font-semibold'>
                        {name}
                    </CardTitle>
                    <View className='ml-auto px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30'>
                        <Text className='text-foreground/80 text-sm font-medium'>
                            {type}
                        </Text>
                    </View>
                </View>

                <View className='my-2 flex flex-row items-center gap-2'>
                    <View className='w-1.5 h-6 bg-sky-500/70 rounded-full'></View>
                    <View className='flex flex-row items-center flex-wrap gap-1'>
                        <Text className='font-semibold text-sm'>Primary muscle:</Text>
                        {primaryMuscleGroup && (
                            <Text className='text-foreground/80 font-medium text-sm bg-muted/50 px-2 py-0.5 rounded'>
                                {primaryMuscleGroup}
                            </Text>
                        )}
                    </View>

                    {!EXERCISES.includes(name) && (
                        <View className='ml-auto'>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <TouchableOpacity className="bg-red-100 rounded-full p-1.5">
                                        <Trash2 className='size-3 text-destructive ' />
                                    </TouchableOpacity>
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
                        </View>
                    )}
                </View>
            </CardContent>
        </Card>
    )
}

