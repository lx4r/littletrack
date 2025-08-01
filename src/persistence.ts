import type { TimeEntry } from "./types.ts";

export const STORAGE_KEY_START_TIME = "littletrack_start_time";
export const STORAGE_KEY_TIME_ENTRIES = "littletrack_time_entries";

export const persistStartTime = async (startTime: Date) => {
	localStorage.setItem(STORAGE_KEY_START_TIME, startTime.toISOString());
};

export const retrievePersistedStartTime = async () => {
	const startTime = localStorage.getItem(STORAGE_KEY_START_TIME);

	if (startTime === null) {
		return null;
	}

	return new Date(startTime);
};

export const removePersistedStartTime = async () => {
	localStorage.removeItem(STORAGE_KEY_START_TIME);
};

export const persistTimeEntries = async (timeEntries: TimeEntry[]) => {
	localStorage.setItem(STORAGE_KEY_TIME_ENTRIES, JSON.stringify(timeEntries));
};

export const retrieveTimeEntries = async () => {
	const timeEntriesJson = localStorage.getItem(STORAGE_KEY_TIME_ENTRIES);

	if (timeEntriesJson === null) {
		return null;
	}

	try {
		const rawTimeEntries = JSON.parse(timeEntriesJson);

		if (!Array.isArray(rawTimeEntries)) {
			console.error("Time entries data is not an array");
			return null;
		}

		return rawTimeEntries.map(
			(entry: {
				id: string;
				startTime: string;
				stopTime: string;
			}): TimeEntry => ({
				id: entry.id,
				startTime: new Date(entry.startTime),
				stopTime: new Date(entry.stopTime),
			}),
		);
	} catch (error) {
		console.error("Failed to parse time entries from localStorage:", error);
		return null;
	}
};
