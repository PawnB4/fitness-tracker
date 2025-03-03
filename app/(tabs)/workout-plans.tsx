import { ActivityIndicator, Keyboard, Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, LayoutAnimationConfig } from 'react-native-reanimated';
import { Info } from '~/lib/icons/Info';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { Link } from 'expo-router';

import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { fitnessTrackerDb } from '~/db/drizzle';
import migrations from '~/drizzle/migrations';
import { db } from '~/db/drizzle';
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog';
import { FlashList } from '@shopify/flash-list';
import { ExerciseCard } from '~/components/exercises/exercise-card';
import { ExerciseForm } from '~/components/exercises/exercise-form';
import { useLiveQuery, drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { router } from 'expo-router';



export default function Page() {

    const { data: workoutPlans, error: workoutPlansError } = useLiveQuery(db.select().from(schema.workoutPlans));

    if ( workoutPlansError) {
        return (
            <View>
                <Text>Something went wrong</Text>
            </View>
        );
    }

    return (
        <View className='flex-1 items-stretch p-4 gap-4 bg-secondary/30'>
            <Button className='shadow shadow-foreground/5'
                onPress={async () => {
                    try {
                        const res = await db.insert(schema.workouts).values({}).returning();
                        router.push(`/workout/${res[0].id}`)
                    } catch (error) {
                        alert("Error creating workout")
                    }
                }}
            >
                <Text>New workout</Text>
            </Button>
            {/* <FlashList
        data={workouts}
        renderItem={({ item, index }) => <ExerciseCard {...item} key={index} />}
        estimatedItemSize={50}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className='h-4' />}
      /> */}
            {workoutPlans.map((plan) => (
                <Card key={plan.id}>
                    <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{} exercises</CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </View>
    );
}
