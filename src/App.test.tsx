import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  it("shows start time and stop button after clicking start button, stop time after clicking stop button", async () => {
    const user = userEvent.setup();
    const startTime = new Date("2023-10-06T07:26:16.932Z");
    const formattedStartTimeMatcher = /2023-10-06 09:26/;
    const stopTime = new Date("2023-10-07T12:34:56.932Z");
    const formattedStopTimeMatcher = /2023-10-07 14:34/;
    const getCurrentTime = vi.fn(() => startTime);

    render(<App getCurrentTime={getCurrentTime} />);

    const startButton = screen.getByRole("button", { name: "Start" });

    expect(startButton).toBeInTheDocument();

    expect(
      screen.queryByText(formattedStartTimeMatcher)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTimeMatcher)
    ).not.toBeInTheDocument();

    await user.click(startButton);

    // TODO: Will this test work in all timezones?
    expect(screen.queryByText(formattedStartTimeMatcher)).toBeInTheDocument();
    expect(
      screen.queryByText(formattedStopTimeMatcher)
    ).not.toBeInTheDocument();

    const stopButton = screen.getByRole("button", { name: "Stop" });

    expect(stopButton).toBeInTheDocument();

    getCurrentTime.mockReturnValue(stopTime);

    await user.click(stopButton);

    expect(screen.queryByText(formattedStartTimeMatcher)).toBeInTheDocument();
    expect(screen.queryByText(formattedStopTimeMatcher)).toBeInTheDocument();
  });
});
