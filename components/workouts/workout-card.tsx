import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import type { Workout } from "~/db/schema";
import { formatTime } from "~/utils/date";
import { formatDate } from "~/utils/date";

export const WorkoutCard = ({ id, name, createdAt }: Workout) => {
	return (
		<Pressable onPress={() => router.push(`/workout/${id}`)}>
			<Card className="flex-1 rounded-2xl shadow">
				<CardContent className="px-3 py-2">
					<View className="flex flex-row items-center justify-between py-1">
						<CardTitle
							className="text-base leading-normal"
							style={{ fontFamily: "ContrailOne_400Regular" }}
						>
							{name || "Workout"}
						</CardTitle>
						{createdAt && (
							<Text className="text-foreground/70 text-sm">
								{formatDate(createdAt)} {formatTime(createdAt)}
							</Text>
						)}
					</View>
					<View className="mt-2 h-1 rounded bg-sky-500/70" />
				</CardContent>
			</Card>
		</Pressable>
	);
};
