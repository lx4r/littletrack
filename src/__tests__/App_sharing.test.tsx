import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import { isWebShareApiAvailable, shareTimeEntry } from "../time_entry_sharing";
import { formatAsIsoDateTime } from "../time_formatting";
import {
  DEFAULT_APP_PROPS,
  startTime1,
  startTime1TimeOfDayMatcher,
  startTime2,
  startTime2TimeOfDayMatcher,
  stopTime1,
  stopTime2,
} from "./App_test_helpers";

it("allows for sharing a time entry if the Web Share API is available", async () => {
  const user = userEvent.setup();

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

  // TODO: Also mock localforage in persistence test in a similar way?
  const mockedWebShareApiShare = vi.fn(() => Promise.resolve());
  vi.stubGlobal("navigator", {
    share: mockedWebShareApiShare,
  });

  render(
    <App
      {...DEFAULT_APP_PROPS}
      shareTimeEntries={{
        shareTimeEntry: shareTimeEntry,
        isSharingAvailable: isWebShareApiAvailable(),
      }}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve(timeEntries)),
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

  expect(mockedWebShareApiShare).toHaveBeenCalledTimes(1);
  expect(mockedWebShareApiShare).toHaveBeenLastCalledWith(
    expect.objectContaining({
      title: expect.stringMatching(/time entry/i),
      text: expect.stringMatching(
        new RegExp(
          `${formatAsIsoDateTime(startTime1)}.+${formatAsIsoDateTime(
            stopTime1,
          )}`,
          "s",
        ),
      ),
    }),
  );

  const timeEntry2Row = screen.getByText(startTime2TimeOfDayMatcher);
  const timeEntry2ShareButton = within(timeEntry2Row).getByLabelText(/share/i);

  expect(timeEntry2ShareButton).toBeInTheDocument();

  await user.click(timeEntry2ShareButton);

  expect(mockedWebShareApiShare).toHaveBeenCalledTimes(2);
  expect(mockedWebShareApiShare).toHaveBeenLastCalledWith(
    expect.objectContaining({
      title: expect.stringMatching(/time entry/i),
      text: expect.stringMatching(
        new RegExp(
          `${formatAsIsoDateTime(startTime2)}.+${formatAsIsoDateTime(
            stopTime2,
          )}`,
          "s",
        ),
      ),
    }),
  );
});

it("doesn't show sharing button is Web Share API is not available", async () => {
  const timeEntry = {
    id: "time-entry-1",
    startTime: startTime1,
    stopTime: stopTime1,
  };

  render(
    <App
      {...DEFAULT_APP_PROPS}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve([timeEntry])),
      }}
      shareTimeEntries={{
        shareTimeEntry: shareTimeEntry,
        isSharingAvailable: isWebShareApiAvailable(),
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
