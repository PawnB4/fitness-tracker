import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync} from "expo-sqlite";

export const fitnessTrackerDb = openDatabaseSync("fitness-tracker.db", { enableChangeListener: true });

// Enable foreign key constraints
// fitnessTrackerDb.execAsync("PRAGMA foreign_keys = ON;");

export const db = drizzle(fitnessTrackerDb, { casing: "snake_case" });
