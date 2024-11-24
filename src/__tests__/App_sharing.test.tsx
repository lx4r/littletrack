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

const timeEntry1 = {
	id: "time-entry-1",
	startTime: startTime1,
	stopTime: stopTime1,
};

it("allows for sharing time entries if Web Share API is available", async () => {
	const user = userEvent.setup();

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
				isSharingAvailable: () => Promise.resolve(true),
				shareTimeEntry: (timeEntry) => shareTimeEntry(timeEntry, "UTC"),
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

it.for([
	{
		testName: "Web Share API isn't available",
		share: undefined,
		canShare: undefined,
	},
	{
		testName: "share() is available but canShare() returns false",
		share: () => Promise.resolve(),
		canShare: () => false,
	},
	{
		testName: "canShare() returns true but sharing test data throws errors",
		share: () => Promise.reject(),
		canShare: () => false,
	},
])(`doesn't show sharing button if $testName`, async ({ share, canShare }) => {
	vi.stubGlobal("navigator", {
		share,
		canShare,
	});

	render(
		<App
			{...DEFAULT_APP_PROPS}
			manageTimeEntries={{
				persistTimeEntries: vi.fn(),
				retrieveTimeEntries: vi.fn(() => Promise.resolve([timeEntry1])),
			}}
			shareTimeEntries={{
				...DEFAULT_APP_PROPS.shareTimeEntries,
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
