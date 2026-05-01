import {
	ArchiveBoxXMarkIcon,
	PlayIcon,
	StopIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { TimeEntryRow } from "./TimeEntryRow";
import { copyTimeEntryToClipboard } from "./time_entry_clipboard";
import { groupTimeEntriesByDate } from "./time_entry_grouping";
import { formatAsIsoDate, formatAsIsoDateTime } from "./time_formatting";
import type { TimeEntry } from "./types";

export interface Props {
	getCurrentTime: () => Date;
	persistStartTime: (startTime: Date) => Promise<void>;
	retrievePersistedStartTime: () => Promise<Date | null>;
	removePersistedStartTime: () => Promise<void>;
	// TODO: rename prop
	manageTimeEntries: {
		persistTimeEntries: (timeEntries: TimeEntry[]) => Promise<void>;
		retrieveTimeEntries: () => Promise<TimeEntry[] | null>;
	};
	timeZone: string;
}

const App = ({
	getCurrentTime,
	persistStartTime,
	retrievePersistedStartTime,
	removePersistedStartTime,
	manageTimeEntries: { persistTimeEntries, retrieveTimeEntries },
	timeZone,
}: Readonly<Props>) => {
	const [completeTimeEntries, setCompleteTimeEntries] = useState<TimeEntry[]>(
		[],
	);

	const [startTime, setStartTime] = useState<Date | null>(null);

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

	const handleBatchDeleteCancelClick = () => {
		setIsBatchDeleteModeEnabled(false);
		setIsoDatesSelectedForBatchDeletion(new Set());
	};

	const handleBatchDeleteConfirmClick = async () => {
		const newTimeEntries = completeTimeEntries.filter(
			(entry) =>
				!isoDatesSelectedForBatchDeletion.has(
					formatAsIsoDate(entry.startTime, timeZone),
				),
		);

		setCompleteTimeEntries(newTimeEntries);
		await persistTimeEntries(newTimeEntries);

		setIsBatchDeleteModeEnabled(false);
		setIsoDatesSelectedForBatchDeletion(new Set());
	};

	return (
		<div className="flex h-dvh justify-center overflow-hidden p-4">
			<main className="flex h-full w-full max-w-(--breakpoint-md) flex-col">
				<div
					className={`mb-4 flex items-center ${
						isTimerRunning ? "justify-between" : ""
					}`}
				>
					<div className="flex items-center">
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
						{completeTimeEntries.length > 0 && (
							<button
								type="button"
								onClick={() => setIsBatchDeleteModeEnabled(true)}
								className="ml-2 rounded-full bg-neutral-600 p-1.5 text-neutral-200 hover:bg-neutral-700 hover:text-neutral-100"
								aria-label="Batch delete"
							>
								<ArchiveBoxXMarkIcon className="h-5 w-5" />
							</button>
						)}
					</div>
					<div className="flex items-center gap-3">
						<span className="text-lg lg:text-base">
							{startTime && formatAsIsoDateTime(startTime, timeZone)}
						</span>
					</div>
				</div>

				{completeTimeEntries.length > 0 && isBatchDeleteModeEnabled && (
					<div className="mb-4">
						<div className="flex gap-2">
							<button
								type="button"
								onClick={handleBatchDeleteConfirmClick}
								disabled={isoDatesSelectedForBatchDeletion.size === 0}
								className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
							>
								Delete entries for selected dates
							</button>
							<button
								type="button"
								onClick={handleBatchDeleteCancelClick}
								className="rounded-md bg-neutral-600 px-3 py-1 text-sm text-white hover:bg-neutral-700"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				<div className="min-h-0 flex-1 overflow-auto">
					{groupTimeEntriesByDate(completeTimeEntries, timeZone).map(
						({ isoDate, timeEntries }) => {
							const classesForSelectedState =
								"rounded-md border-2 border-dashed p-2 bg-neutral-900 border-red-500";
							const isSelected = isoDatesSelectedForBatchDeletion.has(isoDate);

							return (
								<section
									key={isoDate}
									className={`mb-4 ${isSelected ? classesForSelectedState : ""}`}
									aria-label={`Time entries for ${isoDate}`}
									aria-current={isSelected ? "true" : "false"}
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
												isDeleteEnabled={!isBatchDeleteModeEnabled}
												onDeleteButtonClick={handleDeleteButtonClick}
												onCopyButtonClick={(timeEntry) =>
													copyTimeEntryToClipboard(timeEntry, timeZone)
												}
											/>
										))}
									</ul>
								</section>
							);
						},
					)}
				</div>
			</main>
		</div>
	);
};

export default App;
