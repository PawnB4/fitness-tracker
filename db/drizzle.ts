import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync} from "expo-sqlite";

export const fitnessTrackerDb = openDatabaseSync("fitness-tracker.db", { enableChangeListener: true });

export const db = drizzle(fitnessTrackerDb, { casing: "snake_case" });
