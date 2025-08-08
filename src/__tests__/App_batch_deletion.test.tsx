import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import type { TimeEntry } from "../types";
import {
	DEFAULT_APP_PROPS,
	startTime1,
	startTime2,
	stopTime1,
	stopTime2,
} from "./App_test_helpers";

it("allows enabling batch deletion mode via kebab menu", async () => {
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
	const retrieveTimeEntries = () => Promise.resolve(persistedTimeEntries);

	render(
		<App
			{...DEFAULT_APP_PROPS}
			manageTimeEntries={{
				persistTimeEntries: vi.fn(),
				retrieveTimeEntries,
			}}
		/>,
	);

	const kebabMenuButton = await screen.findByLabelText(/open menu/i);
	await user.click(kebabMenuButton);

	const enableBatchDeletionModeButton = screen.getByRole("button", {
		name: /batch delete/i,
	});
	expect(enableBatchDeletionModeButton).toBeVisible();
	await user.click(enableBatchDeletionModeButton);

	expect(
		screen.getByRole("button", {
			name: /yes, delete the selected time entries/i,
		}),
	).toBeVisible();
	expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
});
