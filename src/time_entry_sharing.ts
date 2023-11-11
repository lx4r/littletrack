import { TimeEntry } from "./App";
import { formatAsLocalIsoDateTime } from "./time_formatting";

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
  const shareText = `Start time: ${formatAsLocalIsoDateTime(
    timeEntry.startTime,
    timeZone,
  )}\nStop time: ${formatAsLocalIsoDateTime(timeEntry.stopTime, timeZone)}`;

  await shareMessageViaWebShareApi(shareTitle, shareText);
}

export function isWebShareApiAvailable() {
  return Boolean(navigator.share);
}
