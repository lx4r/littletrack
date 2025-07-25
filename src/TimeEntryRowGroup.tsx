import { TimeEntryRow } from "./TimeEntryRow";
import type { TimeEntry } from "./types";

interface Props {
	timeEntries: TimeEntry[];
	isoDate: string;
	timeZone: string;
	isTimeEntrySharingAvailable: boolean;
	onDeleteTimeEntryButtonClick: (timeEntry: TimeEntry) => void;
	shareTimeEntry: (timeEntry: TimeEntry) => Promise<void>;
}

const TimeEntryRowGroup = ({
	timeEntries,
	isoDate,
	timeZone,
	isTimeEntrySharingAvailable,
	onDeleteTimeEntryButtonClick,
	shareTimeEntry,
}: Props) => (
	<section className="mb-4">
		<h2 className="mb-2 text-lg">{isoDate}</h2>
		<ul>
			{timeEntries.map((timeEntry) => (
				<TimeEntryRow
					key={timeEntry.id}
					timeEntry={timeEntry}
					timeZone={timeZone}
					isSharingAvailable={isTimeEntrySharingAvailable}
					onDeleteButtonClick={() => onDeleteTimeEntryButtonClick(timeEntry)}
					onShareButtonClick={shareTimeEntry}
				/>
			))}
		</ul>
	</section>
);

export default TimeEntryRowGroup;
