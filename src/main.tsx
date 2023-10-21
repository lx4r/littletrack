import localForage from "localforage";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const LOCAL_FORAGE_KEY_START_TIME = "startTime";

// TODO: Move these functions somewhere else?

function getCurrentTime() {
  return new Date();
}

// TODO: Use arrow function syntax here?
async function persistStartTime(startTime: Date) {
  await localForage.setItem(
    LOCAL_FORAGE_KEY_START_TIME,
    startTime.toISOString()
  );
}

async function retrievePersistedStartTime() {
  const startTime = await localForage.getItem<string>(
    LOCAL_FORAGE_KEY_START_TIME
  );

  if (startTime === null) {
    return null;
  }

  return new Date(startTime);
}

async function removePersistedStartTime() {
  await localForage.removeItem(LOCAL_FORAGE_KEY_START_TIME);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={persistStartTime}
      retrievePersistedStartTime={retrievePersistedStartTime}
      removePersistedStartTime={removePersistedStartTime}
    />
  </React.StrictMode>
);
