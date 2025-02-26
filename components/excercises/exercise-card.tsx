import { View } from 'react-native'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Exercise } from '~/db/schema';


export const ExerciseCard = ({ name, type, primaryMuscleGroup, secondaryMuscleGroups, description }: Exercise) => {
    return (
        <Card className='w-full max-w-sm p-6 rounded-2xl'>
            <CardHeader className='items-center'>
                <View className='p-3' />
                <CardTitle className='pb-2 text-center'
                >{name}</CardTitle>
                <View className='flex-row'>
                    <CardDescription className='text-base font-semibold'>{type}</CardDescription>
                </View>
            </CardHeader>
            <CardContent>
                <View className='flex-row justify-around gap-3'>
                    <Text>{description}</Text>
                </View>
            </CardContent>
            <CardFooter className='flex-col gap-3 pb-0'>
                <Text>{primaryMuscleGroup}</Text>
                <Text>{secondaryMuscleGroups}</Text>
            </CardFooter>
        </Card>
    )
}

