import { useForm } from "@tanstack/react-form";
import { getLocales } from "expo-localization";
import { router } from "expo-router";
import { I18n } from "i18n-js";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { Dumbbell } from "~/lib/icons/Dumbbell";
import { Languages } from "~/lib/icons/Languages";

const i18n = new I18n({
	en: {
		title: "Welcome to Fitness Tracker",
		subtitle:
			"Your personal fitness companion. Track workouts, monitor progress, and achieve your fitness goals with ease.",
		formName: "What should we call you?",
		formNamePlaceholder: "Enter your name",
		formWeeklyTarget: "How many workouts do you want to do per week?",
		formWeeklyTargetPlaceholder: "Enter your weekly target",
		beginButton: "Get Started",
	},
	es: {
		title: "Bienvenido/a a Fitness Tracker",
		subtitle:
			"Tu compañero de fitness personal. Registrá tus entrenamientos, seguí tu progreso y alcanzá tus objetivos de fitness con facilidad.",
		formName: "¿Cómo querés que te llamemos?",
		formNamePlaceholder: "Ingresá tu nombre",
		formWeeklyTarget: "¿Cuántos entrenamientos querés hacer por semana?",
		formWeeklyTargetPlaceholder: "Ingresá tu objetivo semanal",
		beginButton: "Empezar",
	},
});

export default function Page() {
	const deviceLanguage = getLocales()[0].languageCode;
	const [locale, setLocale] = useState(deviceLanguage ?? "en");
	i18n.locale = locale;

	const swapLanguage = () => {
		const newLocale = locale === "en" ? "es" : "en";
		setLocale(newLocale);
	};

	const form = useForm({
		onSubmit: async ({ value }: { value: schema.NewUser }) => {
			const newUser = {
				name: value.name,
				weeklyTarget: value.weeklyTarget,
				locale: locale,
			};
			try {
				await db.insert(schema.user).values({
					name: newUser.name,
					weeklyTarget: Number(newUser.weeklyTarget),
					locale: newUser.locale,
				});
				router.push("/");
			} catch (error) {
				console.log(error);
				alert(`Something went wrong: ${error}`);
			}
		},
		validators: {
			onChange: schema.insertUserSchema,
		},
	});

	return (
		<View className="flex flex-1 flex-col justify-around bg-secondary/30 px-8">
			<Pressable
				className="absolute top-0 right-0 flex flex-row items-center justify-center gap-2 p-8"
				onPress={swapLanguage}
			>
				<Languages className="h-10 w-10 text-primary" />
				<Text className="font-funnel-semibold text-lg">
					{locale.toUpperCase()}
				</Text>
			</Pressable>
			{/* Header Section */}
			<View className=" items-center justify-center">
				<View className="mb-8 rounded-full bg-primary/10 p-8">
					<Dumbbell className="h-16 w-16 text-primary" />
				</View>

				<Text className="mb-4 text-center font-funnel-bold text-4xl text-foreground">
					{i18n.t("title")}
				</Text>

				<Text className="max-w-sm text-center text-lg text-muted-foreground leading-relaxed">
					{i18n.t("subtitle")}
				</Text>
			</View>

			{/* Form Section */}
			<View className="flex flex-col gap-2">
				<form.Field defaultValue={""} name="name">
					{(field) => (
						<>
							<Label nativeID={field.name}>{i18n.t("formName")}</Label>
							<Input
								onChangeText={field.handleChange}
								placeholder={i18n.t("formNamePlaceholder")}
								value={field.state.value}
							/>
							{field.state.meta.errors ? (
								<Text className="text-red-500">
									{field.state.meta.errors[0]?.message}
								</Text>
							) : null}
						</>
					)}
				</form.Field>

				<form.Field defaultValue={""} name="weeklyTarget">
					{(field) => (
						<>
							<Label nativeID={field.name}>{i18n.t("formWeeklyTarget")}</Label>
							<Input
								inputMode="numeric"
								onChangeText={field.handleChange}
								placeholder={i18n.t("formWeeklyTargetPlaceholder")}
								value={field.state.value}
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
					onPress={form.handleSubmit}
				>
					<Text className="font-funnel-semibold text-lg">
						{i18n.t("beginButton")}
					</Text>
				</Button>
			</View>
		</View>
	);
}
