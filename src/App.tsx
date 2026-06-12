import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { HeaderMenu } from "./HeaderMenu";
import { TimeEntryRow } from "./TimeEntryRow";
import { copyTimeEntryToClipboard } from "./time_entry_clipboard";
import { groupTimeEntriesByDate } from "./time_entry_grouping";
import { formatAsIsoDate, formatAsIsoDateTime } from "./time_formatting";
import type { TimeEntry } from "./types";
import { useBatchDeletion } from "./useBatchDeletion";
import { useTheme } from "./useTheme";
import { useTimeEntries } from "./useTimeEntries";
import { useTimer } from "./useTimer";

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
	const { startTime, start, stop } = useTimer({
		persistStartTime,
		retrievePersistedStartTime,
		removePersistedStartTime,
	});

	const { entries, add, removeByIds } = useTimeEntries({
		persistTimeEntries,
		retrieveTimeEntries,
	});

	const {
		isEnabled: isBatchDeleteModeEnabled,
		selectedIsoDates: isoDatesSelectedForBatchDeletion,
		enable: enableBatchDelete,
		cancel: cancelBatchDelete,
		toggleDate,
	} = useBatchDeletion();

	const { preference, setPreference } = useTheme();

	const isTimerRunning = startTime !== null;

	const handleStartStopButtonClick = async () => {
		if (isTimerRunning) {
			await add({
				id: self.crypto.randomUUID(),
				startTime,
				stopTime: getCurrentTime(),
			});
			await stop();
		} else {
			await start(getCurrentTime());
		}
	};

	const handleDeleteButtonClick = async ({ id }: TimeEntry) => {
		await removeByIds([id]);
	};

	const handleBatchDeleteConfirmClick = async () => {
		const idsToDelete = entries
			.filter((e) =>
				isoDatesSelectedForBatchDeletion.has(
					formatAsIsoDate(e.startTime, timeZone),
				),
			)
			.map((e) => e.id);
		await removeByIds(idsToDelete);
		cancelBatchDelete();
	};

	return (
		<main className="mx-auto flex h-dvh w-full max-w-(--breakpoint-md) flex-col overflow-hidden p-4">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center">
					<button
						type="button"
						onClick={handleStartStopButtonClick}
						className="rounded-full bg-neutral-600 p-2 text-white shadow-md hover:bg-neutral-700 dark:bg-neutral-400 dark:text-neutral-800 dark:shadow-none dark:hover:bg-neutral-300"
					>
						{isTimerRunning ? (
							<StopIcon className="h-10 w-10" aria-label="Stop" />
						) : (
							<PlayIcon className="h-10 w-10" aria-label="Start" />
						)}
					</button>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-lg lg:text-base">
						{startTime && formatAsIsoDateTime(startTime, timeZone)}
					</span>
					<HeaderMenu
						preference={preference}
						setPreference={setPreference}
						hasTimeEntries={entries.length > 0}
						onBatchDeleteClick={enableBatchDelete}
					/>
				</div>
			</div>

			{entries.length > 0 && isBatchDeleteModeEnabled && (
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
							onClick={cancelBatchDelete}
							className="rounded-md bg-neutral-600 px-3 py-1 text-sm text-white hover:bg-neutral-700 dark:bg-neutral-400 dark:text-neutral-800 dark:hover:bg-neutral-300"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			<div className="min-h-0 flex-1 overflow-auto">
				{entries.length === 0 ? (
					<p className="mt-8 text-center text-neutral-400 dark:text-neutral-500">
						Tap the play button to start tracking time
					</p>
				) : (
					groupTimeEntriesByDate(entries, timeZone).map(
						({ isoDate, timeEntries }) => {
							const classesForSelectedState =
								"rounded-md border-2 border-dashed p-2 bg-neutral-50 border-red-500 dark:bg-neutral-900";
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
													onChange={() => toggleDate(isoDate)}
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
					)
				)}
			</div>
		</main>
	);
};

export default App;
