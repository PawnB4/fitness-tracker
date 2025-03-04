import { useLocalSearchParams } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { eq } from 'drizzle-orm';
import { ActivityIndicator, ScrollView, View, TouchableOpacity, Image, Pressable } from 'react-native';
import { db } from '~/db/drizzle';
import { Text } from '~/components/ui/text';
import { formatDate } from '~/utils/date';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/lib/icons/Calendar';
import { Pencil } from '~/lib/icons/Pencil';
import { Trash2 } from '~/lib/icons/Trash2';
import { Plus } from '~/lib/icons/Plus';
import { Triangle } from '~/lib/icons/Triangle';
import { Dumbbell } from '~/lib/icons/Dumbbell';
import { ChevronRight } from '~/lib/icons/ChevronRight';
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
export default function Page() {
    const [open, setOpen] = useState(false);

    // TODO:
    // - Add exercise to workout plan
    // - Remove exercise from workout plan
    // - Edit exercise in workout plan
    // - Reorder exercises in workout plan

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
    }).from(schema.workoutPlans).innerJoin(schema.workoutPlanExercises, eq(schema.workoutPlans.id, schema.workoutPlanExercises.planId)).innerJoin(schema.exercises, eq(schema.workoutPlanExercises.exerciseId, schema.exercises.id)).where(eq(schema.workoutPlans.id, Number(id))).orderBy(schema.workoutPlanExercises.sortOrder)
    );


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
                        <TouchableOpacity className="p-2.5 bg-primary-foreground/20 rounded-full">
                            <Pencil className="size-5 text-primary-foreground" />
                        </TouchableOpacity>
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
                            {planExercises?.length || 0} Exercises
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2  border-0">
                        <Calendar className="size-3 mr-1 text-primary-foreground" />
                        <Text className="text-sm text-primary-foreground">
                            Created {formatDate(plan.createdAt)}
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
                        <View className="flex-1 flex flex-col gap-3">
                            {planExercises.map((item, index) => (
                                <WorkoutPlanExerciseListItem
                                    key={index}
                                    workoutPlanExerciseId={item.workoutPlanExerciseId}
                                    exerciseName={item.exerciseName}
                                    exerciseType={item.exerciseType}
                                    exercisePrimaryMuscleGroup={item.exercisePrimaryMuscleGroup}
                                    workoutPlanExerciseDefaultSets={item.workoutPlanExerciseDefaultSets}
                                    workoutPlanExerciseDefaultReps={item.workoutPlanExerciseDefaultReps}
                                    workoutPlanExerciseDefaultWeight={item.workoutPlanExerciseDefaultWeight}
                                    workoutPlanExerciseSortOrder={item.workoutPlanExerciseSortOrder}
                                    totalExercises={planExercises.length}
                                />
                            ))}

                            <Dialog className=''
                                open={open}
                                onOpenChange={setOpen}
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
                                    <WorkoutPlanExerciseForm setOpen={setOpen} />
                                </DialogContent>
                            </Dialog>


                        </View>
                    )}
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
};

const WorkoutPlanExerciseListItem = ({ workoutPlanExerciseId, exerciseName, exerciseType, exercisePrimaryMuscleGroup, workoutPlanExerciseDefaultSets, workoutPlanExerciseDefaultReps, workoutPlanExerciseDefaultWeight, workoutPlanExerciseSortOrder, totalExercises }: WorkoutPlanExerciseListItemProps) => {
    return (
        <View className='flex flex-row gap-2'>
            <Pressable className='flex-1'>
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
                                    <View>
                                        <ChevronRight className="size-5 text-muted-foreground" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </CardContent>
                </Card>
            </Pressable>
            <View className='flex justify-center items-center gap-2 px-2'>
                {workoutPlanExerciseSortOrder !== 1 && (
                    <TouchableOpacity onPress={() => {
                        console.log('up')
                    }}>
                        <Triangle className='text-muted-foreground fill-muted-foreground' size={30} />
                    </TouchableOpacity>
                )}
                <Text
                >#{workoutPlanExerciseSortOrder}</Text>

                {workoutPlanExerciseSortOrder !== totalExercises && (
                    <TouchableOpacity onPress={() => {
                        console.log('down')
                    }}>
                        <Triangle className='text-muted-foreground fill-muted-foreground rotate-180' size={30} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
