import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { formatTime } from "./time_formatting";

describe("App", () => {
  function getStartButtonIfExists() {
    return screen.queryByTestId("start-icon");
  }

  function getStopButtonIfExists() {
    return screen.queryByTestId("stop-icon");
  }

  function getStartButtonOrThrow() {
    return screen.getByTestId("start-icon");
  }

  function getStopButtonOrThrow() {
    return screen.getByTestId("stop-icon");
  }

  const startTime1 = new Date("2023-10-06T07:26:16.932Z");
  const formattedStartTime1Matcher = new RegExp(formatTime(startTime1));
  const stopTime1 = new Date("2023-10-06T12:34:56.456Z");
  const formattedStopTime1Matcher = new RegExp(formatTime(stopTime1));

  const startTime2 = new Date("2023-01-02T08:45:12.432Z");
  const formattedStartTime2Matcher = new RegExp(formatTime(startTime2));
  const stopTime2 = new Date("2023-01-03T05:02:34.7892Z");
  const formattedStopTime2Matcher = new RegExp(formatTime(stopTime2));

  it("can log multiple time entries", async () => {
    const user = userEvent.setup();

    const getCurrentTime = vi.fn();
    getCurrentTime.mockReturnValueOnce(startTime1);

    render(
      <App
        getCurrentTime={getCurrentTime}
        persistStartTime={vi.fn()}
        retrievePersistedStartTime={vi.fn().mockResolvedValue(null)}
        removePersistedStartTime={vi.fn()}
      />,
    );

    expect(getStartButtonIfExists()).toBeInTheDocument();
    expect(getStopButtonIfExists()).not.toBeInTheDocument();

    expect(
      screen.queryByText(formattedStartTime1Matcher),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime1Matcher),
    ).not.toBeInTheDocument();

    await user.click(getStartButtonOrThrow());

    expect(getStartButtonIfExists()).not.toBeInTheDocument();
    expect(getStopButtonIfExists()).toBeInTheDocument();

    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime1Matcher),
    ).not.toBeInTheDocument();

    getCurrentTime.mockReturnValueOnce(stopTime1);

    await user.click(getStopButtonOrThrow());

    expect(getStartButtonIfExists()).toBeInTheDocument();
    expect(getStopButtonIfExists()).not.toBeInTheDocument();

    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    getCurrentTime.mockReturnValueOnce(startTime2);

    await user.click(getStartButtonOrThrow());

    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    expect(screen.queryByText(formattedStartTime2Matcher)).toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime2Matcher),
    ).not.toBeInTheDocument();

    getCurrentTime.mockReturnValueOnce(stopTime2);

    await user.click(getStopButtonOrThrow());

    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    expect(screen.queryByText(formattedStartTime2Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime2Matcher)).toBeInTheDocument();
  });

  it("can delete a time entry if there is just one", async () => {
    const user = userEvent.setup();

    const getCurrentTime = vi.fn().mockReturnValueOnce(startTime1);

    render(
      <App
        getCurrentTime={getCurrentTime}
        persistStartTime={vi.fn()}
        retrievePersistedStartTime={vi.fn().mockResolvedValue(null)}
        removePersistedStartTime={vi.fn()}
      />,
    );

    await user.click(getStartButtonOrThrow());

    getCurrentTime.mockReturnValueOnce(stopTime1);

    await user.click(getStopButtonOrThrow());

    const deleteButton = screen.getByTestId("delete-icon");

    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);

    expect(
      screen.queryByText(formattedStartTime1Matcher),
    ).not.toBeInTheDocument();
  });

  it("can delete a time entry if there are multiple", async () => {
    const user = userEvent.setup();

    const getCurrentTime = vi.fn().mockReturnValueOnce(startTime1);

    render(
      <App
        getCurrentTime={getCurrentTime}
        persistStartTime={vi.fn()}
        retrievePersistedStartTime={vi.fn().mockResolvedValue(null)}
        removePersistedStartTime={vi.fn()}
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

    expect(secondTimeEntry).toBeInTheDocument();

    const deleteButtonForSecondTimeEntry =
      within(secondTimeEntry).getByTestId("delete-icon");

    expect(deleteButtonForSecondTimeEntry).toBeInTheDocument();

    await user.click(deleteButtonForSecondTimeEntry);

    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    expect(
      screen.queryByText(formattedStartTime2Matcher),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime2Matcher),
    ).not.toBeInTheDocument();
  });

  it("persists start time when start button is clicked", async () => {
    const user = userEvent.setup();

    const getCurrentTime = vi.fn().mockReturnValueOnce(startTime1);
    const persistStartTime = vi.fn().mockReturnValueOnce(Promise.resolve());

    render(
      <App
        getCurrentTime={getCurrentTime}
        persistStartTime={persistStartTime}
        retrievePersistedStartTime={vi.fn().mockResolvedValue(null)}
        removePersistedStartTime={vi.fn()}
      />,
    );

    await user.click(getStartButtonOrThrow());

    expect(persistStartTime).toHaveBeenCalledWith(startTime1);
  });

  it("uses persisted start time if there is one and shows stop button", async () => {
    // TODO: Should we type check test files?
    const retrievePersistedStartTime = vi.fn().mockResolvedValue(startTime1);

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
    const retrievePersistedStartTime = () =>
      Promise.resolve(persistedStartTime);
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
});
