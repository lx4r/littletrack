import {
  PlayIcon,
  ShareIcon,
  StopIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import {
  formatAsIsoDate,
  formatAsIsoDateTime,
  formatAsIsoTimeOfDayWithoutSeconds,
} from "./time_formatting";

// TODO: Move this type somewhere else?
export interface TimeEntry {
  id: string;
  startTime: Date;
  stopTime: Date;
}

export interface Props {
  getCurrentTime: () => Date;
  persistStartTime: (startTime: Date) => Promise<void>;
  retrievePersistedStartTime: () => Promise<Date | null>;
  removePersistedStartTime: () => Promise<void>;
  manageTimeEntries: {
    persistTimeEntries: (timeEntries: TimeEntry[]) => Promise<void>;
    retrieveTimeEntries: () => Promise<TimeEntry[] | null>;
  };
  shareTimeEntries: {
    // TODO: Instead pass time zone outside of component?
    shareTimeEntry: (timeEntry: TimeEntry, timeZone: string) => Promise<void>;
    isSharingAvailable: boolean;
  };
  timeZone: string;
}

// TODO: Extract components here?
function App({
  getCurrentTime,
  persistStartTime,
  retrievePersistedStartTime,
  removePersistedStartTime,
  manageTimeEntries: { persistTimeEntries, retrieveTimeEntries },
  shareTimeEntries: { shareTimeEntry, isSharingAvailable },
  timeZone,
}: Readonly<Props>) {
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

      setCompleteTimeEntries(persistedTimeEntries ?? []);
    }

    loadPersistedTimeEntries();
  }, [retrieveTimeEntries]);

  function groupTimeEntriesByDate(
    timeEntries: TimeEntry[],
  ): { isoDate: string; timeEntries: TimeEntry[] }[] {
    return timeEntries.reduce(
      (groupedTimeEntries, timeEntry) => {
        const isoDate = formatAsIsoDate(timeEntry.startTime, timeZone);

        const group = groupedTimeEntries.find(
          ({ isoDate: currentIsoDate }) => isoDate === currentIsoDate,
        );

        if (group) {
          group.timeEntries.push(timeEntry);
        } else {
          groupedTimeEntries.push({ isoDate, timeEntries: [timeEntry] });
        }

        return groupedTimeEntries;
      },
      [] as { isoDate: string; timeEntries: TimeEntry[] }[],
    );
  }

  // TODO: Split this function up?
  async function handleStartStopButtonClick() {
    const currentTime = getCurrentTime();

    if (isTimerRunning) {
      const newTimeEntries = [
        { id: self.crypto.randomUUID(), startTime, stopTime: currentTime },
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

  function formatTimeEntry(timeEntry: TimeEntry) {
    if (
      formatAsIsoDate(timeEntry.startTime, timeZone) !==
      formatAsIsoDate(timeEntry.stopTime, timeZone)
    ) {
      return `${formatAsIsoDateTime(
        timeEntry.startTime,
        timeZone,
      )} - ${formatAsIsoDateTime(timeEntry.stopTime, timeZone)}`;
    }

    return `${formatAsIsoTimeOfDayWithoutSeconds(
      timeEntry.startTime,
      timeZone,
    )} - ${formatAsIsoTimeOfDayWithoutSeconds(timeEntry.stopTime, timeZone)}`;
  }

  // TODO: move this out of component?
  async function handleDeleteButtonClick({ id }: TimeEntry) {
    const newTimeEntries = completeTimeEntries.filter(
      ({ id: currentId }) => id !== currentId,
    );

    setCompleteTimeEntries(newTimeEntries);
    await persistTimeEntries(newTimeEntries);
  }

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-screen-md">
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
              <StopIcon className="h-10 w-10" data-testid="stop-icon" />
            ) : (
              <PlayIcon className="h-10 w-10" data-testid="start-icon" />
            )}
          </button>
          <span className="text-lg lg:text-base">
            {startTime && formatAsIsoDateTime(startTime, timeZone)}
          </span>
        </div>
        {/* TODO: Use different element here? */}
        {groupTimeEntriesByDate(completeTimeEntries).map(
          ({ isoDate, timeEntries }) => (
            <section key={isoDate} className="mb-4">
              <h2 className="mb-2 text-lg">{isoDate}</h2>
              <ul>
                {timeEntries.map((timeEntry) => (
                  <li
                    key={timeEntry.id}
                    className="mb-2 flex items-center justify-between rounded-md bg-neutral-700 px-3 py-2 lg:text-sm"
                  >
                    {formatTimeEntry(timeEntry)}
                    <div>
                      {isSharingAvailable && (
                        <button
                          onClick={() => shareTimeEntry(timeEntry, timeZone)}
                          className="mr-2 rounded-full bg-neutral-500 p-1 text-neutral-200 shadow hover:bg-neutral-600 hover:text-neutral-100"
                          aria-label="Share"
                        >
                          <ShareIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteButtonClick(timeEntry)}
                        className="rounded-full bg-neutral-500 p-1 text-neutral-200 shadow hover:bg-neutral-600 hover:text-neutral-100"
                        aria-label="Delete"
                      >
                        <XMarkIcon
                          className="h-5 w-5"
                          data-testid="delete-icon"
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ),
        )}
      </main>
    </div>
  );
}

export default App;
