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

  it("shows start time and stop button after clicking start button, stop time after clicking stop button", async () => {
    const user = userEvent.setup();
    const startTime = new Date("2023-10-06T07:26:16.932Z");
    const formattedStartTimeMatcher = /2023-10-06 09:26/;
    const stopTime = new Date("2023-10-07T12:34:56.932Z");
    const formattedStopTimeMatcher = /2023-10-07 14:34/;
    const getCurrentTime = vi.fn(() => startTime);

    render(<App getCurrentTime={getCurrentTime} />);

    expect(getStartButtonIfExists()).toBeInTheDocument();
    expect(getStopButtonIfExists()).not.toBeInTheDocument();

    expect(
      screen.queryByText(formattedStartTimeMatcher)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTimeMatcher)
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(getStartButtonIfExists()).not.toBeInTheDocument();
    expect(getStopButtonIfExists()).toBeInTheDocument();

    // TODO: Will this test work in all timezones?
    expect(screen.queryByText(formattedStartTimeMatcher)).toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTimeMatcher)
    ).not.toBeInTheDocument();

    getCurrentTime.mockReturnValue(stopTime);

    await user.click(screen.getByRole("button", { name: "Stop" }));

    expect(getStartButtonIfExists()).toBeInTheDocument();
    expect(getStopButtonIfExists()).not.toBeInTheDocument();

    expect(screen.queryByText(formattedStartTimeMatcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTimeMatcher)).toBeInTheDocument();
  });
});
