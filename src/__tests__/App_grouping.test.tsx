import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import {
  formatAsIsoDate,
  formatAsIsoTimeOfDayWithoutSeconds,
} from "../time_formatting";
import {
  getStartButtonOrThrow,
  getStopButtonOrThrow,
  startTime1,
  startTime1TimeOfDayMatcher,
  startTime2,
  startTime2TimeOfDayMatcher,
  stopTime1,
  stopTime2,
} from "./App_test_helpers";

it("groups time entries by date", async () => {
  const user = userEvent.setup();

  const startTime3 = new Date(startTime2);
  startTime3.setHours(startTime2.getHours() + 1);
  const formattedStartTime3Matcher = new RegExp(
    formatAsIsoTimeOfDayWithoutSeconds(startTime3),
  );
  const stopTime3 = new Date(startTime3);
  stopTime3.setMinutes(startTime3.getMinutes() + 1);

  const isoDateForTimeEntry1 = formatAsIsoDate(startTime1);
  const isoDateForTimeEntries2And3 = formatAsIsoDate(startTime2);

  const getCurrentTime = vi.fn(() => startTime1);

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve([])),
      }}
      shareTimeEntries={{ shareTimeEntry: vi.fn(), isSharingAvailable: false }}
    />,
  );

  await user.click(getStartButtonOrThrow());
  getCurrentTime.mockReturnValueOnce(stopTime1);
  await user.click(getStopButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(startTime2);
  await user.click(getStartButtonOrThrow());
  getCurrentTime.mockReturnValueOnce(stopTime2);
  await user.click(getStopButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(startTime3);
  await user.click(getStartButtonOrThrow());
  getCurrentTime.mockReturnValueOnce(stopTime3);
  await user.click(getStopButtonOrThrow());

  const timeEntryGroup1 = screen
    .getByText(isoDateForTimeEntry1)
    .closest("section");

  expect(timeEntryGroup1).toBeInTheDocument();

  expect(
    within(timeEntryGroup1!).queryByText(startTime1TimeOfDayMatcher),
  ).toBeInTheDocument();
  expect(
    within(timeEntryGroup1!).queryByText(startTime2TimeOfDayMatcher),
  ).not.toBeInTheDocument();
  expect(
    within(timeEntryGroup1!).queryByText(formattedStartTime3Matcher),
  ).not.toBeInTheDocument();

  const timeEntryGroup2 = screen
    .getByText(isoDateForTimeEntries2And3)
    .closest("section");

  expect(timeEntryGroup2).toBeInTheDocument();

  expect(
    within(timeEntryGroup2!).queryByText(startTime1TimeOfDayMatcher),
  ).not.toBeInTheDocument();
  expect(
    within(timeEntryGroup2!).queryByText(startTime2TimeOfDayMatcher),
  ).toBeInTheDocument();
  expect(
    within(timeEntryGroup2!).queryByText(formattedStartTime3Matcher),
  ).toBeInTheDocument();
});
