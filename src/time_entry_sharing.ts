import { TimeEntry } from "./App";
import { formatAsIsoDateTime } from "./time_formatting";
import { shareMessage } from "./web_share_api";

export async function shareTimeEntry(timeEntry: TimeEntry) {
  const shareTitle = "Time Entry";
  const shareText = `Start time: ${formatAsIsoDateTime(
    timeEntry.startTime,
  )}\nStop time: ${formatAsIsoDateTime(timeEntry.stopTime)}`;

  await shareMessage(shareTitle, shareText);
}
