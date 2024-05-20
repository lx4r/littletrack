import { ShareIcon, XMarkIcon } from "@heroicons/react/24/solid";
import {
	formatAsIsoDate,
	formatAsIsoDateTime,
	formatAsIsoTimeOfDayWithoutSeconds,
} from "./time_formatting";
import type { TimeEntry } from "./types";

const formatTimeEntry = (timeEntry: TimeEntry, timeZone: string) => {
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
};

interface Props {
	timeEntry: TimeEntry;
	timeZone: string;
	isSharingAvailable: boolean;
	onDeleteButtonClick: (timeEntry: TimeEntry) => void;
	onShareButtonClick: (timeEntry: TimeEntry) => void;
}

export const TimeEntryRow = ({
	timeEntry,
	timeZone,
	isSharingAvailable,
	onDeleteButtonClick,
	onShareButtonClick,
}: Props) => (
	<li className="mb-2 flex items-center justify-between rounded-md bg-neutral-700 px-3 py-2 lg:text-sm">
		{formatTimeEntry(timeEntry, timeZone)}
		<div>
			{isSharingAvailable && (
				<button
					type="button"
					onClick={() => onShareButtonClick(timeEntry)}
					className="mr-2 rounded-full bg-neutral-500 p-1 text-neutral-200 shadow hover:bg-neutral-600 hover:text-neutral-100"
					aria-label="Share"
				>
					<ShareIcon className="h-5 w-5" />
				</button>
			)}
			<button
				type="button"
				onClick={() => onDeleteButtonClick(timeEntry)}
				className="rounded-full bg-neutral-500 p-1 text-neutral-200 shadow hover:bg-neutral-600 hover:text-neutral-100"
				aria-label="Delete"
			>
				<XMarkIcon className="h-5 w-5" data-testid="delete-icon" />
			</button>
		</div>
	</li>
);
