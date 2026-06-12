import { useState } from "react";

type UseBatchDeletionResult = {
	isEnabled: boolean;
	selectedIsoDates: Set<string>;
	enable: () => void;
	cancel: () => void;
	toggleDate: (isoDate: string) => void;
};

export const useBatchDeletion = (): UseBatchDeletionResult => {
	const [isEnabled, setIsEnabled] = useState(false);
	const [selectedIsoDates, setSelectedDates] = useState<Set<string>>(new Set());

	const enable = (): void => setIsEnabled(true);

	const cancel = (): void => {
		setIsEnabled(false);
		setSelectedDates(new Set());
	};

	const toggleDate = (isoDate: string): void => {
		setSelectedDates((prevSelectedIsoDates) => {
			const newSelectedIsoDates = new Set(prevSelectedIsoDates);

			if (newSelectedIsoDates.has(isoDate)) {
				newSelectedIsoDates.delete(isoDate);
			} else {
				newSelectedIsoDates.add(isoDate);
			}

			return newSelectedIsoDates;
		});
	};

	return {
		isEnabled,
		selectedIsoDates,
		enable,
		cancel,
		toggleDate,
	};
};
