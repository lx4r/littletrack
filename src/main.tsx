import localForage from "localforage";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { enablePeriodicServiceWorkerUpdates } from "./service_worker_updates.ts";
import {
	isWebShareApiAvailable,
	shareTimeEntry,
} from "./time_entry_sharing.ts";
import type { TimeEntry } from "./types.ts";

const LOCAL_FORAGE_KEY_START_TIME = "startTime";
const LOCAL_FORAGE_KEY_TIME_ENTRIES = "timeEntries";

const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

// TODO: Move these functions somewhere else?

const getCurrentTime = () => {
	return new Date();
};

const persistStartTime = async (startTime: Date) => {
	await localForage.setItem(
		LOCAL_FORAGE_KEY_START_TIME,
		startTime.toISOString(),
	);
};

const retrievePersistedStartTime = async () => {
	const startTime = await localForage.getItem<string>(
		LOCAL_FORAGE_KEY_START_TIME,
	);

	if (startTime === null) {
		return null;
	}

	return new Date(startTime);
};

const removePersistedStartTime = async () => {
	await localForage.removeItem(LOCAL_FORAGE_KEY_START_TIME);
};

const persistTimeEntries = async (timeEntries: TimeEntry[]) => {
	await localForage.setItem(LOCAL_FORAGE_KEY_TIME_ENTRIES, timeEntries);
};

const retrieveTimeEntries = async () => {
	const timeEntries = await localForage.getItem<TimeEntry[]>(
		LOCAL_FORAGE_KEY_TIME_ENTRIES,
	);

	if (timeEntries === null) {
		return null;
	}

	return timeEntries;
};

console.info("commit hash:", __COMMIT_HASH__);

enablePeriodicServiceWorkerUpdates(UPDATE_INTERVAL_MS);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<App
			getCurrentTime={getCurrentTime}
			persistStartTime={persistStartTime}
			retrievePersistedStartTime={retrievePersistedStartTime}
			removePersistedStartTime={removePersistedStartTime}
			manageTimeEntries={{ persistTimeEntries, retrieveTimeEntries }}
			shareTimeEntries={{
				shareTimeEntry,
				isSharingAvailable: isWebShareApiAvailable(),
			}}
			timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
		/>
	</React.StrictMode>,
);
