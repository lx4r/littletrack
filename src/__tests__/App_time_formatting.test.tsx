import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import {
	DEFAULT_APP_PROPS,
	getStartButtonOrThrow,
	getStopButtonOrThrow,
	startTime1,
	startTime1TimeOfDayMatcher,
	stopTime1,
	stopTime1TimeOfDayMatcher,
} from "./App_test_helpers";

it("formats dates and times according to local time zone, not only according to UTC", async () => {
	const user = userEvent.setup();

	// Tokyo is UTC+9 and doesn't observe daylight saving time.
	const timeZone = "Asia/Tokyo";
	const startTime1TimeOfDayInTokyoMatcher = /10:01/;
	const stopTime1TimeOfDayInTokyoMatcher = /11:02/;
	const startTime1Date = "2023-01-01";

	const getCurrentTime = vi.fn(() => startTime1);

	render(
		<App
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
			timeZone={timeZone}
		/>,
	);

	await user.click(getStartButtonOrThrow());

	expect(
		screen.queryByText(startTime1TimeOfDayMatcher),
	).not.toBeInTheDocument();
	expect(
		screen.queryByText(startTime1TimeOfDayInTokyoMatcher),
	).toBeInTheDocument();

	getCurrentTime.mockReturnValueOnce(stopTime1);

	await user.click(getStopButtonOrThrow());

	expect(screen.queryByText(stopTime1TimeOfDayMatcher)).not.toBeInTheDocument();
	expect(
		screen.queryByText(stopTime1TimeOfDayInTokyoMatcher),
	).toBeInTheDocument();
	expect(screen.queryByText(startTime1Date)).toBeInTheDocument();
});
