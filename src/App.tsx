import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { TimeEntryRow } from "./TimeEntryRow";
import { formatAsIsoDate, formatAsIsoDateTime } from "./time_formatting";
import type { TimeEntry } from "./types";

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
		shareTimeEntry: (timeEntry: TimeEntry) => Promise<void>;
		isSharingAvailable: boolean;
	};
	timeZone: string;
}

const App = ({
	getCurrentTime,
	persistStartTime,
	retrievePersistedStartTime,
	removePersistedStartTime,
	manageTimeEntries: { persistTimeEntries, retrieveTimeEntries },
	shareTimeEntries: { shareTimeEntry, isSharingAvailable },
	timeZone,
}: Readonly<Props>) => {
	const [completeTimeEntries, setCompleteTimeEntries] = useState<TimeEntry[]>(
		[],
	);

	const [startTime, setStartTime] = useState<Date | null>(null);

	const isTimerRunning = startTime !== null;

	useEffect(() => {
		const loadPersistedStartTime = async () => {
			const persistedStartTime = await retrievePersistedStartTime();

			if (persistedStartTime !== null) {
				setStartTime(persistedStartTime);
			}
		};

		loadPersistedStartTime();
	}, [retrievePersistedStartTime]);

	useEffect(() => {
		const loadPersistedTimeEntries = async () => {
			const persistedTimeEntries = await retrieveTimeEntries();

			setCompleteTimeEntries(persistedTimeEntries ?? []);
		};

		loadPersistedTimeEntries();
	}, [retrieveTimeEntries]);

	const groupTimeEntriesByDate = (
		timeEntries: TimeEntry[],
	): { isoDate: string; timeEntries: TimeEntry[] }[] => {
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
	};

	const handleStartStopButtonClick = async () => {
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
	};

	const handleDeleteButtonClick = async ({ id }: TimeEntry) => {
		const newTimeEntries = completeTimeEntries.filter(
			({ id: currentId }) => id !== currentId,
		);

		setCompleteTimeEntries(newTimeEntries);
		await persistTimeEntries(newTimeEntries);
	};

	return (
		<div className="flex justify-center">
			<main className="w-full max-w-screen-md">
				<div
					className={`mb-4 flex items-center ${
						isTimerRunning ? "justify-between" : ""
					}`}
				>
					<button
						type="button"
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
				{groupTimeEntriesByDate(completeTimeEntries).map(
					({ isoDate, timeEntries }) => (
						<section key={isoDate} className="mb-4">
							<h2 className="mb-2 text-lg">{isoDate}</h2>
							<ul>
								{timeEntries.map((timeEntry) => (
									<TimeEntryRow
										key={timeEntry.id}
										timeEntry={timeEntry}
										timeZone={timeZone}
										isSharingAvailable={isSharingAvailable}
										onDeleteButtonClick={handleDeleteButtonClick}
										onShareButtonClick={shareTimeEntry}
									/>
								))}
							</ul>
						</section>
					),
				)}
			</main>
		</div>
	);
};

export default App;
