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

	try {
		await navigator.share(testShareData);
		console.warn(
			"Web Share API is available, but sharing concrete data is not supported",
		);
		return true;
	} catch {
		console.log(
			"Web Share API is available and sharing concrete data is supported",
		)
		return false;
	}
}
