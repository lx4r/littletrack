import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import type { TimeEntry } from "../types";
import {
	DEFAULT_APP_PROPS,
	getStartButtonIfExists,
	getStartButtonOrThrow,
	getStopButtonIfExists,
	getStopButtonOrThrow,
	recordTwoTimeEntries,
	startTime1,
	startTime1IsoDateTime,
	startTime1TimeOfDayMatcher,
	startTime2TimeOfDayMatcher,
	stopTime1,
	stopTime1TimeOfDayMatcher,
	stopTime2TimeOfDayMatcher,
} from "./App_test_helpers";

const makeInMemoryTimeEntryPersistence = () => {
	let entries: TimeEntry[] = [];

	return {
		persistTimeEntries: (timeEntries: TimeEntry[]) => {
			entries = timeEntries;
			return Promise.resolve();
		},
		retrieveTimeEntries: () => Promise.resolve(entries),
	};
};

it("persists start time when start button is clicked", async () => {
	const user = userEvent.setup();

	const getCurrentTime = vi.fn(() => startTime1);
	const persistStartTime = vi.fn(() => Promise.resolve());

	render(
		<App
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
			timer={{ ...DEFAULT_APP_PROPS.timer, persistStartTime }}
		/>,
	);

	await user.click(getStartButtonOrThrow());

	expect(persistStartTime).toHaveBeenCalledWith(startTime1);
});

it("uses persisted start time if there is one and shows stop button", async () => {
	const retrievePersistedStartTime = () => Promise.resolve(startTime1);

	render(
		<App
			{...DEFAULT_APP_PROPS}
			timer={{ ...DEFAULT_APP_PROPS.timer, retrievePersistedStartTime }}
		/>,
	);

	expect(await screen.findByText(startTime1IsoDateTime)).toBeInTheDocument();
	expect(getStopButtonIfExists()).toBeInTheDocument();
});

it("doesn't have a running time entry after stopping another and reloading the app", async () => {
	const user = userEvent.setup();

	const getCurrentTime = vi.fn(() => startTime1);

	let persistedStartTime: Date | null = null;
	const persistStartTime = (startTime: Date) => {
		persistedStartTime = startTime;
		return Promise.resolve();
	};
	const retrievePersistedStartTime = () => Promise.resolve(persistedStartTime);
	const removePersistedStartTime = () => {
		persistedStartTime = null;
		return Promise.resolve();
	};

	render(
		<App
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
			timer={{
				persistStartTime,
				retrievePersistedStartTime,
				removePersistedStartTime,
			}}
		/>,
	);

	await user.click(getStartButtonOrThrow());

	getCurrentTime.mockReturnValueOnce(stopTime1);

	await user.click(getStopButtonOrThrow());

	cleanup();

	render(
		<App
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
			timer={{ ...DEFAULT_APP_PROPS.timer, persistStartTime }}
		/>,
	);

	await waitFor(() => {
		expect(getStopButtonIfExists()).not.toBeInTheDocument();
		expect(getStartButtonIfExists()).toBeInTheDocument();
		expect(screen.queryByText(startTime1IsoDateTime)).not.toBeInTheDocument();
	});
});

it("persists time entries across page reload", async () => {
	const user = userEvent.setup();

	const { persistTimeEntries, retrieveTimeEntries } =
		makeInMemoryTimeEntryPersistence();
	const getCurrentTime = vi.fn();

	render(
		<App
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
			timeEntries={{ persistTimeEntries, retrieveTimeEntries }}
		/>,
	);

	await recordTwoTimeEntries(user, getCurrentTime);

	cleanup();

	render(
		<App
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
			timeEntries={{ persistTimeEntries, retrieveTimeEntries }}
		/>,
	);

	await waitFor(() => {
		expect(screen.queryByText(startTime1TimeOfDayMatcher)).toBeInTheDocument();
		expect(screen.queryByText(stopTime1TimeOfDayMatcher)).toBeInTheDocument();

		expect(screen.queryByText(startTime2TimeOfDayMatcher)).toBeInTheDocument();
		expect(screen.queryByText(stopTime2TimeOfDayMatcher)).toBeInTheDocument();
	});
});

it("persists deletion of time entry across page reload", async () => {
	const user = userEvent.setup();

	const { persistTimeEntries, retrieveTimeEntries } =
		makeInMemoryTimeEntryPersistence();
	const getCurrentTime = vi.fn();

	render(
		<App
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
			timeEntries={{ persistTimeEntries, retrieveTimeEntries }}
		/>,
	);

	await recordTwoTimeEntries(user, getCurrentTime);

	const secondTimeEntry = screen.getByText(startTime2TimeOfDayMatcher);
	const deleteButtonForSecondTimeEntry = within(secondTimeEntry).getByRole(
		"button",
		{ name: /delete/i },
	);

	await user.click(deleteButtonForSecondTimeEntry);
	// Confirm deletion
	await user.click(deleteButtonForSecondTimeEntry);

	cleanup();

	render(
		<App
			{...DEFAULT_APP_PROPS}
			getCurrentTime={getCurrentTime}
			timeEntries={{ persistTimeEntries, retrieveTimeEntries }}
		/>,
	);

	await waitFor(() => {
		expect(screen.queryByText(startTime1TimeOfDayMatcher)).toBeInTheDocument();
		expect(screen.queryByText(stopTime1TimeOfDayMatcher)).toBeInTheDocument();

		expect(
			screen.queryByText(startTime2TimeOfDayMatcher),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText(stopTime2TimeOfDayMatcher),
		).not.toBeInTheDocument();
	});
});
