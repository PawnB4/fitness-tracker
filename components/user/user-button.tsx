import { useState } from "react";
import { Pressable, View } from "react-native";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { CircleUser } from "~/lib/icons/CircleUser";
import { cn } from "~/lib/utils";
import { UserForm } from "./user-form";

export function UserButton() {
	const [openDialog, setOpenDialog] = useState(false);

	return (
		<Dialog
			onOpenChange={(e) => {
				setOpenDialog(e);
			}}
			open={openDialog}
		>
			<DialogTrigger asChild>
				<Pressable className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2">
					{({ pressed }) => (
						<View
							className={cn(
								"aspect-square flex-1 items-start justify-center web:px-5 pt-0.5",
								pressed && "opacity-70",
							)}
						>
							<CircleUser
								className="text-foreground"
								size={23}
								strokeWidth={1.25}
							/>
						</View>
					)}
				</Pressable>
			</DialogTrigger>
			<DialogContent className="w-[90vw] min-w-[300px] max-w-[360px] self-center p-4">
				<UserForm openDialog={openDialog} setOpenDialog={setOpenDialog} />
			</DialogContent>
		</Dialog>
	);
}
