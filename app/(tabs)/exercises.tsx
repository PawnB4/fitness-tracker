import { View } from 'react-native'
import { Button } from '~/components/ui/button';
import { useLiveQuery, drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { db } from '~/db/drizzle';
import { Text } from '~/components/ui/text';
import { FlashList } from "@shopify/flash-list";
import { ExerciseCard } from '~/components/exercises/exercise-card';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '~/components/ui/dialog';
import { ExerciseForm } from '~/components/exercises/exercise-form';

export default function Page() {
  const { data: exercises } = useLiveQuery(db.select().from(schema.exercises));

  return (
    <Dialog className='flex-1 items-stretch p-4 gap-4 bg-secondary/30'>
      <DialogTrigger asChild>
        <Button className='shadow shadow-foreground/5'>
          <Text>Add exercise</Text>
        </Button>
      </DialogTrigger>
      <FlashList
        data={exercises}
        renderItem={({ item, index }) => <ExerciseCard {...item} key={index} />}
        estimatedItemSize={50}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className='h-4' />}
      />
      <DialogContent className='max-w-[360px] px-2'>
        <ExerciseForm />
      </DialogContent>
    </Dialog>
  );
}
