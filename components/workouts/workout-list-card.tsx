import { router } from 'expo-router';
import { Pressable, View } from 'react-native'
import {
    Card,
    CardContent,
    CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { formatDate, formatTime } from '~/utils/date';

type WorkoutListCardProps = {
    id: number;
    name: string;
    notes: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export const WorkoutListCard = ({ id, name, notes, createdAt }: WorkoutListCardProps) => {
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
                {notes && (
                    <Text className='text-sm text-foreground/80 mt-1' numberOfLines={1}>
                        {notes}
                    </Text>
                )}
                    <View className='h-1 bg-sky-500/70 rounded mt-2'></View>
                </CardContent>
            </Card>
        </Pressable>
    )
} 