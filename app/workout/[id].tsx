import { useLocalSearchParams } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { eq } from 'drizzle-orm';
import { ActivityIndicator, ScrollView, View } from 'react-native';
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

export default function Page() {
    const { id } = useLocalSearchParams();

    const { data: workout, error: workoutError } = useLiveQuery(db.select().from(schema.workouts).where(eq(schema.workouts.id, Number(id))));

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
    console.log(workoutExercises);

    if (workoutError) {
        return <Text>Error: {workoutError.message}</Text>;
    }

    if (!workout || workout.length === 0) {
        return (
            <View className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
                <ActivityIndicator size="large" color="##0284c7" />
            </View>
        )
    }


    // Sample exercise data for UI purposes


    return (
        <ScrollView className="flex-1 bg-background">
            {/* Header */}
            <View className="bg-primary p-6 rounded-b-3xl">
                <Text className="text-4xl text-primary-foreground mb-4 text-center">Workout Details</Text>
                <View className="flex-row justify-around">
                    <View className="flex-row items-center">
                        <Calendar size={18} className="mr-2 text-primary-foreground" />
                        <Text className="text-md text-primary-foreground">{workout[0].createdAt ? formatDate(workout[0].createdAt) : "No date"}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Clock size={18} className="mr-2 text-primary-foreground" />
                        <Text className="text-md text-primary-foreground">{workout[0].createdAt ? formatTime(workout[0].createdAt) : "No time"}</Text>
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
            <View className="px-4 mb-4">
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
            </View>

            {/* Notes */}
            <View className="px-4 mb-4">
                <Text className="text-xl font-semibold mb-2">Notes</Text>
                <View className="bg-card p-4 rounded-xl shadow-sm">
                    <Text className="text-muted-foreground">
                        {workout[0].notes || "No notes for this workout. Tap to add notes about how you felt, what went well, or improvements for next time."}
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
