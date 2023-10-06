import { useState } from "react";

interface TimeEntry {
  startTime: Date;
  stopTime: Date;
}

interface Props {
  getCurrentTime: () => Date;
}

function formatTime(date: Date) {
  // "sv" stands for Sweden which uses the time format YYYY-MM-DD HH:MM we want.
  return date.toLocaleString("sv", { dateStyle: "short", timeStyle: "short" });
}

function App({ getCurrentTime }: Props) {
  const [completeTimeEntries, setCompleteTimeEntries] = useState<TimeEntry[]>(
    []
  );
  const [startTime, setStartTime] = useState<Date | null>(null);
  const isTimerRunning = startTime !== null;

  function handleButtonClick() {
    if (isTimerRunning) {
      setCompleteTimeEntries([
        { startTime, stopTime: getCurrentTime() },
        ...completeTimeEntries,
      ]);

      setStartTime(null);
    } else {
      setStartTime(getCurrentTime());
    }
  }

  return (
    <>
      <button onClick={handleButtonClick}>
        {isTimerRunning ? "Stop" : "Start"}
      </button>
      {startTime && formatTime(startTime)}
      <ul>
        {completeTimeEntries.map((timeEntry) => (
          <li key={crypto.randomUUID()}>
            {formatTime(timeEntry.startTime)} -{" "}
            {timeEntry.stopTime ? formatTime(timeEntry.stopTime) : ""}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
