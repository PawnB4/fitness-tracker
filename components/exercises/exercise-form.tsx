
import * as React from 'react';
import { Keyboard, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
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
import { Textarea } from '../ui/textarea';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXERCISES_TYPES, MUSCLE_GROUPS } from '~/lib/constants';
import { Option } from '@rn-primitives/select';

export const ExerciseForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const form = useForm({
    onSubmit: async ({ value }) => {
      const parseResult = await schema.insertExercisesSchema.safeParseAsync(value)
      if (!parseResult.success) {
        alert('Invalid exercise data')
      } else {
        const newExercise = {
          name: parseResult.data.name,
          type: parseResult.data.type.value,
          primaryMuscleGroup: parseResult.data.primaryMuscleGroup?.value,
        }
        try {
          await db.insert(schema.exercises).values(newExercise)
          setOpen(false)
        } catch (error) {
          console.log(error)
          alert("Error: Exercise already exists")
        }
      }
    },
    validators: {
      onChange: schema.insertExercisesSchema
    }
  })

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
        <View className='py-3 flex flex-col'>
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
            defaultValue={{ value: EXERCISES_TYPES[0], label: EXERCISES_TYPES[0] }}
            name="type"
          >
            {field => (
              <>
                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Type:</Label>
                <Select
                  value={field.state.value as Option}
                  onValueChange={field.handleChange}>
                  <SelectTrigger className='w-[250px]'
                    onPressIn={() => {
                      Keyboard.dismiss();
                    }}
                  >
                    <SelectValue
                      className='text-foreground text-sm native:text-lg'
                      placeholder='Select the type of exercise'
                    />
                  </SelectTrigger>
                  <SelectContent insets={contentInsets} className='w-[250px]'>
                    {EXERCISES_TYPES.map((type) => (
                      <SelectItem key={type} label={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {
                  field.state.meta.errors
                    ? <Text className='text-red-500 '>{field.state.meta.errors[0]?.message}</Text>
                    : null
                }
              </>
            )
            }
          </form.Field>

          <form.Field
            name="primaryMuscleGroup"
          >
            {field => (
              <>
                <Label style={{ fontFamily: "ContrailOne_400Regular" }} nativeID={field.name}>Primary muscle group:</Label>

                <Select
                  value={field.state.value as Option}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className='w-[250px]'
                    onPressIn={() => {
                      Keyboard.dismiss();
                    }}
                  >
                    <SelectValue
                      className='text-foreground text-sm native:text-lg'
                      placeholder='Select muscle group'
                    />
                  </SelectTrigger>

                  <SelectContent insets={contentInsets} className='w-[250px]'>
                    <ScrollView className='max-h-56'>
                      {MUSCLE_GROUPS.map((muscleGroup) => (
                        <SelectItem key={muscleGroup} label={muscleGroup} value={muscleGroup}>
                          {muscleGroup}
                        </SelectItem>
                      ))}
                    </ScrollView>
                  </SelectContent>

                </Select>
                {
                  field.state.meta.errors
                    ? <Text className='text-red-500'>{field.state.meta.errors[0]?.message}</Text>
                    : null
                }
              </>
            )
            }
          </form.Field>

          {/* <form.Field
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
        </form.Field> */}

        </View>
        <Button
          onPress={async () => {
            form.handleSubmit()
          }}
        >
          <Text>Save</Text>
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
}