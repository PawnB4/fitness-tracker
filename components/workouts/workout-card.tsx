import { Pressable, View } from 'react-native'
import {
    Card,
    CardContent,
    CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Workout } from '~/db/schema';
import { formatTime } from '~/utils/date';
import { formatDate } from '~/utils/date';
import { router } from 'expo-router';


export const WorkoutCard = ({ id, name, createdAt }: Workout) => {
    return (
        <Pressable onPress={() => router.push(`/workout/${id}`)}>
        <Card className='flex-1 rounded-2xl shadow'>
            <CardContent className='py-2 px-3'>
                <View className='flex flex-row justify-between items-center py-1'>
                <CardTitle className='leading-normal text-base'
                    style={{ fontFamily: "ContrailOne_400Regular" }}>
                    {name || "Workout"}
                </CardTitle>
                {createdAt && (
                    <Text className='text-foreground/70 text-sm'>
                        {formatDate(createdAt)} {formatTime(createdAt)}
                    </Text>
                )}
            </View>
                <View className='h-1 bg-sky-500/70 rounded mt-2'></View>
            </CardContent>
        </Card>
    </Pressable>
    )
}

