import { ActivityIndicator, Pressable, View } from 'react-native';
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
import { useState } from 'react';
import { router } from 'expo-router';



export default function Page() {
  useDrizzleStudio(fitnessTrackerDb);

  const { success, error: migrationsError } = useMigrations(db, migrations);

  const { data: workouts, error: workoutsError } = useLiveQuery(db.select().from(schema.workouts));


  if (migrationsError || workoutsError) {
    return (
      <View>
        <Text>Something went wrong</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
        <ActivityIndicator size="large" color="##0284c7" />
      </View>
    );
  }

  return (
    <View className='flex-1 items-stretch p-4 gap-4 bg-secondary/30'>
      <Button 
      onPress={async () => {
        try {
          const [res] = await db.insert(schema.dateTableTest).values({}).returning();
          console.log(res.currentDateColumn);
          console.log(typeof res.currentDateColumn);
        } catch (error) {
          alert("Error creating time record")
        }
      }}
      >
        <Text>Add time record</Text>
      </Button>
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
      <FlashList
        data={workouts}
        renderItem={({ item, index }) => <ExerciseCard {...item} key={index} />}
        estimatedItemSize={50}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className='h-4' />}
      />

    </View>
  );
}
