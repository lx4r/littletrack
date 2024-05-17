import localForage from "localforage";
import type { TimeEntry } from "./types.ts";

const LOCAL_FORAGE_KEY_START_TIME = "startTime";
const LOCAL_FORAGE_KEY_TIME_ENTRIES = "timeEntries";

export const persistStartTime = async (startTime: Date) => {
	await localForage.setItem(
		LOCAL_FORAGE_KEY_START_TIME,
		startTime.toISOString(),
	);
};

export const retrievePersistedStartTime = async () => {
	const startTime = await localForage.getItem<string>(
		LOCAL_FORAGE_KEY_START_TIME,
	);

	if (startTime === null) {
		return null;
	}

	return new Date(startTime);
};

export const removePersistedStartTime = async () => {
	await localForage.removeItem(LOCAL_FORAGE_KEY_START_TIME);
};

export const persistTimeEntries = async (timeEntries: TimeEntry[]) => {
	await localForage.setItem(LOCAL_FORAGE_KEY_TIME_ENTRIES, timeEntries);
};

export const retrieveTimeEntries = async () => {
	const timeEntries = await localForage.getItem<TimeEntry[]>(
		LOCAL_FORAGE_KEY_TIME_ENTRIES,
	);

	if (timeEntries === null) {
		return null;
	}

	return timeEntries;
};
