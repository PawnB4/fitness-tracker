import { Pressable, View,ScrollView } from "react-native";
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

// Common timezones with GMT offsets
const TIMEZONES = [
    { label: "GMT-12:00", value: "Etc/GMT+12" },
    { label: "GMT-11:00", value: "Etc/GMT+11" },
    { label: "GMT-10:00", value: "Etc/GMT+10" },
    { label: "GMT-09:00", value: "Etc/GMT+9" },
    { label: "GMT-08:00", value: "Etc/GMT+8" },
    { label: "GMT-07:00", value: "Etc/GMT+7" },
    { label: "GMT-06:00", value: "Etc/GMT+6" },
    { label: "GMT-05:00", value: "Etc/GMT+5" },
    { label: "GMT-04:00", value: "Etc/GMT+4" },
    { label: "GMT-03:00", value: "America/Argentina/Buenos_Aires" },
    { label: "GMT-02:00", value: "Etc/GMT+2" },
    { label: "GMT-01:00", value: "Etc/GMT+1" },
    { label: "GMT+00:00", value: "Etc/GMT+0" },
    { label: "GMT+01:00", value: "Etc/GMT-1" },
    { label: "GMT+02:00", value: "Etc/GMT-2" },
    { label: "GMT+03:00", value: "Etc/GMT-3" },
    { label: "GMT+04:00", value: "Etc/GMT-4" },
    { label: "GMT+05:00", value: "Etc/GMT-5" },
    { label: "GMT+05:30", value: "Asia/Kolkata" },
    { label: "GMT+06:00", value: "Etc/GMT-6" },
    { label: "GMT+07:00", value: "Etc/GMT-7" },
    { label: "GMT+08:00", value: "Etc/GMT-8" },
    { label: "GMT+09:00", value: "Etc/GMT-9" },
    { label: "GMT+10:00", value: "Etc/GMT-10" },
    { label: "GMT+11:00", value: "Etc/GMT-11" },
    { label: "GMT+12:00", value: "Etc/GMT-12" },
];

export function UserButton() {
    const [openDialog, setOpenDialog] = useState(false);
    const [configObject, setConfigObject] = useState<{ preferredTheme?: string, timezone?: string }>({});

    const { data: userSettings } = useLiveQuery(
        db.select().from(schema.user).limit(1)
    );
    const currentUserSettings = userSettings?.[0]?.config;

    // Initialize configObject with current settings when they load
    useEffect(() => {
        if (currentUserSettings) {
            setConfigObject(currentUserSettings);
        }
    }, [currentUserSettings]);

    useEffect(() => {
        console.log("configObject", configObject)
    }, [configObject])

    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    const saveConfiguration = async () => {
        try {
            await db.update(schema.user).set({
                config: configObject
            });
            setOpenDialog(false);
        } catch (error) {
            console.log(error);
        }
    }

    // Find timezone label
    const getTimezoneLabel = (timezoneValue?: string) => {
        if (!timezoneValue) return "";
        const timezone = TIMEZONES.find(tz => tz.value === timezoneValue);
        return timezone?.label || timezoneValue;
    };

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

                <View className="flex flex-row items-center gap-2 justify-between mt-4">
                    <Text className="font-medium">
                        Preferred color theme
                    </Text>

                    <Select
                        value={{
                            // @ts-ignore
                            value: configObject?.
                                preferredTheme, label: configObject?.
                                    preferredTheme === "dark" ? "Dark" : "Light"
                        }}
                        // @ts-ignore
                        onValueChange={(e) => setConfigObject({
                            ...
                            configObject, preferredTheme: e?.value
                        })}
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
                                label="Dark"
                                value="dark"
                            >
                                Dark
                            </SelectItem>
                            <SelectItem
                                key={2}
                                label="Light"
                                value="light"
                            >
                                Light
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </View>

                <View className="flex flex-row items-center gap-2 justify-between mt-4">
                    <Text className="font-medium">
                        Timezone
                    </Text>

                    <Select
                        value={{
                            // @ts-ignore
                            value: configObject?.timezone,
                            label: getTimezoneLabel(configObject?.timezone)
                        }}
                        // @ts-ignore
                        onValueChange={(e) => setConfigObject({
                            ...
                            configObject, timezone: e?.value
                        })}
                    >
                        <SelectTrigger className="w-[38vw]">
                            <SelectValue
                                placeholder="Select a timezone"
                                className="native:text-lg text-foreground text-sm"
                            />
                        </SelectTrigger>
                        <SelectContent insets={contentInsets} className="w-[38vw]">
										<ScrollView className="max-h-56">

                            {TIMEZONES.map((tz) => (
                                <SelectItem
                                    key={tz.value}
                                    label={tz.label}
                                    value={tz.value}
                                >
                                    {tz.label}
                                        </SelectItem>
                                    ))}
                                </ScrollView>
                            </SelectContent>
                        </Select>
                    </View>

                <Button onPress={() => saveConfiguration()}>
                    <Text>Save</Text>
                </Button>

            </DialogContent>
        </Dialog>
    );
}
