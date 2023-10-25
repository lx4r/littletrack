import { PlayIcon, StopIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { formatTime } from "./time_formatting";

// TODO: Move this type somewhere else?
export interface TimeEntry {
  id: string;
  startTime: Date;
  stopTime: Date;
}

// TODO: Lower number of props by directly importing dependencies or using context?
interface Props {
  getCurrentTime: () => Date;
  persistStartTime: (startTime: Date) => Promise<void>;
  retrievePersistedStartTime: () => Promise<Date | null>;
  removePersistedStartTime: () => Promise<void>;
  manageTimeEntries: {
    persistTimeEntries: (timeEntries: TimeEntry[]) => Promise<void>;
    // TODO: Return null instead of empty array?
    retrieveTimeEntries: () => Promise<TimeEntry[]>;
  };
}

function App({
  getCurrentTime,
  persistStartTime,
  retrievePersistedStartTime,
  removePersistedStartTime,
  manageTimeEntries: { persistTimeEntries, retrieveTimeEntries },
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

  useEffect(() => {
    async function loadPersistedTimeEntries() {
      const persistedTimeEntries = await retrieveTimeEntries();

      setCompleteTimeEntries(persistedTimeEntries);
    }

    loadPersistedTimeEntries();
  }, [retrieveTimeEntries]);

  // TODO: Split this function up?
  async function handleStartStopButtonClick() {
    const currentTime = getCurrentTime();

    if (isTimerRunning) {
      const newTimeEntries = [
        { id: crypto.randomUUID(), startTime, stopTime: currentTime },
        ...completeTimeEntries,
      ];

      setCompleteTimeEntries(newTimeEntries);
      await persistTimeEntries(newTimeEntries);

      setStartTime(null);
      await removePersistedStartTime();
    } else {
      setStartTime(currentTime);

      await persistStartTime(currentTime);
    }
  }

  async function handleDeleteButtonClick({ id }: TimeEntry) {
    const newTimeEntries = completeTimeEntries.filter(
      ({ id: currentId }) => id !== currentId,
    );

    setCompleteTimeEntries(newTimeEntries);
    await persistTimeEntries(newTimeEntries);
  }

  return (
    <main className="container">
      <div
        className={`mb-4 flex items-center ${
          isTimerRunning ? "justify-between" : ""
        }`}
      >
        <button
          onClick={handleStartStopButtonClick}
          className="rounded-full bg-neutral-600 p-2 text-neutral-200 shadow-md hover:bg-neutral-700 hover:text-neutral-100"
        >
          {isTimerRunning ? (
            <StopIcon className="h-6 w-6" data-testid="stop-icon" />
          ) : (
            <PlayIcon className="h-6 w-6" data-testid="start-icon" />
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
                className="rounded-full border-2 border-neutral-600 p-1 hover:bg-neutral-600 hover:text-neutral-200"
              >
                <XMarkIcon className="h-4 w-4" data-testid="delete-icon" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
