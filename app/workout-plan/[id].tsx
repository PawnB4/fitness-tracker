import { useLocalSearchParams } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { eq } from 'drizzle-orm';
import { ActivityIndicator, ScrollView, View, TouchableOpacity, Image, Pressable } from 'react-native';
import { db } from '~/db/drizzle';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/lib/icons/Calendar';
import { Pencil } from '~/lib/icons/Pencil';
import { Trash2 } from '~/lib/icons/Trash2';
import { Plus } from '~/lib/icons/Plus';
import { Triangle } from '~/lib/icons/Triangle';
import { Dumbbell } from '~/lib/icons/Dumbbell';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { Menu } from '~/lib/icons/Menu';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '~/components/ui/dialog';
import { WorkoutPlanExerciseForm } from '~/components/workout-plan/workout-plan-exercise-form';
import { EXERCISES_TYPES } from '~/lib/constants';
import { WorkoutPlanForm } from '~/components/workout-plan/workout-plan-form';
import { formatDate } from '~/utils/date';

// Function to update exercise order in database - this is the direct implementation
const updateExerciseOrder = async (exerciseId: number, newOrder: number) => {
    try {
        await db.update(schema.workoutPlanExercises)
            .set({
                sortOrder: newOrder,
            })
            .where(eq(schema.workoutPlanExercises.id, exerciseId));
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
            await tx.update(schema.workoutPlanExercises)
                .set({
                    sortOrder: -1,
                })
                .where(eq(schema.workoutPlanExercises.id, exercise1Id));

            // Update exercise2 to exercise1's old order
            await tx.update(schema.workoutPlanExercises)
                .set({
                    sortOrder: exercise1Order,
                })
                .where(eq(schema.workoutPlanExercises.id, exercise2Id));

            // Finally update exercise1 to exercise2's old order
            await tx.update(schema.workoutPlanExercises)
                .set({
                    sortOrder: exercise2Order,
                })
                .where(eq(schema.workoutPlanExercises.id, exercise1Id));
        });

        return true;
    } catch (error) {
        alert(`Error updating exercise order: ${error}`);
        return false;
    }
};

const deleteWorkoutPlanExercise = async (id: number) => {
    try {
        await db.delete(schema.workoutPlanExercises).where(eq(schema.workoutPlanExercises.id, id))
    } catch (error) {
        alert("Error deleting exercise")
    }
}

export default function Page() {

    const [openAddExerciseForm, setOpenAddExerciseForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false); // Flag to prevent multiple simultaneous updates

  
    const { id } = useLocalSearchParams();

    const { data: workoutPlan, error: workoutError } = useLiveQuery(
        db.select().from(schema.workoutPlans).where(eq(schema.workoutPlans.id, Number(id)))
    );

    // Fetch exercises for this workout plan
    const { data: planExercises, error: exercisesError } = useLiveQuery(db.select({
        workoutPlanExerciseId: schema.workoutPlanExercises.id,
        exerciseName: schema.exercises.name,
        exerciseType: schema.exercises.type,
        exercisePrimaryMuscleGroup: schema.exercises.primaryMuscleGroup,
        workoutPlanExerciseDefaultSets: schema.workoutPlanExercises.defaultSets,
        workoutPlanExerciseDefaultReps: schema.workoutPlanExercises.defaultReps,
        workoutPlanExerciseDefaultWeight: schema.workoutPlanExercises.defaultWeight,
        workoutPlanExerciseSortOrder: schema.workoutPlanExercises.sortOrder,
    }).from(schema.workoutPlanExercises).innerJoin(schema.exercises, eq(schema.workoutPlanExercises.exerciseId, schema.exercises.id)).where(eq(schema.workoutPlanExercises.planId, Number(id))).orderBy(schema.workoutPlanExercises.sortOrder)
    );

    // Function to move an exercise up
    const moveExerciseUp = async (index: number) => {
        if (!planExercises || index <= 0 || isUpdating) return;

        setIsUpdating(true);

        const currentExercise = planExercises[index];
        const prevExercise = planExercises[index - 1];

        try {
            await swapExerciseOrder(
                currentExercise.workoutPlanExerciseId,
                currentExercise.workoutPlanExerciseSortOrder,
                prevExercise.workoutPlanExerciseId,
                prevExercise.workoutPlanExerciseSortOrder
            );
        } catch (error) {
            alert(`Error updating exercise order: ${error}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // Function to move an exercise down
    const moveExerciseDown = async (index: number) => {
        if (!planExercises || index >= planExercises.length - 1 || isUpdating) return;

        setIsUpdating(true);

        const currentExercise = planExercises[index];
        const nextExercise = planExercises[index + 1];

        try {
            await swapExerciseOrder(
                currentExercise.workoutPlanExerciseId,
                currentExercise.workoutPlanExerciseSortOrder,
                nextExercise.workoutPlanExerciseId,
                nextExercise.workoutPlanExerciseSortOrder
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
            if (planExercises) {
                const exercisesToUpdate = planExercises.filter(ex =>
                    ex.workoutPlanExerciseSortOrder > sortOrder
                );

                // Update each exercise's sort order in sequence
                for (const ex of exercisesToUpdate) {
                    await updateExerciseOrder(
                        ex.workoutPlanExerciseId,
                        ex.workoutPlanExerciseSortOrder - 1
                    );
                }
            }
        } catch (error) {
            alert(`Error deleting exercise: ${error}`);
        } finally {
            setIsUpdating(false);
        }
    };

    if (workoutError || exercisesError) {
        return <Text>Error: {workoutError?.message || exercisesError?.message}</Text>;
    }

    if (!workoutPlan || workoutPlan.length === 0) {
        return (
            <View className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
                <ActivityIndicator size="large" color="#0284c7" />
            </View>
        )
    }

    const plan = workoutPlan[0];

    return (
        <ScrollView className="flex-1 bg-secondary/30"
        >
            {/* Header Section */}
            <View className="bg-primary p-6 rounded-b-3xl shadow-md flex flex-col gap-2">
                <View className="flex-row items-center">
                    <Text className="text-4xl font-bold text-primary-foreground"
                    >{plan.name}</Text>
                    <View className="flex-row ml-auto">
                        <Dialog open={openUpdateForm} onOpenChange={setOpenUpdateForm}>
                            <DialogTrigger asChild>
                                <TouchableOpacity className="p-2.5 bg-primary-foreground/20 rounded-full">
                                    <Menu className="size-5 text-primary-foreground" />
                                </TouchableOpacity>
                            </DialogTrigger>
                            <DialogContent className='w-[90vw] max-w-[360px] min-w-[300px] self-center px-2'>
                                <WorkoutPlanForm setOpen={setOpenUpdateForm} isUpdate={true} planId={plan.id} currentName={plan.name} currentDescription={plan.description ?? undefined} />
                            </DialogContent>
                        </Dialog>
                    </View>
                </View>
                {plan.description && (
                    <Text className="text-lg text-primary-foreground/80">
                        {plan.description}
                    </Text>
                )}
                <View className='h-1 bg-sky-500/70 rounded'></View>

                <View className="flex flex-row justify-around items-center gap-2 pt-2">
                    <View className="flex-row items-center gap-2  border-0">
                        <Dumbbell className="size-3 mr-1 text-primary-foreground" />
                        <Text className="text-sm text-primary-foreground">
                            {planExercises?.length || 0} Exercise{planExercises?.length === 1 ? "" : "s"}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2  border-0">
                        <Calendar className="size-3 mr-1 text-primary-foreground" />
                        <Text className="text-sm text-primary-foreground">
                            Created {plan.createdAt ? formatDate(plan.createdAt) : "No date"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Main Content */}
            <View className="px-4 pt-6">
                {/* Exercises Section */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-2xl font-bold">Exercises</Text>
                    </View>

                    {/* Exercise Cards */}

                    <View className="flex-1 flex flex-col gap-3">

                        {!planExercises || planExercises.length === 0 ? (
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

                            planExercises.map((item, index) => (
                                <WorkoutPlanExerciseListItem
                                    key={item.workoutPlanExerciseId}
                                    workoutPlanExerciseId={item.workoutPlanExerciseId}
                                    exerciseName={item.exerciseName}
                                    exerciseType={item.exerciseType}
                                    exercisePrimaryMuscleGroup={item.exercisePrimaryMuscleGroup}
                                    workoutPlanExerciseDefaultSets={item.workoutPlanExerciseDefaultSets}
                                    workoutPlanExerciseDefaultReps={item.workoutPlanExerciseDefaultReps}
                                    workoutPlanExerciseDefaultWeight={item.workoutPlanExerciseDefaultWeight}
                                    workoutPlanExerciseSortOrder={item.workoutPlanExerciseSortOrder}
                                    totalExercises={planExercises.length}
                                    onMoveUp={() => moveExerciseUp(index)}
                                    onMoveDown={() => moveExerciseDown(index)}
                                    onDelete={() => handleDeleteExercise(item.workoutPlanExerciseId, item.workoutPlanExerciseSortOrder)}
                                    isUpdating={isUpdating}
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
                                <WorkoutPlanExerciseForm setOpen={setOpenAddExerciseForm} planId={Number(id)} currentExercisesAmount={planExercises?.length || 0} />
                            </DialogContent>
                        </Dialog>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

// Exercise list item component for plan exercises
type WorkoutPlanExerciseListItemProps = {
    workoutPlanExerciseId: number;
    exerciseName: string;
    exerciseType: string;
    exercisePrimaryMuscleGroup: string | null;
    workoutPlanExerciseDefaultSets: number;
    workoutPlanExerciseDefaultReps: number;
    workoutPlanExerciseDefaultWeight: number;
    workoutPlanExerciseSortOrder: number;
    totalExercises: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    isUpdating: boolean;
};

const WorkoutPlanExerciseListItem = ({
    workoutPlanExerciseId,
    exerciseName,
    exerciseType,
    exercisePrimaryMuscleGroup,
    workoutPlanExerciseDefaultSets,
    workoutPlanExerciseDefaultReps,
    workoutPlanExerciseDefaultWeight,
    workoutPlanExerciseSortOrder,
    totalExercises,
    onMoveUp,
    onMoveDown,
    onDelete,
    isUpdating
}: WorkoutPlanExerciseListItemProps) => {

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
                        <Card className="overflow-hidden">
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
                                                    <Text className="text-xs">{workoutPlanExerciseDefaultSets} sets</Text>
                                                </Badge>
                                                <Badge variant="secondary" className="mr-1">
                                                    <Text className="text-xs">{workoutPlanExerciseDefaultReps} reps</Text>
                                                </Badge>
                                                <Badge variant="secondary">
                                                    <Text className="text-xs">{workoutPlanExerciseDefaultWeight} kg</Text>
                                                </Badge>
                                            </View>
                                            <View className="flex-row items-center">
                                                <ChevronRight className="size-5 text-muted-foreground" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </CardContent>
                        </Card>
                    </Pressable>
                </DialogTrigger>
                <DialogContent className='w-[90vw] max-w-[360px] min-w-[300px] self-center px-2'>
                    <WorkoutPlanExerciseForm isUpdate={true} setOpen={setOpenUpdateForm} workoutPlanExerciseId={workoutPlanExerciseId} exerciseName={exerciseName} currentExercisesAmount={totalExercises} currentSets={workoutPlanExerciseDefaultSets} currentReps={workoutPlanExerciseDefaultReps} currentWeight={workoutPlanExerciseDefaultWeight} />
                </DialogContent>
            </Dialog>

            <View className='flex justify-center items-center gap-2'>

                {workoutPlanExerciseSortOrder !== 1 && (
                    <TouchableOpacity onPress={onMoveUp}
                        disabled={isUpdating}
                    >
                        <Triangle className='text-muted-foreground fill-muted-foreground' size={30} />
                    </TouchableOpacity>
                )}

                <Text
                >#{workoutPlanExerciseSortOrder}</Text>

                {workoutPlanExerciseSortOrder !== totalExercises && (
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
