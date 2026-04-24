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

console.info("commit hash:", __COMMIT_HASH__);

enablePeriodicServiceWorkerUpdates();

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<App
			getCurrentTime={() => new Date()}
			persistStartTime={persistStartTime}
			retrievePersistedStartTime={retrievePersistedStartTime}
			removePersistedStartTime={removePersistedStartTime}
			manageTimeEntries={{ persistTimeEntries, retrieveTimeEntries }}
			timeZone={timeZone}
		/>
	</React.StrictMode>,
);
