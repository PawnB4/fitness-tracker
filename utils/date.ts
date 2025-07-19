export function formatDate(dateTimeString: string) {
	const dateObj = new Date(`${dateTimeString}Z`); // Interpretar como UTC

	return dateObj.toLocaleDateString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export function formatTime(dateTimeString: string) {
	const dateObj = new Date(`${dateTimeString}Z`); // Interpretar como UTC

	return dateObj.toLocaleTimeString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false, // Mantener formato 24 horas
	});
}

export const formatDurationFromSeconds = (totalSeconds: number) => {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const minutesSecondsToTotalSeconds = (
	minutes: number,
	seconds: number,
) => {
	return minutes * 60 + seconds;
};
