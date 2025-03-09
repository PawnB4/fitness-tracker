import { TouchableOpacity, View } from 'react-native'
import {
    Card,
    CardContent,
    CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Exercise } from '~/db/schema';
import { EXERCISES, EXERCISES_TYPES } from '~/lib/constants';
import { Trash2 } from '~/lib/icons/Trash2';
import * as schema from '~/db/schema';
import { db } from '~/db/drizzle';
import { eq, gt, sql } from 'drizzle-orm';

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
        // First, get all workout plan exercises that will be affected
        const affectedPlans = await db.select({
            planId: schema.workoutPlanExercises.planId,
            sortOrder: schema.workoutPlanExercises.sortOrder,
        })
        .from(schema.workoutPlanExercises)
        .where(eq(schema.workoutPlanExercises.exerciseId, id));

        // Group by planId to handle multiple workout plans
        const planGroups = new Map();
        affectedPlans.forEach(item => {
            if (!planGroups.has(item.planId)) {
                planGroups.set(item.planId, []);
            }
            planGroups.get(item.planId).push(item.sortOrder);
        });

        // Delete the exercise (this will cascade delete all related workout plan exercises)
        await db.delete(schema.exercises).where(eq(schema.exercises.id, id));

        // For each affected plan, update the sort order of remaining exercises
        for (const [planId, sortOrders] of planGroups.entries()) {
            // Sort the orders to process lowest first
            sortOrders.sort((a: number, b: number) => a - b);
            
            // Process each deleted sort order in sequence, adjusting for previously deleted items
            let offset = 0;
            for (const deletedSortOrder of sortOrders) {
                const adjustedSortOrder = deletedSortOrder - offset;
                
                // Update all exercises with higher sort order than the deleted one
                await db.update(schema.workoutPlanExercises)
                    .set({
                        sortOrder: sql`${schema.workoutPlanExercises.sortOrder} - 1`
                    })
                    .where(
                        sql`${schema.workoutPlanExercises.planId} = ${planId} AND ${schema.workoutPlanExercises.sortOrder} > ${adjustedSortOrder}`
                    );
                
                // Increment offset for each processed deletion
                offset++;
            }
        }
    } catch (error) {
        alert("Error deleting exercise: " + error);
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
                    <View className='w-1.5 h-6 rounded-full'
                    style={{
                        backgroundColor: type === EXERCISES_TYPES[0] ? '#16a34a' :
                            type === EXERCISES_TYPES[1] ? '#8b5cf6' :
                                type === EXERCISES_TYPES[2] ? '#eab308' :
                                    type === EXERCISES_TYPES[3] ? '#ef4444' :
                                        '#0284c7'
                    }}
                    ></View>
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

