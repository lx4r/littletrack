import { render, screen } from "@testing-library/react";
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

  it("logs multiple time entries", async () => {
    const user = userEvent.setup();

    const startTime1 = new Date("2023-10-06T07:26:16.932Z");
    const formattedStartTime1Matcher = /2023-10-06 09:26/;
    const stopTime1 = new Date("2023-10-06T12:34:56.456Z");
    const formattedStopTime1Matcher = /2023-10-06 14:34/;

    const startTime2 = new Date("2023-01-02T08:45:12.432Z");
    const formattedStartTime2Matcher = /2023-01-02 09:45/;
    const stopTime2 = new Date("2023-01-03T05:02:34.7892Z");
    const formattedStopTime2Matcher = /2023-01-03 06:02/;

    const getCurrentTime = vi.fn();
    getCurrentTime.mockReturnValueOnce(startTime1);

    render(<App getCurrentTime={getCurrentTime} />);

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
});
