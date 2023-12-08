import localForage from "localforage";
import React from "react";
import ReactDOM from "react-dom/client";
import App, { TimeEntry } from "./App.tsx";
import "./index.css";
import { enablePeriodicServiceWorkerUpdates } from "./service_worker_updates.ts";
import {
  isWebShareApiAvailable,
  shareTimeEntry,
} from "./time_entry_sharing.ts";

const LOCAL_FORAGE_KEY_START_TIME = "startTime";
const LOCAL_FORAGE_KEY_TIME_ENTRIES = "timeEntries";

const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

// TODO: Move these functions somewhere else?

function getCurrentTime() {
  return new Date();
}

// TODO: Use arrow function syntax here?
async function persistStartTime(startTime: Date) {
  await localForage.setItem(
    LOCAL_FORAGE_KEY_START_TIME,
    startTime.toISOString(),
  );
}

async function retrievePersistedStartTime() {
  const startTime = await localForage.getItem<string>(
    LOCAL_FORAGE_KEY_START_TIME,
  );

  if (startTime === null) {
    return null;
  }

  return new Date(startTime);
}

async function removePersistedStartTime() {
  await localForage.removeItem(LOCAL_FORAGE_KEY_START_TIME);
}

async function persistTimeEntries(timeEntries: TimeEntry[]) {
  await localForage.setItem(LOCAL_FORAGE_KEY_TIME_ENTRIES, timeEntries);
}

async function retrieveTimeEntries() {
  const timeEntries = await localForage.getItem<TimeEntry[]>(
    LOCAL_FORAGE_KEY_TIME_ENTRIES,
  );

  if (timeEntries === null) {
    return null;
  }

  return timeEntries;
}

console.info("commit hash:", __COMMIT_HASH__);

enablePeriodicServiceWorkerUpdates(UPDATE_INTERVAL_MS);

ReactDOM.createRoot(document.getElementById("root")!).render(
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
