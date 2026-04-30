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

function setupDeletion({
	onDeleteButtonClick = vi.fn(),
	isDeleteEnabled = true,
}: {
	onDeleteButtonClick?: (timeEntry: TimeEntry) => void;
	isDeleteEnabled?: boolean;
} = {}) {
	render(
		<TimeEntryRow
			timeEntry={timeEntry}
			timeZone="UTC"
			isDeleteEnabled={isDeleteEnabled}
			onDeleteButtonClick={onDeleteButtonClick}
			onCopyButtonClick={vi.fn(() => Promise.resolve())}
		/>,
	);

	return { onDeleteButtonClick };
}

const getDeleteButton = () =>
	screen.getByRole("button", { name: "Delete time entry" });

const getConfirmDeleteButton = () =>
	screen.getByRole("button", { name: "Delete!" });

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

	describe("delete button", () => {
		it("is disabled when isDeleteEnabled is false", () => {
			setupDeletion({ isDeleteEnabled: false });

			expect(getDeleteButton()).toBeDisabled();
		});

		it("shows confirmation state on first click without calling onDeleteButtonClick", async () => {
			const user = userEvent.setup();
			const { onDeleteButtonClick } = setupDeletion();

			await user.click(getDeleteButton());

			expect(screen.getByRole("button", { name: "Delete!" })).toBeVisible();
			expect(
				screen.queryByRole("button", { name: "Delete time entry" }),
			).not.toBeInTheDocument();
			expect(onDeleteButtonClick).not.toHaveBeenCalled();
		});

		it("calls onDeleteButtonClick on second click with the time entry", async () => {
			const { onDeleteButtonClick } = setupDeletion();
			const user = userEvent.setup();

			await user.click(getDeleteButton());
			await user.click(getConfirmDeleteButton());

			expect(onDeleteButtonClick).toHaveBeenCalledWith(timeEntry);
			expect(onDeleteButtonClick).toHaveBeenCalledTimes(1);
		});

		it("resets to idle after 3s without confirming", async () => {
			vi.useFakeTimers();
			setupDeletion();

			// userEvent hangs with fake timers because it waits for all pending timers
			// to settle — including the 2s reset timer we want to advance manually.
			// -> Use fireEvent to keep manual timer control.
			await act(async () => {
				fireEvent.click(getDeleteButton());
			});

			expect(screen.getByRole("button", { name: "Delete!" })).toBeVisible();

			await act(async () => {
				vi.advanceTimersByTime(3000);
			});

			expect(getDeleteButton()).toBeVisible();
			expect(
				screen.queryByRole("button", { name: "Delete!" }),
			).not.toBeInTheDocument();
		});
	});
});
