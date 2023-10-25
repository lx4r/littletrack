import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import {
  formattedStartTime1Matcher,
  getStartButtonIfExists,
  getStartButtonOrThrow,
  getStopButtonIfExists,
  getStopButtonOrThrow,
  startTime1,
  stopTime1,
} from "./App_test_helpers";

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
    />,
  );

  expect(getStopButtonIfExists()).not.toBeInTheDocument();
  expect(getStartButtonIfExists()).toBeInTheDocument();
  expect(
    screen.queryByText(formattedStartTime1Matcher),
  ).not.toBeInTheDocument();
});
