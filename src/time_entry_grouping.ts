import { formatAsIsoDate } from "./time_formatting";
import type { TimeEntry } from "./types";

export const groupTimeEntriesByDate = (
	timeEntries: TimeEntry[],
	timeZone: string,
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
