import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import type { TimeEntry } from "../types";
import {
	DEFAULT_APP_PROPS,
	getStartButtonOrThrow,
	getStopButtonOrThrow,
	renderWithEntries,
	startTime1,
	startTime1TimeOfDayMatcher,
	startTime2,
	startTime2TimeOfDayMatcher,
	stopTime1,
	stopTime2,
} from "./App_test_helpers";

it("groups time entries by date, sorts groups from new to old", async () => {
	const user = userEvent.setup();

	const startTime3 = new Date("2023-01-02T05:05:05.000Z");
	const startTime3TimeOfDayMatcher = /05:05/;
	const stopTime3 = new Date("2023-01-02T06:06:06.000Z");

	const getCurrentTime = vi.fn(() => startTime1);

	render(<App {...DEFAULT_APP_PROPS} getCurrentTime={getCurrentTime} />);

	await user.click(getStartButtonOrThrow());
	getCurrentTime.mockReturnValueOnce(stopTime1);
	await user.click(getStopButtonOrThrow());

	getCurrentTime.mockReturnValueOnce(startTime2);
	await user.click(getStartButtonOrThrow());
	getCurrentTime.mockReturnValueOnce(stopTime2);
	await user.click(getStopButtonOrThrow());

	getCurrentTime.mockReturnValueOnce(startTime3);
	await user.click(getStartButtonOrThrow());
	getCurrentTime.mockReturnValueOnce(stopTime3);
	await user.click(getStopButtonOrThrow());

	const timeEntryGroup1 = screen.getByRole("region", { name: /2023-01-01/ });

	expect(
		within(timeEntryGroup1).queryByText(startTime1TimeOfDayMatcher),
	).toBeInTheDocument();
	expect(
		within(timeEntryGroup1).queryByText(startTime2TimeOfDayMatcher),
	).not.toBeInTheDocument();
	expect(
		within(timeEntryGroup1).queryByText(startTime3TimeOfDayMatcher),
	).not.toBeInTheDocument();

	const timeEntryGroup2 = screen.getByRole("region", { name: /2023-01-02/ });

	expect(
		within(timeEntryGroup2).queryByText(startTime1TimeOfDayMatcher),
	).not.toBeInTheDocument();
	expect(
		within(timeEntryGroup2).queryByText(startTime2TimeOfDayMatcher),
	).toBeInTheDocument();
	expect(
		within(timeEntryGroup2).queryByText(startTime3TimeOfDayMatcher),
	).toBeInTheDocument();

	expect(screen.getAllByRole("region")).toEqual([
		timeEntryGroup2,
		timeEntryGroup1,
	]);
});

it("groups time entry spanning multiple days under start date but also shows end date", async () => {
	const user = userEvent.setup();

	const startTime3 = new Date("2023-01-02T05:05:05.000Z");
	const stopTime3 = new Date("2023-01-03T06:06:06.000Z");
	const fullTimeEntry3Matcher = /2023-01-02 05:05.*2023-01-03 06:06/;

	const isoDateForTimeEntries2And3 = "2023-01-02";

	const getCurrentTime = vi.fn(() => startTime2);

	render(<App {...DEFAULT_APP_PROPS} getCurrentTime={getCurrentTime} />);

	await user.click(getStartButtonOrThrow());
	getCurrentTime.mockReturnValueOnce(stopTime2);
	await user.click(getStopButtonOrThrow());

	getCurrentTime.mockReturnValueOnce(startTime3);
	await user.click(getStartButtonOrThrow());
	getCurrentTime.mockReturnValueOnce(stopTime3);
	await user.click(getStopButtonOrThrow());

	const timeEntryGroup1 = screen
		.getByText(isoDateForTimeEntries2And3)
		.closest("section") as HTMLElement;

	expect(timeEntryGroup1).toBeInTheDocument();

	expect(
		within(timeEntryGroup1).queryByText(startTime2TimeOfDayMatcher),
	).toBeInTheDocument();
	expect(
		within(timeEntryGroup1).queryByText(fullTimeEntry3Matcher),
	).toBeInTheDocument();
});

describe("sorting within a group", () => {
	const earlierTimeEntry: TimeEntry = {
		id: "earlier-id",
		startTime: startTime1,
		stopTime: stopTime1,
	};
	const laterTimeEntry: TimeEntry = {
		id: "later-id",
		startTime: new Date("2023-01-01T03:03:03.000Z"),
		stopTime: new Date("2023-01-01T04:04:04.000Z"),
	};
	const laterTimeEntryTimeOfDayMatcher = /03:03/;

	it.each([
		{
			storedOrder: "earlier first",
			entries: [earlierTimeEntry, laterTimeEntry],
		},
		{ storedOrder: "later first", entries: [laterTimeEntry, earlierTimeEntry] },
	])(
		"sorts time entries from earliest to latest start time ($storedOrder)",
		async ({ entries }) => {
			renderWithEntries(entries);

			const timeEntryGroup = await screen.findByRole("region", {
				name: /2023-01-01/,
			});
			const rows = within(timeEntryGroup).getAllByRole("listitem");

			expect(rows).toHaveLength(2);
			expect(rows[0]).toHaveTextContent(startTime1TimeOfDayMatcher);
			expect(rows[1]).toHaveTextContent(laterTimeEntryTimeOfDayMatcher);
		},
	);
});
