import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App, { TimeEntry } from "../App";
import {
  formattedStartTime1Matcher,
  formattedStartTime2Matcher,
  formattedStopTime1Matcher,
  formattedStopTime2Matcher,
  getStartButtonIfExists,
  getStartButtonOrThrow,
  getStopButtonIfExists,
  getStopButtonOrThrow,
  startTime1,
  startTime2,
  stopTime1,
  stopTime2,
} from "./App_test_helpers";

// TODO: rewrite this and the next test to match "realness" of the third test?
it("persists start time when start button is clicked", async () => {
  const user = userEvent.setup();

  const getCurrentTime = vi.fn(() => startTime1);
  const persistStartTime = vi.fn(() => Promise.resolve());

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={persistStartTime}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve([])),
      }}
    />,
  );

  await user.click(getStartButtonOrThrow());

  expect(persistStartTime).toHaveBeenCalledWith(startTime1);
});

it("uses persisted start time if there is one and shows stop button", async () => {
  const retrievePersistedStartTime = vi.fn(() => Promise.resolve(startTime1));

  render(
    <App
      getCurrentTime={vi.fn()}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={retrievePersistedStartTime}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve([])),
      }}
    />,
  );

  expect(
    await screen.findByText(formattedStartTime1Matcher),
  ).toBeInTheDocument();
  expect(getStopButtonIfExists()).toBeInTheDocument();
});

it("doesn't have a running time entry after stopping another and reloading the app", async () => {
  const user = userEvent.setup();

  const getCurrentTime = vi.fn(() => startTime1);

  let persistedStartTime: Date | null = null;
  const persistStartTime = (startTime: Date) => {
    persistedStartTime = startTime;
    return Promise.resolve();
  };
  const retrievePersistedStartTime = () => Promise.resolve(persistedStartTime);
  const removePersistedStartTime = () => {
    persistedStartTime = null;
    return Promise.resolve();
  };

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={persistStartTime}
      retrievePersistedStartTime={retrievePersistedStartTime}
      removePersistedStartTime={removePersistedStartTime}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve([])),
      }}
    />,
  );

  await user.click(getStartButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(stopTime1);

  await user.click(getStopButtonOrThrow());

  cleanup();

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={persistStartTime}
      retrievePersistedStartTime={retrievePersistedStartTime}
      removePersistedStartTime={removePersistedStartTime}
      manageTimeEntries={{
        persistTimeEntries: vi.fn(),
        retrieveTimeEntries: vi.fn(() => Promise.resolve([])),
      }}
    />,
  );

  expect(getStopButtonIfExists()).not.toBeInTheDocument();
  expect(getStartButtonIfExists()).toBeInTheDocument();
  expect(
    screen.queryByText(formattedStartTime1Matcher),
  ).not.toBeInTheDocument();
});

it("persists time entries across page reload", async () => {
  const user = userEvent.setup();

  const getCurrentTime = vi.fn(() => startTime1);

  let persistedTimeEntries: TimeEntry[] = [];
  const persistTimeEntries = (timeEntries: TimeEntry[]) => {
    persistedTimeEntries = timeEntries;
    return Promise.resolve();
  };
  const retrieveTimeEntries = () => Promise.resolve(persistedTimeEntries);

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries,
        retrieveTimeEntries,
      }}
    />,
  );

  await user.click(getStartButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(stopTime1);

  await user.click(getStopButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(startTime2);

  await user.click(getStartButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(stopTime2);

  await user.click(getStopButtonOrThrow());

  cleanup();

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries,
        retrieveTimeEntries,
      }}
    />,
  );

  await waitFor(() => {
    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    expect(screen.queryByText(formattedStartTime2Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime2Matcher)).toBeInTheDocument();
  });
});

it("persists deletion of time entry across page reload", async () => {
  const user = userEvent.setup();

  const getCurrentTime = vi.fn(() => startTime1);

  let persistedTimeEntries: TimeEntry[] = [];
  const persistTimeEntries = (timeEntries: TimeEntry[]) => {
    persistedTimeEntries = timeEntries;
    return Promise.resolve();
  };
  const retrieveTimeEntries = () => Promise.resolve(persistedTimeEntries);

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries,
        retrieveTimeEntries,
      }}
    />,
  );

  await user.click(getStartButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(stopTime1);

  await user.click(getStopButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(startTime2);

  await user.click(getStartButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(stopTime2);

  await user.click(getStopButtonOrThrow());

  const secondTimeEntry = screen.getByText(formattedStartTime2Matcher);
  const deleteButtonForSecondTimeEntry =
    within(secondTimeEntry).getByTestId("delete-icon");

  await user.click(deleteButtonForSecondTimeEntry);

  cleanup();

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
      manageTimeEntries={{
        persistTimeEntries,
        retrieveTimeEntries,
      }}
    />,
  );

  await waitFor(() => {
    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    expect(
      screen.queryByText(formattedStartTime2Matcher),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime2Matcher),
    ).not.toBeInTheDocument();
  });
});
