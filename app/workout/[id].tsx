import { useLocalSearchParams } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { eq } from 'drizzle-orm';
import { ActivityIndicator, Pressable, TouchableOpacity, ScrollView, View } from 'react-native';
import { db } from '~/db/drizzle';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Clock } from '~/lib/icons/Clock';
import { Calendar } from '~/lib/icons/Calendar';
import { Pencil } from '~/lib/icons/Pencil';
import { Trash2 } from '~/lib/icons/Trash2';
import { Dumbbell } from '~/lib/icons/Dumbbell';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { formatDate, formatTime } from '~/utils/date';
import { Triangle } from 'lucide-react-native';
import { WorkoutPlanExerciseForm } from '~/components/workout-plan/workout-plan-exercise-form';
import { DialogContent } from '~/components/ui/dialog';
import { DialogTrigger } from '~/components/ui/dialog';
import { Card } from '~/components/ui/card';
import { Dialog } from '~/components/ui/dialog';
import { CardContent } from '~/components/ui/card';
import { useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { EXERCISES_TYPES } from '~/lib/constants';
import { Separator } from '~/components/ui/separator';
import { Plus } from '~/lib/icons/Plus';
// Function to update exercise order in database - this is the direct implementation
const updateExerciseOrder = async (exerciseId: number, newOrder: number) => {
    try {
        await db.update(schema.workoutExercises)
            .set({
                sortOrder: newOrder,
            })
            .where(eq(schema.workoutExercises.id, exerciseId));
        return true;
    } catch (error) {
        alert(`Error updating exercise order: ${error}`);
        return false;
    }
};

// Function to swap the order of two exercises
const swapExerciseOrder = async (exercise1Id: number, exercise1Order: number, exercise2Id: number, exercise2Order: number) => {
    try {
        // Use a transaction to ensure both updates succeed or both fail
        await db.transaction(async (tx) => {
            // First update exercise1 to a temporary order (to avoid unique constraint issues)
            await tx.update(schema.workoutExercises)
                .set({
                    sortOrder: -1,
                })
                .where(eq(schema.workoutExercises.id, exercise1Id));

            // Update exercise2 to exercise1's old order
            await tx.update(schema.workoutExercises)
                .set({
                    sortOrder: exercise1Order,
                })
                .where(eq(schema.workoutExercises.id, exercise2Id));

            // Finally update exercise1 to exercise2's old order
            await tx.update(schema.workoutExercises)
                .set({
                    sortOrder: exercise2Order,
                })
                .where(eq(schema.workoutExercises.id, exercise1Id));
        });

        return true;
    } catch (error) {
        alert(`Error updating exercise order: ${error}`);
        return false;
    }
};

const deleteWorkoutPlanExercise = async (id: number) => {
    try {
        await db.delete(schema.workoutExercises).where(eq(schema.workoutExercises.id, id))
    } catch (error) {
        alert("Error deleting exercise")
    }
}



export default function Page() {
    const { id } = useLocalSearchParams();

    const [openAddExerciseForm, setOpenAddExerciseForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false); // Flag to prevent multiple simultaneous updates

    const { data: workoutArray, error: workoutError } = useLiveQuery(db.select().from(schema.workouts).where(eq(schema.workouts.id, Number(id))));

    // Fetch exercises for this workout
    const { data: workoutExercises, error: exercisesError } = useLiveQuery(db.select({
        workoutExerciseId: schema.workoutExercises.id,
        exerciseName: schema.exercises.name,
        exerciseType: schema.exercises.type,
        exercisePrimaryMuscleGroup: schema.exercises.primaryMuscleGroup,
        workoutExerciseSets: schema.workoutExercises.sets,
        workoutExerciseReps: schema.workoutExercises.reps,
        workoutExerciseWeight: schema.workoutExercises.weight,
        workoutExerciseSortOrder: schema.workoutExercises.sortOrder,
        workoutExerciseCompleted: schema.workoutExercises.completed,
    }).from(schema.workoutExercises).innerJoin(schema.exercises, eq(schema.workoutExercises.exerciseId, schema.exercises.id)).where(eq(schema.workoutExercises.workoutId, Number(id))).orderBy(schema.workoutExercises.sortOrder)
    );


    // Function to move an exercise up
    const moveExerciseUp = async (index: number) => {
        if (!workoutExercises || index <= 0 || isUpdating) return;

        setIsUpdating(true);

        const currentExercise = workoutExercises[index];
        const prevExercise = workoutExercises[index - 1];

        try {
            await swapExerciseOrder(
                currentExercise.workoutExerciseId,
                currentExercise.workoutExerciseSortOrder,
                prevExercise.workoutExerciseId,
                prevExercise.workoutExerciseSortOrder
            );
        } catch (error) {
            alert(`Error updating exercise order: ${error}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // Function to move an exercise down
    const moveExerciseDown = async (index: number) => {
        if (!workoutExercises || index >= workoutExercises.length - 1 || isUpdating) return;

        setIsUpdating(true);

        const currentExercise = workoutExercises[index];
        const nextExercise = workoutExercises[index + 1];

        try {
            await swapExerciseOrder(
                currentExercise.workoutExerciseId,
                currentExercise.workoutExerciseSortOrder,
                nextExercise.workoutExerciseId,
                nextExercise.workoutExerciseSortOrder
            );
        } catch (error) {
            alert(`Error updating exercise order: ${error}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // Function to handle exercise deletion with proper sort order updating
    const handleDeleteExercise = async (exerciseId: number, sortOrder: number) => {
        if (isUpdating) return;

        setIsUpdating(true);

        try {
            // First delete the exercise
            await deleteWorkoutPlanExercise(exerciseId);

            // Then update the sort order of all exercises that came after the deleted one
            if (workoutExercises) {
                const exercisesToUpdate = workoutExercises.filter(ex =>
                    ex.workoutExerciseSortOrder > sortOrder
                );

                // Update each exercise's sort order in sequence
                for (const ex of exercisesToUpdate) {
                    await updateExerciseOrder(
                        ex.workoutExerciseId,
                        ex.workoutExerciseSortOrder - 1
                    );
                }
            }
        } catch (error) {
            alert(`Error deleting exercise: ${error}`);
        } finally {
            setIsUpdating(false);
        }
    };



    if (workoutError) {
        return <Text>Error: {workoutError.message}</Text>;
    }

    if (!workoutArray || workoutArray.length === 0) {
        return (
            <View className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
                <ActivityIndicator size="large" color="##0284c7" />
            </View>
        )
    }

    const workout = workoutArray[0];

    return (
        <ScrollView className="flex-1 bg-secondary/30">
            {/* Header */}
            <View className="bg-primary p-6 rounded-b-3xl">
                <Text className="text-4xl text-primary-foreground mb-4 text-center">Workout Details</Text>
                <View className="flex-row justify-around">
                    <View className="flex-row items-center">
                        <Calendar size={18} className="mr-2 text-primary-foreground" />
                        <Text className="text-md text-primary-foreground">{workout.createdAt ? formatDate(workout.createdAt) : "No date"}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Clock size={18} className="mr-2 text-primary-foreground" />
                        <Text className="text-md text-primary-foreground">{workout.createdAt ? formatTime(workout.createdAt) : "No time"}</Text>
                    </View>
                </View>
            </View>


            {/* Stats Summary */}
            <View className="flex-row justify-between px-4 py-5 bg-card mx-4 my-4 rounded-xl shadow-sm">
                <View className="flex justify-center items-center">
                    <Text className="text-lg font-bold">{workoutExercises?.length}</Text>
                    <Text className="text-muted-foreground text-sm">Exercises</Text>
                </View>
                <View className="flex justify-center items-center">
                    <Text className="text-lg font-bold">
                        {workoutExercises?.reduce((acc, ex) => acc + ex.workoutExerciseSets, 0)}
                    </Text>
                    <Text className="text-muted-foreground text-sm">Sets</Text>
                </View>
                <View className="flex justify-center items-center">
                    <Text className="text-lg font-bold">
                        {Math.round(workoutExercises?.reduce((acc, ex) => acc + (ex.workoutExerciseCompleted ? 1 : 0), 0) / workoutExercises?.length * 100)}%
                    </Text>
                    <Text className="text-muted-foreground text-sm">Completed</Text>
                </View>
            </View>

            {/* Exercises List */}

            {/* <View className="px-4 mb-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl font-semibold">Exercises</Text>
                    <Button variant="ghost" size="sm">
                        <Text className="text-primary">Add Exercise</Text>
                    </Button>
                </View>
                <View className="bg-card rounded-xl overflow-hidden shadow-sm">
                    {workoutExercises?.map((exercise, index) => (
                        <View key={exercise.workoutExerciseId} className={`p-4 flex-row items-center justify-between ${index < workoutExercises?.length - 1 ? 'border-b border-border' : ''}`}>
                            <View className="flex-row items-center flex-1">
                                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${exercise.workoutExerciseCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <Dumbbell size={16} color={exercise.workoutExerciseCompleted ? "#22c55e" : "#9ca3af"} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-medium">{exercise.exerciseName}</Text>
                                    <Text className="text-muted-foreground text-sm">
                                        {exercise.workoutExerciseSets} sets • {exercise.workoutExerciseReps} reps {exercise.workoutExerciseWeight > 0 ? `• ${exercise.workoutExerciseWeight} lbs` : ''}
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color="#9ca3af" />
                        </View>
                    ))}
                </View>
            </View> */}

            <View className="px-4 pt-6">
                {/* Exercises Section */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-2xl font-bold">Exercises</Text>
                    </View>

                    {/* Exercise Cards */}

                    <View className="flex-1 flex flex-col gap-3">

                        {!workoutExercises || workoutExercises.length === 0 ? (
                            <View className="bg-card p-6 rounded-lg items-center">
                                <Dumbbell className="size-10 text-muted-foreground mb-4" />
                                <Text className="text-center text-muted-foreground">
                                    No exercises added to this plan yet.
                                </Text>
                                <Text className="text-center text-muted-foreground">
                                    Tap "Add Exercise" to get started!
                                </Text>
                            </View>
                        ) : (

                            workoutExercises.map((item, index) => (
                                <WorkoutExerciseListItem
                                    key={item.workoutExerciseId}
                                    workoutExerciseId={item.workoutExerciseId}
                                    exerciseName={item.exerciseName}
                                    exerciseType={item.exerciseType}
                                    exercisePrimaryMuscleGroup={item.exercisePrimaryMuscleGroup}
                                    workoutExerciseSets={item.workoutExerciseSets}
                                    workoutExerciseReps={item.workoutExerciseReps}
                                    workoutExerciseWeight={item.workoutExerciseWeight}
                                    workoutExerciseSortOrder={item.workoutExerciseSortOrder}
                                    totalExercises={workoutExercises.length}
                                    onMoveUp={() => moveExerciseUp(index)}
                                    onMoveDown={() => moveExerciseDown(index)}
                                    onDelete={() => handleDeleteExercise(item.workoutExerciseId, item.workoutExerciseSortOrder)}
                                    isUpdating={isUpdating}
                                    completed={item.workoutExerciseCompleted || false}
                                />
                            ))
                        )}


                        <Dialog
                            open={openAddExerciseForm}
                            onOpenChange={setOpenAddExerciseForm}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className='flex-row items-center justify-center gap-2 bg-sky-500/70'>
                                    <Plus className='text-primary' />
                                    <Text className='font-bold text-primary'>Add exercise</Text>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className='w-[90vw] max-w-[360px] min-w-[300px] self-center px-2'>
                                {/* <WorkoutPlanExerciseForm setOpen={setOpenAddExerciseForm} planId={Number(id)} currentExercisesAmount={planExercises?.length || 0} /> */}
                            </DialogContent>
                        </Dialog>
                    </View>
                </View>
            </View>


            {/* Notes */}
            <View className="px-4 mb-4">
                <Text className="text-xl font-semibold mb-2">Notes</Text>
                <View className="bg-card p-4 rounded-xl shadow-sm">
                    <Text className="text-muted-foreground">
                        {workout.notes || "No notes for this workout. Tap to add notes about how you felt, what went well, or improvements for next time."}
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="px-4 mb-8 flex-row justify-between">
                <Button variant="outline" className="flex-1 mr-2">
                    <Pencil size={16} className="mr-2" />
                    <Text>Edit Workout</Text>
                </Button>
                <Button variant="destructive" className="flex-1 ml-2">
                    <Trash2 size={16} className="mr-2" />
                    <Text className="text-destructive-foreground">Delete</Text>
                </Button>
            </View>
        </ScrollView>
    );
}

type WorkoutExerciseListItemProps = {
    workoutExerciseId: number;
    exerciseName: string;
    exerciseType: string;
    exercisePrimaryMuscleGroup: string | null;
    workoutExerciseSets: number;
    workoutExerciseReps: number;
    workoutExerciseWeight: number;
    workoutExerciseSortOrder: number;
    totalExercises: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    isUpdating: boolean;
    completed: boolean;
};

const WorkoutExerciseListItem = ({
    workoutExerciseId,
    exerciseName,
    exerciseType,
    exercisePrimaryMuscleGroup,
    workoutExerciseSets,
    workoutExerciseReps,
    workoutExerciseWeight,
    workoutExerciseSortOrder,
    totalExercises,
    onMoveUp,
    onMoveDown,
    onDelete,
    isUpdating,
    completed
}: WorkoutExerciseListItemProps) => {

    const [openUpdateForm, setOpenUpdateForm] = useState(false);

    return (
        <View className='flex flex-row gap-3 items-center justify-between'>
            <Dialog
                open={openUpdateForm}
                onOpenChange={setOpenUpdateForm}
                className='flex-1'
            >
                <DialogTrigger asChild>
                    <Pressable>

                        {/* <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <View className="flex-row">
                                    <View
                                        className="w-2"
                                        style={{
                                            backgroundColor: exerciseType === EXERCISES_TYPES[0] ? '#16a34a' :
                                                exerciseType === EXERCISES_TYPES[1] ? '#8b5cf6' :
                                                    exerciseType === EXERCISES_TYPES[2] ? '#eab308' :
                                                        exerciseType === EXERCISES_TYPES[3] ? '#ef4444' :
                                                            '#0284c7'
                                        }}
                                    />

                                    <View className="flex-1 p-4">
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-lg font-bold">{exerciseName}</Text>
                                            <Badge variant="outline" className="bg-muted">
                                                <Text className="text-xs">{exerciseType}</Text>
                                            </Badge>
                                        </View>

                                        <Text className="text-muted-foreground text-sm mb-2">
                                            {exercisePrimaryMuscleGroup}
                                        </Text>

                                        <Separator className="my-2" />

                                        <View className="flex-row justify-between mt-1">
                                            <View className="flex-row items-center">
                                                <Badge variant="secondary" className="mr-1">
                                                    <Text className="text-xs">{workoutExerciseSets} sets</Text>
                                                </Badge>
                                                <Badge variant="secondary" className="mr-1">
                                                    <Text className="text-xs">{workoutExerciseReps} reps</Text>
                                                </Badge>
                                                <Badge variant="secondary">
                                                    <Text className="text-xs">{workoutExerciseWeight} kg</Text>
                                                </Badge>
                                            </View>
                                            <View className="flex-row items-center">
                                                <ChevronRight className="size-5 text-muted-foreground" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </CardContent>
                        </Card> */}

                        <View key={workoutExerciseId} className={`p-4 flex-row items-center justify-between ${workoutExerciseSortOrder < totalExercises ? 'border-b border-border' : ''}`}>
                            <View className="flex-row items-center flex-1">
                                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <Dumbbell size={16} color={completed ? "#22c55e" : "#9ca3af"} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-medium">{exerciseName}</Text>
                                    <Text className="text-muted-foreground text-sm">
                                        {workoutExerciseSets} sets • {workoutExerciseReps} reps {workoutExerciseWeight > 0 ? `• ${workoutExerciseWeight} lbs` : ''}
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color="#9ca3af" />
                        </View>
                    </Pressable>
                </DialogTrigger>
                <DialogContent className='w-[90vw] max-w-[360px] min-w-[300px] self-center px-2'>
                    {/* <WorkoutPlanExerciseForm isUpdate={true} setOpen={setOpenUpdateForm} workoutPlanExerciseId={workoutPlanExerciseId} exerciseName={exerciseName} currentExercisesAmount={totalExercises} currentSets={workoutPlanExerciseDefaultSets} currentReps={workoutPlanExerciseDefaultReps} currentWeight={workoutPlanExerciseDefaultWeight} /> */}
                </DialogContent>
            </Dialog>

            <View className='flex justify-center items-center gap-2'>

                {workoutExerciseSortOrder !== 1 && (
                    <TouchableOpacity onPress={onMoveUp}
                        disabled={isUpdating}
                    >
                        <Triangle className='text-muted-foreground fill-muted-foreground' size={30} />
                    </TouchableOpacity>
                )}

                <Text
                >#{workoutExerciseSortOrder}</Text>

                {workoutExerciseSortOrder !== totalExercises && (
                    <TouchableOpacity
                        onPress={onMoveDown}
                        disabled={isUpdating}
                    >
                        <Triangle className='text-muted-foreground fill-muted-foreground rotate-180' size={30} />
                    </TouchableOpacity>
                )}

            </View>
            <View className='flex justify-center items-center gap-2'>

                <TouchableOpacity
                    className="bg-red-100 rounded-full p-1.5"
                    onPress={onDelete}
                    disabled={isUpdating}
                >
                    <Trash2 size={22} className="text-destructive" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
