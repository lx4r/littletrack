import { useState } from "react";

interface TimeEntry {
  id: string;
  startTime: Date;
  stopTime: Date;
}

interface Props {
  getCurrentTime: () => Date;
  persistStartTime: (startTime: Date) => Promise<void>;
}

function formatTime(date: Date) {
  // "sv" stands for Sweden which uses the time format YYYY-MM-DD HH:MM we want.
  return date.toLocaleString("sv", { dateStyle: "short", timeStyle: "short" });
}

function App({ getCurrentTime, persistStartTime }: Props) {
  const [completeTimeEntries, setCompleteTimeEntries] = useState<TimeEntry[]>(
    []
  );
  const [startTime, setStartTime] = useState<Date | null>(null);
  const isTimerRunning = startTime !== null;

  async function handleStartStopButtonClick() {
    const currentTime = getCurrentTime();

    if (isTimerRunning) {
      setCompleteTimeEntries([
        { id: crypto.randomUUID(), startTime, stopTime: currentTime },
        ...completeTimeEntries,
      ]);

      setStartTime(null);
    } else {
      setStartTime(currentTime);

      await persistStartTime(currentTime);
    }
  }

  function handleDeleteButtonClick({ id }: TimeEntry) {
    setCompleteTimeEntries(
      completeTimeEntries.filter(({ id: currentId }) => id !== currentId)
    );
  }

  return (
    <>
      <button onClick={handleStartStopButtonClick}>
        {isTimerRunning ? "Stop" : "Start"}
      </button>
      {startTime && formatTime(startTime)}
      <ul>
        {completeTimeEntries.map((timeEntry) => (
          <li key={timeEntry.id}>
            {formatTime(timeEntry.startTime)} -{" "}
            {timeEntry.stopTime ? formatTime(timeEntry.stopTime) : ""}{" "}
            {timeEntry.stopTime && (
              <button onClick={() => handleDeleteButtonClick(timeEntry)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
