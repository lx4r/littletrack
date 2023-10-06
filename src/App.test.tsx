import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("shows start time and stop button after clicking start button", async () => {
    const user = userEvent.setup();
    const getCurrentTime = () => new Date("2023-10-06T07:26:16.932Z");
    const formattedCurrentTime = "2023-10-06 09:26";

    render(<App getCurrentTime={getCurrentTime} />);

    const startButton = screen.getByRole("button", { name: "Start" });

    expect(startButton).toBeInTheDocument();

    expect(screen.queryByText(formattedCurrentTime)).not.toBeInTheDocument();

    await user.click(startButton);

    // TODO: Will this test work in all timezones?
    expect(screen.getByText("2023-10-06 09:26")).toBeInTheDocument();

    const stopButton = screen.getByRole("button", { name: "Stop" });

    expect(stopButton).toBeInTheDocument();
  });
});
