import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import {
  DEFAULT_APP_PROPS,
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

  const startTime3 = new Date("2023-01-02T05:05:05.000Z");
  const startTime3TimeOfDayMatcher = /05:05/;
  const stopTime3 = new Date("2023-01-02T06:06:06.000Z");

  const isoDateForTimeEntry1 = "2023-01-01";
  const isoDateForTimeEntries2And3 = "2023-01-02";

  const getCurrentTime = vi.fn(() => startTime1);

  render(<App {...DEFAULT_APP_PROPS} getCurrentTime={getCurrentTime} />);

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
    within(timeEntryGroup1!).queryByText(startTime3TimeOfDayMatcher),
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
    within(timeEntryGroup2!).queryByText(startTime3TimeOfDayMatcher),
  ).toBeInTheDocument();
});
