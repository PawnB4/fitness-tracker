
import * as React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Text } from '~/components/ui/text';
import { formOptions, useForm } from '@tanstack/react-form'
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { db } from '~/db/drizzle';
import * as schema from '~/db/schema';
import { useEffect } from 'react';
import { Textarea } from '../ui/textarea';


const createExercise = async (newExercise: schema.NewExercise) => {
  const result = await db.insert(schema.exercises).values(newExercise).returning()
  return result[0]
}

export const ExerciseForm = () => {
  const form = useForm({
    onSubmit: async ({ value }) => {
      console.log("onSubmit invoked")
      console.log(value)
    },
    validators: {
      onChange: schema.insertExercisesSchema
    },
  })

  return (
    <View className='p-2'>
      <DialogHeader>
        <DialogTitle
          style={{ fontFamily: "ContrailOne_400Regular" }}
        >New exercise</DialogTitle>
        <DialogDescription
          style={{ fontFamily: "ContrailOne_400Regular" }}
        >
          Create a new exercise to add to your workout.
        </DialogDescription>
      </DialogHeader>
      <View className='py-3 flex flex-col gap-2'>
        <form.Field
          name="name"
        >
          {field => (
            <>
              <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Name:</Label>
              <Input
                value={field.state.value as string}
                onChangeText={field.handleChange}
                placeholder='Pushups' />
              {
                field.state.meta.errors
                  ? <Text className='text-red-500'>{field.state.meta.errors[0]?.message}</Text>
                  : null
              }
            </>
          )
          }
        </form.Field>
        <form.Field
          name="type"
        >
          {field => (
            <>
              <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Type:</Label>
              <Input
                value={field.state.value as string}
                onChangeText={field.handleChange}
                placeholder='Pushups' />
              {
                field.state.meta.errors
                  ? <Text className='text-red-500'>{field.state.meta.errors[0]?.message}</Text>
                  : null
              }
            </>
          )
          }
        </form.Field>
        <form.Field
          name="description"
        >
          {field => (
            <>
              <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Description:</Label>
              <Textarea aria-labelledby='textareaLabel' value={field.state.value as string} onChangeText={field.handleChange} placeholder='Pushups are a great exercise for the chest and triceps' />
              {
                field.state.meta.errors
                  ? <Text className='text-red-500'>{field.state.meta.errors[0]?.message}</Text>
                  : null
              }
            </>
          )
          }
        </form.Field>


      </View>
      <Button
        onPress={async () => {
          console.log("SUBMITTING FORM")
          console.log(form.state.values)
          const result = await createExercise(form.state.values)
          console.log(result)
        }}
      >
        <Text>Save</Text>
      </Button>
    </View>
  );
}