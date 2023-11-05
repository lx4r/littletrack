import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import { shareTimeEntry } from "../time_entry_sharing";
import { formatAsIsoDateTime } from "../time_formatting";
import * as webShareApi from "../web_share_api";
import {
  startTime1,
  startTime1TimeOfDayMatcher,
  startTime2,
  startTime2TimeOfDayMatcher,
  stopTime1,
  stopTime2,
} from "./App_test_helpers";

it("allows for sharing a time entry if the Web Share API is available", async () => {
  const user = userEvent.setup();

  const isSharingAvailable = true;

  const timeEntry1 = {
    id: "time-entry-1",
    startTime: startTime1,
    stopTime: stopTime1,
  };
  const timeEntry2 = {
    id: "time-entry-2",
    startTime: startTime2,
    stopTime: stopTime2,
  };
  const timeEntries = [timeEntry2, timeEntry1];

  // TODO: Mock on global level instead here?
  // TODO: Also mock localforage in persistence test in a similar way?
  const shareMessageSpy = vi
    .spyOn(webShareApi, "shareMessage")
    .mockImplementation(() => Promise.resolve());

  render(
    <App
      getCurrentTime={vi.fn()}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve(timeEntries)),
      }}
      shareTimeEntries={{
        shareTimeEntry: shareTimeEntry,
        isSharingAvailable,
      }}
    />,
  );

  expect(
    await screen.findByText(startTime1TimeOfDayMatcher),
  ).toBeInTheDocument();

  const timeEntry1Row = screen.getByText(startTime1TimeOfDayMatcher);
  const timeEntry1ShareButton = within(timeEntry1Row).getByLabelText(/share/i);

  expect(timeEntry1ShareButton).toBeInTheDocument();

  await user.click(timeEntry1ShareButton);

  expect(shareMessageSpy).toHaveBeenCalledTimes(1);
  const [sharedTitle1, sharedText1] = shareMessageSpy.mock.calls[0];
  expect(sharedTitle1).toMatch(/time entry/i);
  expect(sharedText1).toMatch(new RegExp(formatAsIsoDateTime(startTime1)));
  expect(sharedText1).toMatch(new RegExp(formatAsIsoDateTime(stopTime1)));

  const timeEntry2Row = screen.getByText(startTime2TimeOfDayMatcher);
  const timeEntry2ShareButton = within(timeEntry2Row).getByLabelText(/share/i);

  expect(timeEntry2ShareButton).toBeInTheDocument();

  await user.click(timeEntry2ShareButton);

  expect(shareMessageSpy).toHaveBeenCalledTimes(2);
  const [sharedTitle2, sharedText2] = shareMessageSpy.mock.calls[1];
  expect(sharedTitle2).toMatch(/time entry/i);
  expect(sharedText2).toMatch(new RegExp(formatAsIsoDateTime(startTime2)));
  expect(sharedText2).toMatch(new RegExp(formatAsIsoDateTime(stopTime2)));
});

it("doesn't show sharing button is Web Share API is not available", async () => {
  const isSharingAvailable = false;

  const timeEntry = {
    id: "time-entry-1",
    startTime: startTime1,
    stopTime: stopTime1,
  };

  render(
    <App
      getCurrentTime={vi.fn()}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve([timeEntry])),
      }}
      shareTimeEntries={{
        shareTimeEntry: vi.fn(),
        isSharingAvailable,
      }}
    />,
  );

  expect(
    await screen.findByText(startTime1TimeOfDayMatcher),
  ).toBeInTheDocument();

  const timeEntryRow = screen.getByText(startTime1TimeOfDayMatcher);
  const timeEntryShareButton = within(timeEntryRow).queryByLabelText(/share/i);

  expect(timeEntryShareButton).not.toBeInTheDocument();
});
