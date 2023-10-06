import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("shows start time after clicking start button", async () => {
    const user = userEvent.setup();
    const getCurrentTime = () => new Date("2023-10-06T07:26:16.932Z");

    render(<App getCurrentTime={getCurrentTime} />);

    const startButton = screen.getByText("Start");

    expect(startButton).toBeInTheDocument();

    await user.click(startButton);

    // TODO: Will this test work in all timezones?
    expect(screen.getByText("2023-10-06 09:26")).toBeInTheDocument();
  });
});
