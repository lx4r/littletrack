import { TimeEntry } from "./App";
import { formatAsIsoDateTime } from "./time_formatting";

function shareMessageViaWebShareApi(title: string, text: string) {
  if (!navigator.share) {
    throw new Error("Web Share API not supported");
  }

  return navigator.share({
    title,
    text,
  });
}

export async function shareTimeEntry(timeEntry: TimeEntry) {
  const shareTitle = "Time Entry";
  const shareText = `Start time: ${formatAsIsoDateTime(
    timeEntry.startTime,
  )}\nStop time: ${formatAsIsoDateTime(timeEntry.stopTime)}`;

  await shareMessageViaWebShareApi(shareTitle, shareText);
}

export function isWebShareApiAvailable() {
  return Boolean(navigator.share);
}
