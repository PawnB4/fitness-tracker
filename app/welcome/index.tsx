import { useForm } from "@tanstack/react-form";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { Dumbbell } from "~/lib/icons/Dumbbell";

export default function Page() {
	const insets = useSafeAreaInsets();

	const form = useForm({
		onSubmit: async ({ value }: { value: schema.NewUser }) => {
			const newUser = {
				name: value.name,
			};
			try {
				await db.insert(schema.user).values({ name: newUser.name });
				router.push("/");
			} catch (error) {
				console.log(error);
				alert("Something went wrong");
			}
		},
		validators: {
			onChange: schema.insertUserSchema,
		},
	});

	return (
		<View
			className="flex-1 bg-secondary/30 px-8"
			style={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }}
		>
			{/* Header Section */}
			<View className="flex-1 items-center justify-center">
				<View className="mb-8 rounded-full bg-primary/10 p-8">
					<Dumbbell className="h-16 w-16 text-primary" />
				</View>

				<Text className="mb-4 text-center font-funnel-bold text-4xl text-foreground">
					Welcome to Fitness Tracker
				</Text>

				<Text className="max-w-sm text-center text-lg text-muted-foreground leading-relaxed">
					Your personal fitness companion. Track workouts, monitor progress, and
					achieve your fitness goals with ease.
				</Text>
			</View>

			{/* Form Section */}
			<View className="flex flex-col gap-4">
				<form.Field defaultValue={""} name="name">
					{(field) => (
						<>
							<Label nativeID={field.name}>What should we call you?</Label>
							<Input
								onChangeText={field.handleChange}
								placeholder="Enter your name"
								value={field.state.value as string}
							/>
							{field.state.meta.errors ? (
								<Text className="text-red-500">
									{field.state.meta.errors[0]?.message}
								</Text>
							) : null}
						</>
					)}
				</form.Field>

				<Button
					className="h-14 w-full shadow-foreground/10 shadow-lg"
					onPress={() => form.handleSubmit()}
				>
					<Text className="font-funnel-semibold text-lg">Get Started</Text>
				</Button>
			</View>
		</View>
	);
}
