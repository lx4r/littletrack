import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import KebabMenu from "./KebabMenu";
import { TimeEntryRow } from "./TimeEntryRow";
import { formatAsIsoDate, formatAsIsoDateTime } from "./time_formatting";
import type { TimeEntry } from "./types";

export interface Props {
	getCurrentTime: () => Date;
	// TODO: group props related to start time
	persistStartTime: (startTime: Date) => Promise<void>;
	retrievePersistedStartTime: () => Promise<Date | null>;
	removePersistedStartTime: () => Promise<void>;
	// TODO: rename prop
	manageTimeEntries: {
		persistTimeEntries: (timeEntries: TimeEntry[]) => Promise<void>;
		retrieveTimeEntries: () => Promise<TimeEntry[] | null>;
	};
	shareTimeEntries: {
		shareTimeEntry: (timeEntry: TimeEntry) => Promise<void>;
		isSharingAvailable: () => Promise<boolean>;
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

	const [isTimeEntrySharingAvailable, setIsTimeEntrySharingAvailable] =
		useState(false);

	const [isBatchDeleteModeEnabled, setIsBatchDeleteModeEnabled] =
		useState(false);

	const [
		isoDatesSelectedForBatchDeletion,
		setIsoDatesSelectedForBatchDeletion,
	] = useState<Set<string>>(new Set());

	const handleIsoDateCheckboxChange = (isoDate: string) => {
		setIsoDatesSelectedForBatchDeletion((prev) => {
			const updatedSet = new Set(prev);

			if (updatedSet.has(isoDate)) {
				updatedSet.delete(isoDate);
			} else {
				updatedSet.add(isoDate);
			}

			return updatedSet;
		});
	};

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

	useEffect(() => {
		async function loadSharingAvailability() {
			setIsTimeEntrySharingAvailable(await isSharingAvailable());
		}

		loadSharingAvailability();
	}, [isSharingAvailable]);

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
			<main className="w-full max-w-(--breakpoint-md)">
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
							<StopIcon className="h-10 w-10" aria-label="Stop" />
						) : (
							<PlayIcon className="h-10 w-10" aria-label="Start" />
						)}
					</button>
					<div className="flex items-center gap-3">
						<span className="text-lg lg:text-base">
							{startTime && formatAsIsoDateTime(startTime, timeZone)}
						</span>
						{completeTimeEntries.length > 0 && (
							<KebabMenu
								onBatchDeleteClick={() => setIsBatchDeleteModeEnabled(true)}
							/>
						)}
					</div>
				</div>

				{completeTimeEntries.length > 0 && isBatchDeleteModeEnabled && (
					<div className="mb-4">
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setIsBatchDeleteModeEnabled(false)}
								className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
							>
								Yes, delete the selected time entries
							</button>
							<button
								type="button"
								onClick={() => setIsBatchDeleteModeEnabled(false)}
								className="rounded-md bg-neutral-600 px-3 py-1 text-sm text-white hover:bg-neutral-700"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{groupTimeEntriesByDate(completeTimeEntries).map(
					({ isoDate, timeEntries }) => {
						const classesForSelectedState =
							"rounded-md border-2 border-dashed p-2 bg-neutral-900 border-red-500";
						const isSelected = isoDatesSelectedForBatchDeletion.has(isoDate);

						return (
							<section
								key={isoDate}
								className={`mb-4 ${isSelected ? classesForSelectedState : ""}`}
							>
								<div className="mb-2 flex items-center">
									{isBatchDeleteModeEnabled && (
										<label className="mr-3 flex items-center">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => handleIsoDateCheckboxChange(isoDate)}
												className="h-5 w-5"
											/>
										</label>
									)}
									<h2 className="text-lg">{isoDate}</h2>
								</div>
								<ul>
									{timeEntries.map((timeEntry) => (
										<TimeEntryRow
											key={timeEntry.id}
											timeEntry={timeEntry}
											timeZone={timeZone}
											isSharingAvailable={isTimeEntrySharingAvailable}
											onDeleteButtonClick={handleDeleteButtonClick}
											onShareButtonClick={shareTimeEntry}
										/>
									))}
								</ul>
							</section>
						);
					},
				)}
			</main>
		</div>
	);
};

export default App;
