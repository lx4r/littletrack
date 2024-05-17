import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
	persistStartTime,
	persistTimeEntries,
	removePersistedStartTime,
	retrievePersistedStartTime,
	retrieveTimeEntries,
} from "./persistence.ts";
import { enablePeriodicServiceWorkerUpdates } from "./service_worker_updates.ts";
import {
	isWebShareApiAvailable,
	shareTimeEntry,
} from "./time_entry_sharing.ts";

const getCurrentTime = () => {
	return new Date();
};

console.info("commit hash:", __COMMIT_HASH__);

enablePeriodicServiceWorkerUpdates();

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
