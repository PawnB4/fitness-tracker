import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

export const fitnessTrackerDb = openDatabaseSync("fitness-tracker-2.db");

export const db = drizzle(fitnessTrackerDb, { casing: "snake_case" });
