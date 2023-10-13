import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import localForage from "localforage";

// TODO: Move this somewhere else?
function persistStartTime(startTime: Date) {
  localForage.setItem("startTime", startTime.toISOString());
}

function getCurrentTime() {
  return new Date();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App getCurrentTime={getCurrentTime} persistStartTime={persistStartTime} />
  </React.StrictMode>
);
