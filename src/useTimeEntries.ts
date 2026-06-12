import { useEffect, useState } from "react";
import type { TimeEntry } from "./types";

type Props = {
	persistTimeEntries: (timeEntries: TimeEntry[]) => Promise<void>;
	retrieveTimeEntries: () => Promise<TimeEntry[] | null>;
};

type UseTimeEntriesResult = {
	entries: TimeEntry[];
	add: (entry: TimeEntry) => Promise<void>;
	removeByIds: (ids: string[]) => Promise<void>;
};

export const useTimeEntries = ({
	persistTimeEntries,
	retrieveTimeEntries,
}: Props): UseTimeEntriesResult => {
	const [entries, setEntries] = useState<TimeEntry[]>([]);

	useEffect(() => {
		const load = async () => {
			const persisted = await retrieveTimeEntries();
			setEntries(persisted ?? []);
		};

		load();
	}, [retrieveTimeEntries]);

	const add = async (entry: TimeEntry): Promise<void> => {
		const newEntries = [entry, ...entries];

		setEntries(newEntries);
		await persistTimeEntries(newEntries);
	};

	const removeByIds = async (ids: string[]): Promise<void> => {
		const idSet = new Set(ids);
		const newEntries = entries.filter((e) => !idSet.has(e.id));

		setEntries(newEntries);
		await persistTimeEntries(newEntries);
	};

	return { entries, add, removeByIds };
};
