import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import App from "../App";
import type { TimeEntry } from "../types";
import {
	DEFAULT_APP_PROPS,
	getStartButtonIfExists,
	startTime1,
	startTime2,
	stopTime1,
	stopTime2,
} from "./App_test_helpers";

it("doesn't show kebab menu to enable batch deletion mode if there are no time entries", async () => {
	render(
		<App
			{...DEFAULT_APP_PROPS}
			manageTimeEntries={{
				...DEFAULT_APP_PROPS.manageTimeEntries,
				retrieveTimeEntries: () => Promise.resolve([]),
			}}
		/>,
	);

	await waitFor(() => {
		expect(getStartButtonIfExists()).toBeInTheDocument();
		expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
	});
});

it("allows enabling batch deletion mode via kebab menu if there are time entries", async () => {
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

	render(
		<App
			{...DEFAULT_APP_PROPS}
			manageTimeEntries={{
				...DEFAULT_APP_PROPS.manageTimeEntries,
				retrieveTimeEntries: () => Promise.resolve(persistedTimeEntries),
			}}
		/>,
	);

	const kebabMenuButton = await screen.findByLabelText(/open menu/i);
	expect(kebabMenuButton).toBeVisible();
	await user.click(kebabMenuButton);

	const enableBatchDeletionModeButton = screen.getByRole("button", {
		name: /batch delete/i,
	});
	expect(enableBatchDeletionModeButton).toBeVisible();
	await user.click(enableBatchDeletionModeButton);

	expect(screen.getByText(/batch delete mode is enabled/i)).toBeVisible();
});
