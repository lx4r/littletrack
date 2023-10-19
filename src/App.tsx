import { useEffect, useState } from "react";
import { formatTime } from "./time_formatting";

interface TimeEntry {
  id: string;
  startTime: Date;
  stopTime: Date;
}

interface Props {
  getCurrentTime: () => Date;
  persistStartTime: (startTime: Date) => Promise<void>;
  retrievePersistedStartTime: () => Promise<Date | null>;
  removePersistedStartTime: () => Promise<void>;
}

function App({
  getCurrentTime,
  persistStartTime,
  retrievePersistedStartTime,
  removePersistedStartTime,
}: Props) {
  const [completeTimeEntries, setCompleteTimeEntries] = useState<TimeEntry[]>(
    []
  );
  const [startTime, setStartTime] = useState<Date | null>(null);
  const isTimerRunning = startTime !== null;

  useEffect(() => {
    async function loadPersistedStartTime() {
      const persistedStartTime = await retrievePersistedStartTime();

      if (persistedStartTime !== null) {
        setStartTime(persistedStartTime);
      }
    }

    loadPersistedStartTime();
  }, [retrievePersistedStartTime]);

  async function handleStartStopButtonClick() {
    const currentTime = getCurrentTime();

    if (isTimerRunning) {
      setCompleteTimeEntries([
        { id: crypto.randomUUID(), startTime, stopTime: currentTime },
        ...completeTimeEntries,
      ]);

      setStartTime(null);

      await removePersistedStartTime();
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
