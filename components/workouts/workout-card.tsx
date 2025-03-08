import { View } from 'react-native'
import {
    Card,
    CardContent,
    CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { Exercise } from '~/db/schema';
import { EXERCISES } from '~/lib/constants';
import { Trash2 } from '~/lib/icons/Trash2';
import * as schema from '~/db/schema';
import { db } from '~/db/drizzle';
import { eq } from 'drizzle-orm';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~/components/ui/alert-dialog';



export const WorkoutCard = ({ id, name, type, primaryMuscleGroup }: Exercise) => {
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
                <View className='h-1 bg-sky-500/70 rounded'></View>

            </CardContent>
        </Card>
    )
}

