import { useEffect, useState } from "react";

type Props = {
	persistStartTime: (startTime: Date) => Promise<void>;
	retrievePersistedStartTime: () => Promise<Date | null>;
	removePersistedStartTime: () => Promise<void>;
};

type UseTimerResult = {
	startTime: Date | null;
	start: (time: Date) => Promise<void>;
	stop: () => Promise<void>;
};

export const useTimer = ({
	persistStartTime,
	retrievePersistedStartTime,
	removePersistedStartTime,
}: Props): UseTimerResult => {
	const [startTime, setStartTime] = useState<Date | null>(null);

	useEffect(() => {
		const load = async () => {
			const persisted = await retrievePersistedStartTime();

			if (persisted !== null) {
				setStartTime(persisted);
			}
		};

		load();
	}, [retrievePersistedStartTime]);

	const start = async (time: Date): Promise<void> => {
		setStartTime(time);
		await persistStartTime(time);
	};

	const stop = async (): Promise<void> => {
		setStartTime(null);
		await removePersistedStartTime();
	};

	return { startTime, start, stop };
};
