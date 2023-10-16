import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  function getStartButtonIfExists() {
    return screen.queryByRole("button", { name: "Start" });
  }

  function getStopButtonIfExists() {
    return screen.queryByRole("button", { name: "Stop" });
  }

  const startTime1 = new Date("2023-10-06T07:26:16.932Z");
  const formattedStartTime1Matcher = /2023-10-06 09:26/;
  const stopTime1 = new Date("2023-10-06T12:34:56.456Z");
  const formattedStopTime1Matcher = /2023-10-06 14:34/;

  const startTime2 = new Date("2023-01-02T08:45:12.432Z");
  const formattedStartTime2Matcher = /2023-01-02 09:45/;
  const stopTime2 = new Date("2023-01-03T05:02:34.7892Z");
  const formattedStopTime2Matcher = /2023-01-03 06:02/;

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
      />
    );

    expect(getStartButtonIfExists()).toBeInTheDocument();
    expect(getStopButtonIfExists()).not.toBeInTheDocument();

    expect(
      screen.queryByText(formattedStartTime1Matcher)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime1Matcher)
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(getStartButtonIfExists()).not.toBeInTheDocument();
    expect(getStopButtonIfExists()).toBeInTheDocument();

    // TODO: This test will probably not work in other timezones.
    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime1Matcher)
    ).not.toBeInTheDocument();

    getCurrentTime.mockReturnValueOnce(stopTime1);

    await user.click(screen.getByRole("button", { name: "Stop" }));

    expect(getStartButtonIfExists()).toBeInTheDocument();
    expect(getStopButtonIfExists()).not.toBeInTheDocument();

    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    getCurrentTime.mockReturnValueOnce(startTime2);

    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    expect(screen.queryByText(formattedStartTime2Matcher)).toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime2Matcher)
    ).not.toBeInTheDocument();

    getCurrentTime.mockReturnValueOnce(stopTime2);

    await user.click(screen.getByRole("button", { name: "Stop" }));

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
      />
    );

    const startButton = screen.getByRole("button", { name: "Start" });

    await user.click(startButton);

    getCurrentTime.mockReturnValueOnce(stopTime1);

    const stopButton = screen.getByRole("button", { name: "Stop" });

    await user.click(stopButton);

    const deleteButton = screen.getByRole("button", { name: "Delete" });

    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);

    expect(
      screen.queryByText(formattedStartTime1Matcher)
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
      />
    );

    const startButton = screen.getByRole("button", { name: "Start" });

    await user.click(startButton);

    getCurrentTime.mockReturnValueOnce(stopTime1);

    const stopButton = screen.getByRole("button", { name: "Stop" });

    await user.click(stopButton);

    getCurrentTime.mockReturnValueOnce(startTime2);

    await user.click(startButton);

    getCurrentTime.mockReturnValueOnce(stopTime2);

    await user.click(stopButton);

    // TODO: Figure out how to use getByRole here?
    const secondTimeEntry = screen.getByText(formattedStartTime2Matcher);

    expect(secondTimeEntry).toBeInTheDocument();

    const deleteButtonForSecondTimeEntry = within(secondTimeEntry).getByRole(
      "button",
      { name: "Delete" }
    );

    expect(deleteButtonForSecondTimeEntry).toBeInTheDocument();

    await user.click(deleteButtonForSecondTimeEntry);

    expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

    expect(
      screen.queryByText(formattedStartTime2Matcher)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTime2Matcher)
    ).not.toBeInTheDocument();
  });

  // TODO: Should this be merged into the first test?
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
      />
    );

    // TODO: Avoid repeating the label of the start button?
    const startButton = screen.getByRole("button", { name: "Start" });

    await user.click(startButton);

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
      />
    );

    expect(
      await screen.findByText(formattedStartTime1Matcher)
    ).toBeInTheDocument();
    expect(getStopButtonIfExists()).toBeInTheDocument();
  });

  it("removes persisted start time when stop button is clicked", async () => {
    const user = userEvent.setup();

    const retrievePersistedStartTime = vi.fn().mockResolvedValue(startTime1);
    const removePersistedStartTime = vi
      .fn()
      .mockReturnValueOnce(Promise.resolve());

    render(
      <App
        getCurrentTime={vi.fn()}
        persistStartTime={vi.fn()}
        retrievePersistedStartTime={retrievePersistedStartTime}
        removePersistedStartTime={removePersistedStartTime}
      />
    );

    const stopButton = await screen.findByRole("button", { name: "Stop" });

    await user.click(stopButton);

    // TODO: Would it be better to provide a simple implementation of removePersistedStartTime instead of using a spy here?
    await waitFor(() => {
      expect(removePersistedStartTime).toHaveBeenCalled();
    });
  });
});
