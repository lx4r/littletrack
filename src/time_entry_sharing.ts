import { formatAsIsoDateTime } from "./time_formatting";
import type { TimeEntry } from "./types";

function shareMessageViaWebShareApi(title: string, text: string) {
	if (!navigator.share) {
		throw new Error("Web Share API not supported");
	}

	return navigator.share({
		title,
		text,
	});
}

export async function shareTimeEntry(timeEntry: TimeEntry, timeZone: string) {
	const shareTitle = "Time Entry";
	const shareText = `Start time: ${formatAsIsoDateTime(
		timeEntry.startTime,
		timeZone,
	)}\nStop time: ${formatAsIsoDateTime(timeEntry.stopTime, timeZone)}`;

	await shareMessageViaWebShareApi(shareTitle, shareText);
}

export async function isSharingAvailable() {
	const testShareData = {
		title: "Test",
		text: "Test",
	};

	if (!navigator.share || !navigator.canShare?.(testShareData)) {
		return false;
	}

	// In some browsers navigator.canShare(testShareData) returns true even though
	// navigator.share(testShareData) throws an error. Therefore, this extra check is needed.
	try {
		await navigator.share(testShareData);
		return true;
	} catch {
		return false;
	}
}
