import { PlayIcon, StopIcon, XMarkIcon } from "@heroicons/react/24/solid";
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
    [],
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
      completeTimeEntries.filter(({ id: currentId }) => id !== currentId),
    );
  }

  return (
    <main className="h-screen bg-neutral-800 p-4 font-sans text-neutral-400">
      <div
        className={`mb-4 flex items-center ${
          isTimerRunning ? "justify-between" : ""
        }`}
      >
        <button
          onClick={handleStartStopButtonClick}
          className="rounded-full bg-neutral-600 p-2 text-neutral-200 shadow-md"
        >
          {isTimerRunning ? (
            <StopIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </button>
        {startTime && formatTime(startTime)}
      </div>
      {/* TODO: Use different element here? */}
      <ul>
        {completeTimeEntries.map((timeEntry) => (
          <li
            key={timeEntry.id}
            className="mb-2 flex items-center justify-between rounded-md border border-neutral-700 p-2 text-sm"
          >
            {formatTime(timeEntry.startTime)} -{" "}
            {timeEntry.stopTime ? formatTime(timeEntry.stopTime) : ""}{" "}
            {timeEntry.stopTime && (
              <button
                onClick={() => handleDeleteButtonClick(timeEntry)}
                className="rounded-full border-2 border-neutral-600 p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
