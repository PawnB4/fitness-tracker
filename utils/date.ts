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