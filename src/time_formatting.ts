// The locale "sv" stands for Sweden which uses the time format YYYY-MM-DD HH:MM we want.

export function formatAsIsoTimeOfDayWithoutSeconds(
	date: Date,
	timeZone: string,
) {
	return date.toLocaleTimeString("sv", {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatAsIsoDate(date: Date, timeZone: string) {
	return date.toLocaleDateString("sv", { timeZone });
}

export function formatAsIsoDateTime(date: Date, timeZone: string) {
	return date.toLocaleString("sv", {
		dateStyle: "short",
		timeStyle: "short",
		timeZone,
	});
}
