import { View } from 'react-native'
import { Button } from '~/components/ui/button';
import { useLiveQuery, drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { db } from '~/db/drizzle';
import { Text } from '~/components/ui/text';
import { FlashList } from "@shopify/flash-list";
import { ExerciseCard } from '~/components/excercises/exercise-card';

export default function Page() {
  const { data: exercises } = useLiveQuery(db.select().from(schema.exercises));

  return <View className='flex-1 items-stretch p-4 gap-4 bg-secondary/30'>
    <Button
      className='shadow shadow-foreground/5'
      >
      <Text>Add exercise</Text>
    </Button>
    <FlashList
      data={exercises}
      renderItem={({ item, index }) => <ExerciseCard {...item} key={index} />}
      estimatedItemSize={50}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View className='h-4' />}
    />
  </View>;
}
