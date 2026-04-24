import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimeEntryRow } from "../TimeEntryRow";
import type { TimeEntry } from "../types";
import { startTime1, stopTime1 } from "./App_test_helpers";

const timeEntry: TimeEntry = {
	id: "time-entry-1",
	startTime: startTime1,
	stopTime: stopTime1,
};

function setup(onCopyButtonClick: (timeEntry: TimeEntry) => Promise<void>) {
	render(
		<TimeEntryRow
			timeEntry={timeEntry}
			timeZone="UTC"
			isDeleteEnabled={true}
			onDeleteButtonClick={vi.fn()}
			onCopyButtonClick={onCopyButtonClick}
		/>,
	);
}

const getCopyButton = () => screen.getByRole("button", { name: "Copy" });

describe("TimeEntryRow", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	describe("copy button", () => {
		it("calls onCopyButtonClick with the time entry on click", async () => {
			const onCopyButtonClick = vi.fn(() => Promise.resolve());
			const user = userEvent.setup();
			setup(onCopyButtonClick);

			await user.click(getCopyButton());

			expect(onCopyButtonClick).toHaveBeenCalledWith(timeEntry);
		});

		it("shows success state after resolved promise", async () => {
			const user = userEvent.setup();
			setup(() => Promise.resolve());

			await user.click(getCopyButton());

			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: "Copied" }),
				).toBeInTheDocument(),
			);
		});

		it("shows error state after rejected promise", async () => {
			const user = userEvent.setup();
			setup(() => Promise.reject(new Error("failed")));

			await user.click(getCopyButton());

			await waitFor(() =>
				expect(
					screen.getByRole("button", { name: "Copy failed" }),
				).toBeInTheDocument(),
			);
		});

		it("resets to idle after 2s (success case)", async () => {
			vi.useFakeTimers();
			setup(() => Promise.resolve());

			// userEvent hangs with fake timers because it waits for all pending timers
			// to settle — including the 2s reset timer we want to advance manually.
			// -> Use fireEvent to keep manual timer control.
			await act(async () => {
				fireEvent.click(getCopyButton());
			});

			expect(
				screen.getByRole("button", { name: "Copied" }),
			).toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(2000);
			});

			expect(getCopyButton()).toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: "Copied" }),
			).not.toBeInTheDocument();
		});

		it("resets to idle after 2s (error case)", async () => {
			vi.useFakeTimers();
			setup(() => Promise.reject(new Error("failed")));

			// See comment in test above
			await act(async () => {
				fireEvent.click(getCopyButton());
			});

			expect(
				screen.getByRole("button", { name: "Copy failed" }),
			).toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(2000);
			});

			expect(getCopyButton()).toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: "Copied" }),
			).not.toBeInTheDocument();
		});
	});
});
