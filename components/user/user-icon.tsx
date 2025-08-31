import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { CircleUser } from "~/lib/icons/CircleUser";
import { UserForm } from "./user-form";

export function UserIcon() {
	const [openDialog, setOpenDialog] = useState(false);
	const [configObject, setConfigObject] = useState<{
		preferredTheme?: string;
		timezone?: string;
	}>({});

	const { data: userSettings } = useLiveQuery(
		db.select().from(schema.user).limit(1),
	);
	const currentUserSettings = userSettings?.[0]?.config;

	// Initialize configObject with current settings when they load
	useEffect(() => {
		if (currentUserSettings) {
			setConfigObject(currentUserSettings);
		}
	}, [currentUserSettings]);

	return (
		<Dialog
			onOpenChange={(e) => {
				setOpenDialog(e);
			}}
			open={openDialog}
		>
			<DialogTrigger asChild>
				<TouchableOpacity className="aspect-square max-h-[80%] flex-1 items-center justify-center rounded-full bg-primary/10">
					<CircleUser
						className="text-foreground"
						size={60}
						strokeWidth={1.25}
					/>
				</TouchableOpacity>
			</DialogTrigger>
			<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center p-4">
				<UserForm setOpenDialog={setOpenDialog} />
			</DialogContent>
		</Dialog>
	);
}
