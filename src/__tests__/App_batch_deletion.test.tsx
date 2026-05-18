import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import type { TimeEntry } from "../types";
import {
	getStartButtonIfExists,
	renderWithEntries,
	startTime1,
	startTime1TimeOfDayMatcher,
	startTime2,
	startTime2TimeOfDayMatcher,
	stopTime1,
	stopTime2,
} from "./App_test_helpers";

const isoDateOfStartTime1 = startTime1.toISOString().split("T")[0];
const isoDateOfStartTime2 = startTime2.toISOString().split("T")[0];

const findBatchDeleteButton = async () => {
	await userEvent.setup().click(screen.getByRole("button", { name: "Menu" }));
	return screen.findByRole("menuitem", { name: /select dates to delete/i });
};

const getConfirmBatchDeleteButton = () =>
	screen.getByRole("button", {
		name: /delete entries for selected dates/i,
	});

it("doesn't show batch delete button if there are no time entries", async () => {
	const user = userEvent.setup();

	renderWithEntries([]);

	await waitFor(() => {
		expect(getStartButtonIfExists()).toBeInTheDocument();
	});
	await user.click(screen.getByRole("button", { name: "Menu" }));

	expect(
		screen.queryByRole("menuitem", { name: /select dates to delete/i }),
	).not.toBeInTheDocument();
});

it("allows enabling batch deletion mode if there are time entries", async () => {
	const user = userEvent.setup();

	const persistedTimeEntries: TimeEntry[] = [
		{
			id: "entry-1",
			startTime: startTime1,
			stopTime: stopTime1,
		},
		{
			id: "entry-2",
			startTime: startTime2,
			stopTime: stopTime2,
		},
	];

	renderWithEntries(persistedTimeEntries);

	const batchDeleteButton = await findBatchDeleteButton();
	expect(batchDeleteButton).toBeVisible();
	await user.click(batchDeleteButton);

	expect(getConfirmBatchDeleteButton()).toBeVisible();
	expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
});

it("clears date selections when canceling batch deletion mode", async () => {
	const user = userEvent.setup();

	const persistedTimeEntries: TimeEntry[] = [
		{
			id: "entry-1",
			startTime: startTime1,
			stopTime: stopTime1,
		},
	];
	renderWithEntries(persistedTimeEntries);

	await user.click(await findBatchDeleteButton());

	const dateCheckbox = screen.getByRole("checkbox");
	await user.click(dateCheckbox);
	expect(dateCheckbox).toBeChecked();

	const dateSection = screen.getByRole("region", {
		name: new RegExp(isoDateOfStartTime1, "i"),
	});
	expect(dateSection).toHaveAttribute("aria-current", "true");

	await user.click(screen.getByRole("button", { name: /cancel/i }));

	expect(dateSection).toHaveAttribute("aria-current", "false");
});

it("deletes entries for a single selected date on confirm", async () => {
	const user = userEvent.setup();

	const persistedTimeEntries: TimeEntry[] = [
		{ id: "entry-1", startTime: startTime1, stopTime: stopTime1 },
		{ id: "entry-2", startTime: startTime2, stopTime: stopTime2 },
	];

	renderWithEntries(persistedTimeEntries);

	await user.click(await findBatchDeleteButton());

	const dateSection1 = screen.getByRole("region", {
		name: new RegExp(isoDateOfStartTime1, "i"),
	});
	await user.click(within(dateSection1).getByRole("checkbox"));

	await user.click(getConfirmBatchDeleteButton());

	expect(
		screen.queryByText(startTime1TimeOfDayMatcher),
	).not.toBeInTheDocument();
	expect(screen.queryByText(startTime2TimeOfDayMatcher)).toBeInTheDocument();
});

it("deletes entries for multiple selected dates on confirm", async () => {
	const user = userEvent.setup();

	const startTime3 = new Date("2023-01-05T05:05:05.000Z");
	const stopTime3 = new Date("2023-01-05T06:06:06.000Z");
	const startTime3TimeOfDayMatcher = /05:05/;

	const persistedTimeEntries: TimeEntry[] = [
		{ id: "entry-1", startTime: startTime1, stopTime: stopTime1 },
		{ id: "entry-2", startTime: startTime2, stopTime: stopTime2 },
		{ id: "entry-3", startTime: startTime3, stopTime: stopTime3 },
	];

	renderWithEntries(persistedTimeEntries);

	await user.click(await findBatchDeleteButton());

	const dateSection1 = screen.getByRole("region", {
		name: new RegExp(isoDateOfStartTime1, "i"),
	});
	await user.click(within(dateSection1).getByRole("checkbox"));

	const dateSection2 = screen.getByRole("region", {
		name: new RegExp(isoDateOfStartTime2, "i"),
	});
	await user.click(within(dateSection2).getByRole("checkbox"));

	await user.click(getConfirmBatchDeleteButton());

	expect(
		screen.queryByText(startTime1TimeOfDayMatcher),
	).not.toBeInTheDocument();
	expect(
		screen.queryByText(startTime2TimeOfDayMatcher),
	).not.toBeInTheDocument();
	expect(screen.queryByText(startTime3TimeOfDayMatcher)).toBeInTheDocument();
});

it("exits batch mode after confirming deletion", async () => {
	const user = userEvent.setup();

	const persistedTimeEntries: TimeEntry[] = [
		{ id: "entry-1", startTime: startTime1, stopTime: stopTime1 },
		{ id: "entry-2", startTime: startTime2, stopTime: stopTime2 },
	];

	renderWithEntries(persistedTimeEntries);

	await user.click(await findBatchDeleteButton());

	const dateSection1 = screen.getByRole("region", {
		name: new RegExp(isoDateOfStartTime1, "i"),
	});
	await user.click(within(dateSection1).getByRole("checkbox"));

	await user.click(getConfirmBatchDeleteButton());

	expect(
		screen.queryByRole("button", {
			name: /delete entries for selected dates/i,
		}),
	).not.toBeInTheDocument();
	expect(
		screen.queryByRole("button", { name: /cancel/i }),
	).not.toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
});

it("disables confirm button when no date is selected", async () => {
	const user = userEvent.setup();

	const persistedTimeEntries: TimeEntry[] = [
		{ id: "entry-1", startTime: startTime1, stopTime: stopTime1 },
	];

	renderWithEntries(persistedTimeEntries);

	await user.click(await findBatchDeleteButton());

	expect(getConfirmBatchDeleteButton()).toBeDisabled();
});

it("disables individual delete buttons during batch deletion mode", async () => {
	const user = userEvent.setup();

	const persistedTimeEntries: TimeEntry[] = [
		{ id: "entry-1", startTime: startTime1, stopTime: stopTime1 },
	];

	renderWithEntries(persistedTimeEntries);

	const deleteButton = await screen.findByLabelText(/delete time entry/i);
	expect(deleteButton).not.toBeDisabled();

	await user.click(await findBatchDeleteButton());

	expect(deleteButton).toBeDisabled();
});
