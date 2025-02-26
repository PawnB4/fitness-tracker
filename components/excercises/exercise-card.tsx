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
        <Card className='flex-1rounded-2xl shadow'>
            <CardContent className='py-2 px-3'>
                <View className='flex flex-row justify-start items-center py-1'>
                    <CardTitle className='leading-normal'
                        style={{ fontFamily: "ContrailOne_400Regular" }}>
                        {name}
                    </CardTitle>
                    <Text className='ml-auto text-foreground/70'>
                        {type}
                    </Text>
                </View>
                <View className='h-1 bg-sky-500 rounded'></View>
                <View className='flex gap-1 py-2 '>
                    <View className='flex flex-row items-center gap-1 overflow-hidden'>
                        <Text>Primary muscle group: </Text>
                        <Text className='text-foreground/70'>{primaryMuscleGroup}</Text>
                    </View>
                    <View className='flex flex-row items-center gap-1 overflow-hidden'>
                        <Text>Secondary muscle groups: </Text>
                        <Text className='text-foreground/70'>{secondaryMuscleGroups}</Text>
                    </View>
                </View>
            </CardContent>
        </Card>
    )
}

