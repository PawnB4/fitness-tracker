import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

export const fitnessTrackerDb = openDatabaseSync(
	"fitness-tracker-production.db",
	{
		enableChangeListener: true,
	},
);

fitnessTrackerDb.execAsync("PRAGMA foreign_keys = ON;");

fitnessTrackerDb.execAsync("PRAGMA journal_mode = WAL;");

export const db = drizzle(fitnessTrackerDb, { casing: "snake_case" });
