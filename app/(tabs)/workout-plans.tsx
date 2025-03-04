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
import { WorkoutPlanCard } from '~/components/workout-plan/workout-plan-card';
import { WorkoutPlanForm } from '~/components/workout-plan/workout-plan-form';
import { useState } from 'react';

export default function Page() {

    const [open, setOpen] = useState(false);
    const { data: workoutPlans, error: workoutPlansError } = useLiveQuery(db.select().from(schema.workoutPlans));

    if (workoutPlansError) {
        return (
            <View>
                <Text>Something went wrong</Text>
            </View>
        );
    }

    if (!workoutPlans) {
        return (
            <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size="large" color="##0284c7" />
            </View>
        );
    }

    if (workoutPlans.length === 0) {
        return (
            <View className='flex-1 justify-center items-center'>
                <Text>No workout plans found</Text>
            </View>
        );
    }

    return (
        <Dialog className='flex-1 items-stretch p-4 gap-4 bg-secondary/30'
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger asChild>
                <Button className='shadow shadow-foreground/5'>
                    <Text>Add a workout plan</Text>
                </Button>
            </DialogTrigger>
            <FlashList
                data={workoutPlans}
                renderItem={({ item, index }) => <WorkoutPlanCard {...item} key={index} />}
                estimatedItemSize={50}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className='h-4' />}
            />
            <DialogContent className='w-[90vw] max-w-[360px] min-w-[300px] self-center px-2'>
                <WorkoutPlanForm setOpen={setOpen} />
            </DialogContent>
        </Dialog>

    );
}
