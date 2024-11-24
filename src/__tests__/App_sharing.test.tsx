import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import { isSharingAvailable, shareTimeEntry } from "../time_entry_sharing";
import {
	DEFAULT_APP_PROPS,
	startTime1,
	startTime1IsoDateTime,
	startTime1TimeOfDayMatcher,
	startTime2,
	startTime2IsoDateTime,
	startTime2TimeOfDayMatcher,
	stopTime1,
	stopTime1IsoDateTime,
	stopTime2,
	stopTime2IsoDateTime,
} from "./App_test_helpers";

it("allows for sharing time entries if Web Share API is available", async () => {
	const user = userEvent.setup();

	const timeEntry1 = {
		id: "time-entry-1",
		startTime: startTime1,
		stopTime: stopTime1,
	};
	const timeEntry2 = {
		id: "time-entry-2",
		startTime: startTime2,
		stopTime: stopTime2,
	};
	const timeEntries = [timeEntry2, timeEntry1];

	// TODO: Also mock localforage in persistence test in a similar way?
	const mockedWebShareApiShare = vi.fn(() => Promise.resolve());
	vi.stubGlobal("navigator", {
		share: mockedWebShareApiShare,
		canShare: () => true,
	});

	render(
		<App
			{...DEFAULT_APP_PROPS}
			shareTimeEntries={{
				shareTimeEntry: (timeEntry) => shareTimeEntry(timeEntry, "UTC"),
				isSharingAvailable,
			}}
			manageTimeEntries={{
				persistTimeEntries: vi.fn(),
				retrieveTimeEntries: vi.fn(() => Promise.resolve(timeEntries)),
			}}
		/>,
	);

	expect(
		await screen.findByText(startTime1TimeOfDayMatcher),
	).toBeInTheDocument();

	const timeEntry1Row = screen.getByText(startTime1TimeOfDayMatcher);
	const timeEntry1ShareButton = within(timeEntry1Row).getByLabelText(/share/i);

	expect(timeEntry1ShareButton).toBeInTheDocument();

	await user.click(timeEntry1ShareButton);

	expect(mockedWebShareApiShare).toHaveBeenLastCalledWith(
		expect.objectContaining({
			title: expect.stringMatching(/time entry/i),
			text: expect.stringMatching(
				new RegExp(`${startTime1IsoDateTime}.+${stopTime1IsoDateTime}`, "s"),
			),
		}),
	);

	const timeEntry2Row = screen.getByText(startTime2TimeOfDayMatcher);
	const timeEntry2ShareButton = within(timeEntry2Row).getByLabelText(/share/i);

	expect(timeEntry2ShareButton).toBeInTheDocument();

	await user.click(timeEntry2ShareButton);

	expect(mockedWebShareApiShare).toHaveBeenLastCalledWith(
		expect.objectContaining({
			title: expect.stringMatching(/time entry/i),
			text: expect.stringMatching(
				new RegExp(`${startTime2IsoDateTime}.+${stopTime2IsoDateTime}`, "s"),
			),
		}),
	);
});

it("doesn't show sharing button if Web Share API isn't available", async () => {
	const timeEntry = {
		id: "time-entry-1",
		startTime: startTime1,
		stopTime: stopTime1,
	};

	vi.stubGlobal("navigator", {
		share: undefined,
		canShare: undefined,
	});

	render(
		<App
			{...DEFAULT_APP_PROPS}
			manageTimeEntries={{
				persistTimeEntries: vi.fn(),
				retrieveTimeEntries: vi.fn(() => Promise.resolve([timeEntry])),
			}}
			shareTimeEntries={{
				shareTimeEntry: () => Promise.resolve(),
				isSharingAvailable,
			}}
		/>,
	);

	expect(
		await screen.findByText(startTime1TimeOfDayMatcher),
	).toBeInTheDocument();

	const timeEntryRow = screen.getByText(startTime1TimeOfDayMatcher);
	const timeEntryShareButton = within(timeEntryRow).queryByLabelText(/share/i);

	expect(timeEntryShareButton).not.toBeInTheDocument();
});

it("doesn't show sharing button if share() is available but canShare() returns false", async () => {
	const timeEntry = {
		id: "time-entry-1",
		startTime: startTime1,
		stopTime: stopTime1,
	};

	vi.stubGlobal("navigator", {
		share: () => Promise.resolve(),
		canShare: () => false,
	});

	render(
		<App
			{...DEFAULT_APP_PROPS}
			manageTimeEntries={{
				persistTimeEntries: vi.fn(),
				retrieveTimeEntries: vi.fn(() => Promise.resolve([timeEntry])),
			}}
			shareTimeEntries={{
				shareTimeEntry: () => Promise.resolve(),
				isSharingAvailable,
			}}
		/>,
	);

	expect(
		await screen.findByText(startTime1TimeOfDayMatcher),
	).toBeInTheDocument();

	const timeEntryRow = screen.getByText(startTime1TimeOfDayMatcher);
	const timeEntryShareButton = within(timeEntryRow).queryByLabelText(/share/i);

	expect(timeEntryShareButton).not.toBeInTheDocument();
});

it("doesn't show sharing button is Web Share API is available, canShare() returns true, but sharing test data throws errors", async () => {
	const timeEntry = {
		id: "time-entry-1",
		startTime: startTime1,
		stopTime: stopTime1,
	};

	vi.stubGlobal("navigator", {
		share: () => Promise.reject(),
		canShare: () => false,
	});

	render(
		<App
			{...DEFAULT_APP_PROPS}
			manageTimeEntries={{
				persistTimeEntries: vi.fn(),
				retrieveTimeEntries: vi.fn(() => Promise.resolve([timeEntry])),
			}}
			shareTimeEntries={{
				shareTimeEntry: () => Promise.resolve(),
				isSharingAvailable,
			}}
		/>,
	);

	expect(
		await screen.findByText(startTime1TimeOfDayMatcher),
	).toBeInTheDocument();

	const timeEntryRow = screen.getByText(startTime1TimeOfDayMatcher);
	const timeEntryShareButton = within(timeEntryRow).queryByLabelText(/share/i);

	expect(timeEntryShareButton).not.toBeInTheDocument();
});
