import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import {
	DEFAULT_APP_PROPS,
	getStartButtonIfExists,
	getStartButtonOrThrow,
	getStopButtonIfExists,
	getStopButtonOrThrow,
	startTime1,
	startTime1TimeOfDayMatcher,
	startTime2,
	startTime2TimeOfDayMatcher,
	stopTime1,
	stopTime1TimeOfDayMatcher,
	stopTime2,
	stopTime2TimeOfDayMatcher,
} from "./App_test_helpers";

// TODO: Add test for start time being displayed in proper format

it("can log multiple time entries and show them in reverse chronological order", async () => {
	const user = userEvent.setup();

	const getCurrentTime = vi.fn(() => startTime1);

	render(<App {...DEFAULT_APP_PROPS} getCurrentTime={getCurrentTime} />);

	expect(getStartButtonIfExists()).toBeInTheDocument();
	expect(getStopButtonIfExists()).not.toBeInTheDocument();

	expect(
		screen.queryByText(startTime1TimeOfDayMatcher),
	).not.toBeInTheDocument();
	expect(screen.queryByText(stopTime1TimeOfDayMatcher)).not.toBeInTheDocument();

	await user.click(getStartButtonOrThrow());

	expect(getStartButtonIfExists()).not.toBeInTheDocument();
	expect(getStopButtonIfExists()).toBeInTheDocument();

	expect(screen.queryByText(startTime1TimeOfDayMatcher)).toBeInTheDocument();
	expect(screen.queryByText(stopTime1TimeOfDayMatcher)).not.toBeInTheDocument();

	getCurrentTime.mockReturnValueOnce(stopTime1);

	await user.click(getStopButtonOrThrow());

	expect(getStartButtonIfExists()).toBeInTheDocument();
	expect(getStopButtonIfExists()).not.toBeInTheDocument();

	expect(screen.queryByText(startTime1TimeOfDayMatcher)).toBeInTheDocument();
	expect(screen.queryByText(stopTime1TimeOfDayMatcher)).toBeInTheDocument();

	getCurrentTime.mockReturnValueOnce(startTime2);

	await user.click(getStartButtonOrThrow());

	expect(screen.queryByText(startTime1TimeOfDayMatcher)).toBeInTheDocument();
	expect(screen.queryByText(stopTime1TimeOfDayMatcher)).toBeInTheDocument();

	expect(screen.queryByText(startTime2TimeOfDayMatcher)).toBeInTheDocument();
	expect(screen.queryByText(stopTime2TimeOfDayMatcher)).not.toBeInTheDocument();

	getCurrentTime.mockReturnValueOnce(stopTime2);

	await user.click(getStopButtonOrThrow());

	const startTime1Element = screen.queryByText(startTime1TimeOfDayMatcher);

	const startTime2Element = screen.queryByText(startTime2TimeOfDayMatcher);

	expect(startTime1Element).toBeInTheDocument();
	expect(screen.queryByText(stopTime1TimeOfDayMatcher)).toBeInTheDocument();

	expect(startTime2Element).toBeInTheDocument();
	expect(screen.queryByText(stopTime2TimeOfDayMatcher)).toBeInTheDocument();

	expect(
		(startTime2Element as HTMLElement).compareDocumentPosition(
			startTime1Element as HTMLElement,
		),
	).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);
});

it("can delete a time entry if there is just one", async () => {
	const user = userEvent.setup();

	const getCurrentTime = vi.fn(() => startTime1);

	render(<App {...DEFAULT_APP_PROPS} getCurrentTime={getCurrentTime} />);

	await user.click(getStartButtonOrThrow());

	getCurrentTime.mockReturnValueOnce(stopTime1);

	await user.click(getStopButtonOrThrow());

	const deleteButton = screen.getByLabelText(/delete/i);

	expect(deleteButton).toBeInTheDocument();

	await user.click(deleteButton);

	expect(
		screen.queryByText(startTime1TimeOfDayMatcher),
	).not.toBeInTheDocument();
});

it("can delete a time entry if there are multiple", async () => {
	const user = userEvent.setup();

	const getCurrentTime = vi.fn(() => startTime1);

	render(<App {...DEFAULT_APP_PROPS} getCurrentTime={getCurrentTime} />);

	await user.click(getStartButtonOrThrow());

	getCurrentTime.mockReturnValueOnce(stopTime1);

	await user.click(getStopButtonOrThrow());

	getCurrentTime.mockReturnValueOnce(startTime2);

	await user.click(getStartButtonOrThrow());

	getCurrentTime.mockReturnValueOnce(stopTime2);

	await user.click(getStopButtonOrThrow());

	const secondTimeEntry = screen.getByText(startTime2TimeOfDayMatcher);

	expect(secondTimeEntry).toBeInTheDocument();

	const deleteButtonForSecondTimeEntry =
		within(secondTimeEntry).getByLabelText(/delete/i);

	expect(deleteButtonForSecondTimeEntry).toBeInTheDocument();

	await user.click(deleteButtonForSecondTimeEntry);

	expect(screen.queryByText(startTime1TimeOfDayMatcher)).toBeInTheDocument();
	expect(screen.queryByText(stopTime1TimeOfDayMatcher)).toBeInTheDocument();

	expect(
		screen.queryByText(startTime2TimeOfDayMatcher),
	).not.toBeInTheDocument();
	expect(screen.queryByText(stopTime2TimeOfDayMatcher)).not.toBeInTheDocument();
});
