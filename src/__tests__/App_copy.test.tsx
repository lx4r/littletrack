import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
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

it("clicking copy button writes correctly formatted entry to clipboard", async () => {
	const user = userEvent.setup();

	const timeEntry1 = {
		id: "entry-1",
		startTime: startTime1,
		stopTime: stopTime1,
	};
	const timeEntry2 = {
		id: "entry-2",
		startTime: startTime2,
		stopTime: stopTime2,
	};

	const writeText = vi.fn(() => Promise.resolve());
	vi.stubGlobal("navigator", { clipboard: { writeText } });

	render(
		<App
			{...DEFAULT_APP_PROPS}
			manageTimeEntries={{
				...DEFAULT_APP_PROPS.manageTimeEntries,
				retrieveTimeEntries: vi.fn(() =>
					Promise.resolve([timeEntry2, timeEntry1]),
				),
			}}
		/>,
	);

	expect(
		await screen.findByText(startTime1TimeOfDayMatcher),
	).toBeInTheDocument();

	await user.click(
		within(screen.getByText(startTime1TimeOfDayMatcher)).getByRole("button", {
			name: "Copy",
		}),
	);

	expect(writeText).toHaveBeenLastCalledWith(
		`Start time: ${startTime1IsoDateTime}\nStop time: ${stopTime1IsoDateTime}`,
	);

	await user.click(
		within(screen.getByText(startTime2TimeOfDayMatcher)).getByRole("button", {
			name: "Copy",
		}),
	);

	expect(writeText).toHaveBeenLastCalledWith(
		`Start time: ${startTime2IsoDateTime}\nStop time: ${stopTime2IsoDateTime}`,
	);
});
