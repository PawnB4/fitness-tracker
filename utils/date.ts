import { db } from "~/db/drizzle";
import * as schema from "~/db/schema";

// Function to get the user's preferred timezone or use default
async function getUserTimezone(): Promise<string> {
	try {
		const userSettings = await db.select().from(schema.user).limit(1);
		const userTimezone = userSettings?.[0]?.config?.timezone;
		return userTimezone || "America/Argentina/Buenos_Aires"; // Default to Buenos Aires if no timezone set
	} catch (error) {
		console.error("Error getting user timezone:", error);
		return "America/Argentina/Buenos_Aires"; // Fallback to default
	}
}

// Sync version with a provided timezone
export function formatDateWithTimezone(dateTimeString: string, timezone?: string) {
	const dateObj = new Date(`${dateTimeString}Z`); // Interpret as UTC
	const tz = timezone || "America/Argentina/Buenos_Aires";

	return dateObj.toLocaleDateString("es-AR", {
		timeZone: tz,
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

// Sync version with a provided timezone
export function formatTimeWithTimezone(dateTimeString: string, timezone?: string) {
	const dateObj = new Date(`${dateTimeString}Z`); // Interpret as UTC
	const tz = timezone || "America/Argentina/Buenos_Aires";

	return dateObj.toLocaleTimeString("es-AR", {
		timeZone: tz,
		hour: "2-digit",
		minute: "2-digit",
		hour12: false, // Keep 24 hour format
	});
}

// Original functions that now use the user's timezone from DB (async)
export async function formatDate(dateTimeString: string) {
	const timezone = await getUserTimezone();
	return formatDateWithTimezone(dateTimeString, timezone);
}

export async function formatTime(dateTimeString: string) {
	const timezone = await getUserTimezone();
	return formatTimeWithTimezone(dateTimeString, timezone);
}

// Non-async versions that maintain backward compatibility
export function formatDateSync(dateTimeString: string) {
	return formatDateWithTimezone(dateTimeString);
}

export function formatTimeSync(dateTimeString: string) {
	return formatTimeWithTimezone(dateTimeString);
}
