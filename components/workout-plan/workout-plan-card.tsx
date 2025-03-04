import { Pressable, View } from 'react-native'
import {
    Card,
    CardContent,
    CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { WorkoutPlan } from '~/db/schema';
import * as schema from '~/db/schema';
import { db } from '~/db/drizzle';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link, router } from 'expo-router';

export const WorkoutPlanCard = ({ id, name, description }: WorkoutPlan) => {

    const { data: workoutPlanExercises, error: workoutPlanExercisesError } = useLiveQuery(db.select().from(schema.workoutPlanExercises).where(eq(schema.workoutPlanExercises.planId, id)));

    if (workoutPlanExercisesError) {
        return <Text>Error: {workoutPlanExercisesError.message}</Text>;
    }

    return (
        <Pressable onPress={() => router.push(`/workout-plan/${id}`)}>
            <Card className='flex-1 rounded-2xl shadow'>
                <CardContent className='py-4 px-3'>
                    <View className='flex flex-row justify-around items-center'>
                        <CardTitle className='leading-normal'
                            style={{ fontFamily: "ContrailOne_400Regular" }}>
                            {name}
                        </CardTitle>
                        <Text className=' text-foreground/70'>
                            {workoutPlanExercises?.length} {workoutPlanExercises?.length === 1 ? "exercise" : "exercises"}
                        </Text>
                    </View>
                </CardContent>
            </Card>
        </Pressable>
    )
}

