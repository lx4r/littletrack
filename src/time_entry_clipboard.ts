import { formatAsIsoDateTime } from "./time_formatting";
import type { TimeEntry } from "./types";

export async function copyTimeEntryToClipboard(
	timeEntry: TimeEntry,
	timeZone: string,
) {
	const text = `Start time: ${formatAsIsoDateTime(timeEntry.startTime, timeZone)}\nStop time: ${formatAsIsoDateTime(timeEntry.stopTime, timeZone)}`;
	await navigator.clipboard.writeText(text);
}
