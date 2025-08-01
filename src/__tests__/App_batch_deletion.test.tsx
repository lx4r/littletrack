import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import type { TimeEntry } from "../types";
import {
	DEFAULT_APP_PROPS,
	getStartButtonOrThrow,
	getStopButtonOrThrow,
	startTime1,
	startTime1TimeOfDayMatcher,
	startTime2,
	startTime2TimeOfDayMatcher,
	stopTime1,
	stopTime2,
} from "./App_test_helpers";

it("shows batch deletion button, allows canceling batch deletion", async () => {
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
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
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

	const batchDeleteButton = screen.getByLabelText(/batch delete/i);
	expect(batchDeleteButton).toBeVisible();

	await user.click(batchDeleteButton);

	expect(
		screen.getByText(/yes, delete the selected time entries/i),
	).toBeVisible();
	expect(screen.getByText(/cancel/i)).toBeVisible();

	expect(screen.queryByLabelText(/batch delete/i)).not.toBeInTheDocument();

	await user.click(screen.getByText(/cancel/i));

	expect(screen.getByLabelText(/batch delete/i)).toBeVisible();
	expect(
		screen.queryByText(/yes, delete the selected time entries/i),
	).not.toBeInTheDocument();
	expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();

	expect(screen.queryByText(startTime1TimeOfDayMatcher)).toBeVisible();
	expect(screen.queryByText(startTime2TimeOfDayMatcher)).toBeVisible();
});
