import { STORAGE_KEY_TIME_ENTRIES } from "../persistence.ts";
import type { TimeEntry } from "../types.ts";

const makeEntry = (
	id: number,
	{
		daysAgo,
		startHour,
		durationMinutes,
	}: { daysAgo: number; startHour: number; durationMinutes: number },
): TimeEntry => {
	const startTime = new Date();
	startTime.setDate(startTime.getDate() - daysAgo);
	startTime.setHours(startHour, 0, 0, 0);

	const stopTime = new Date(startTime.getTime() + durationMinutes * 60_000);

	return { id: String(id), startTime, stopTime };
};

// Newest first, matching the order the app itself persists entries
const entries: TimeEntry[] = [
	makeEntry(4, { daysAgo: 0, startHour: 9, durationMinutes: 60 }),
	makeEntry(3, { daysAgo: 1, startHour: 10, durationMinutes: 120 }),
	makeEntry(2, { daysAgo: 2, startHour: 13, durationMinutes: 45 }),
	makeEntry(1, { daysAgo: 2, startHour: 9, durationMinutes: 90 }),
];

console.log(`localStorage.setItem('${STORAGE_KEY_TIME_ENTRIES}', ${JSON.stringify(JSON.stringify(entries))});
location.reload();`);
