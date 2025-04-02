import { Pressable, View } from "react-native";
import { CircleUser } from "~/lib/icons/CircleUser";
import { cn } from "~/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import {
    type Option,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { eq } from "drizzle-orm";
import { Button } from "./ui/button";

export function UserButton() {
    const [openDialog, setOpenDialog] = useState(false);
    const [configObject, setConfigObject] = useState();

    const { data: userSettings } = useLiveQuery(
        db.select().from(schema.user).limit(1)
    );
    const currentUserSettings = userSettings?.[0]?.config;

    console.log(currentUserSettings);

    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    useEffect(() => {
        console.log("configObject", configObject);
    }, [configObject]);

  
    return (
        <Dialog
            open={openDialog}
            onOpenChange={(e) => {
                setOpenDialog(e);
            }}
        >
            <DialogTrigger asChild>
                <Pressable
                    className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2"
                >
                    {({ pressed }) => (
                        <View
                            className={cn(
                                "aspect-square flex-1 items-start justify-center web:px-5 pt-0.5",
                                pressed && "opacity-70",
                            )}
                        >

                            <CircleUser className="text-foreground" size={23} strokeWidth={1.25} />
                        </View>
                    )}
                </Pressable>
            </DialogTrigger>
            <DialogContent className="flex w-[90vw] min-w-[300px] max-w-[360px] flex-col justify-center gap-4 self-center p-4">
                <DialogTitle className="">User settings</DialogTitle>

                <View className="flex flex-row items-center justify-between gap-2 mt-4">
                    <Text className="font-medium">
                        Preferred color theme
                    </Text>

                    <Select
                        // @ts-ignore
                        value={currentUserSettings?.preferredTheme ?? undefined}
                        // @ts-ignore
                        onValueChange={(e) => setConfigObject({ ...configObject, preferredTheme: e?.value })}
                    >
                        <SelectTrigger className="w-[38vw]">
                            <SelectValue
                                placeholder="Select a theme"
                                className="native:text-lg text-foreground text-sm"
                            />
                        </SelectTrigger>
                        <SelectContent insets={contentInsets} className="w-[38vw]">
                            <SelectItem
                                key={1}
                                label={"Dark"}
                                value={"dark"}
                            >
                                {"Dark"}
                            </SelectItem>
                            <SelectItem
                                key={2}
                                label={"Light"}
                                value={"light"}
                            >
                                {"Light"}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </View>
                <Button onPress={() =>{}}>
					<Text>Save</Text>
				</Button>

            </DialogContent>
        </Dialog>
    );
}
