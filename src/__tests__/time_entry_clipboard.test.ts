import { describe, expect, it, vi } from "vitest";
import { copyTimeEntryToClipboard } from "../time_entry_clipboard";
import {
	startTime1,
	startTime1IsoDateTime,
	stopTime1,
	stopTime1IsoDateTime,
} from "./App_test_helpers";

const timeEntry = {
	id: "time-entry-1",
	startTime: startTime1,
	stopTime: stopTime1,
};

describe("copyTimeEntryToClipboard", () => {
	it("formats entry and passes it to navigator.clipboard.writeText", async () => {
		const writeTextMock = vi.fn(() => Promise.resolve());
		vi.stubGlobal("navigator", { clipboard: { writeText: writeTextMock } });

		await copyTimeEntryToClipboard(timeEntry, "UTC");

		expect(writeTextMock).toHaveBeenCalledWith(
			`Start time: ${startTime1IsoDateTime}\nStop time: ${stopTime1IsoDateTime}`,
		);
	});

	it("propagates rejection from writeText", async () => {
		const error = new Error("clipboard error");
		vi.stubGlobal("navigator", {
			clipboard: { writeText: vi.fn(() => Promise.reject(error)) },
		});

		await expect(copyTimeEntryToClipboard(timeEntry, "UTC")).rejects.toThrow(
			error,
		);
	});
});
