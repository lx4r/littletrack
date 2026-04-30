import {
	CheckIcon,
	ClipboardIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
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

const COPY_BUTTON_PROPS = {
	idle: {
		label: "Copy",
		className:
			"mr-2 rounded-full bg-neutral-500 p-1 text-neutral-200 shadow-sm hover:bg-neutral-600 hover:text-neutral-100",
		Icon: ClipboardIcon,
	},
	success: {
		label: "Copied",
		className: "mr-2 rounded-full bg-green-600 p-1 text-white shadow-sm",
		Icon: CheckIcon,
	},
	error: {
		label: "Copy failed",
		className: "mr-2 rounded-full bg-red-600 p-1 text-white shadow-sm",
		Icon: XMarkIcon,
	},
};

interface Props {
	timeEntry: TimeEntry;
	timeZone: string;
	isDeleteEnabled: boolean;
	onDeleteButtonClick: (timeEntry: TimeEntry) => void;
	onCopyButtonClick: (timeEntry: TimeEntry) => Promise<void>;
}

export function TimeEntryRow({
	timeEntry,
	timeZone,
	isDeleteEnabled,
	onDeleteButtonClick,
	onCopyButtonClick,
}: Props) {
	const [copyState, setCopyState] = useState<"idle" | "success" | "error">(
		"idle",
	);
	const [deleteState, setDeleteState] = useState<
		"idle" | "waiting_for_confirmation"
	>("idle");

	const handleCopyClick = async () => {
		try {
			await onCopyButtonClick(timeEntry);
			setCopyState("success");
		} catch {
			setCopyState("error");
		}
		setTimeout(() => setCopyState("idle"), 2000);
	};

	const handleDeleteClick = () => {
		if (deleteState === "idle") {
			setDeleteState("waiting_for_confirmation");
			setTimeout(() => setDeleteState("idle"), 3000);
		} else {
			onDeleteButtonClick(timeEntry);
		}
	};

	const {
		label: copyButtonLabel,
		className: copyButtonClassName,
		Icon: CopyButtonIcon,
	} = COPY_BUTTON_PROPS[copyState];

	return (
		<li className="mb-2 flex items-center justify-between rounded-md bg-neutral-700 px-3 py-2 lg:text-sm">
			{formatTimeEntry(timeEntry, timeZone)}
			<div className="flex items-center">
				<button
					type="button"
					onClick={handleCopyClick}
					className={copyButtonClassName}
					aria-label={copyButtonLabel}
				>
					<CopyButtonIcon className="h-5 w-5" />
				</button>
				<button
					type="button"
					onClick={handleDeleteClick}
					disabled={!isDeleteEnabled}
					className={
						deleteState === "waiting_for_confirmation"
							? "inline-flex items-center rounded-full bg-red-600 p-1 text-neutral-200 text-sm shadow-sm hover:bg-red-700 hover:text-white disabled:opacity-50"
							: "rounded-full bg-neutral-500 p-1 text-neutral-200 shadow-sm hover:bg-neutral-600 hover:text-neutral-100 disabled:opacity-50"
					}
					aria-label={
						deleteState === "waiting_for_confirmation"
							? "Confirm delete"
							: "Delete time entry"
					}
				>
					{deleteState === "waiting_for_confirmation" ? (
						"Confirm delete"
					) : (
						<TrashIcon className="h-5 w-5" />
					)}
				</button>
			</div>
		</li>
	);
}
