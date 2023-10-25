import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../App";
import {
  formattedStartTime1Matcher,
  formattedStartTime2Matcher,
  formattedStopTime1Matcher,
  formattedStopTime2Matcher,
  getStartButtonIfExists,
  getStartButtonOrThrow,
  getStopButtonIfExists,
  getStopButtonOrThrow,
  startTime1,
  startTime2,
  stopTime1,
  stopTime2,
} from "./App_test_helpers";

it("can log multiple time entries", async () => {
  const user = userEvent.setup();

  const getCurrentTime = vi.fn(() => startTime1);

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
    />,
  );

  expect(getStartButtonIfExists()).toBeInTheDocument();
  expect(getStopButtonIfExists()).not.toBeInTheDocument();

  expect(
    screen.queryByText(formattedStartTime1Matcher),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime1Matcher)).not.toBeInTheDocument();

  await user.click(getStartButtonOrThrow());

  expect(getStartButtonIfExists()).not.toBeInTheDocument();
  expect(getStopButtonIfExists()).toBeInTheDocument();

  expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime1Matcher)).not.toBeInTheDocument();

  getCurrentTime.mockReturnValueOnce(stopTime1);

  await user.click(getStopButtonOrThrow());

  expect(getStartButtonIfExists()).toBeInTheDocument();
  expect(getStopButtonIfExists()).not.toBeInTheDocument();

  expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

  getCurrentTime.mockReturnValueOnce(startTime2);

  await user.click(getStartButtonOrThrow());

  expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

  expect(screen.queryByText(formattedStartTime2Matcher)).toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime2Matcher)).not.toBeInTheDocument();

  getCurrentTime.mockReturnValueOnce(stopTime2);

  await user.click(getStopButtonOrThrow());

  expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

  expect(screen.queryByText(formattedStartTime2Matcher)).toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime2Matcher)).toBeInTheDocument();
});

it("can delete a time entry if there is just one", async () => {
  const user = userEvent.setup();

  const getCurrentTime = vi.fn(() => startTime1);

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
    />,
  );

  await user.click(getStartButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(stopTime1);

  await user.click(getStopButtonOrThrow());

  const deleteButton = screen.getByTestId("delete-icon");

  expect(deleteButton).toBeInTheDocument();

  await user.click(deleteButton);

  expect(
    screen.queryByText(formattedStartTime1Matcher),
  ).not.toBeInTheDocument();
});

it("can delete a time entry if there are multiple", async () => {
  const user = userEvent.setup();

  const getCurrentTime = vi.fn(() => startTime1);

  render(
    <App
      getCurrentTime={getCurrentTime}
      persistStartTime={vi.fn()}
      retrievePersistedStartTime={vi.fn(() => Promise.resolve(null))}
      removePersistedStartTime={vi.fn()}
    />,
  );

  await user.click(getStartButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(stopTime1);

  await user.click(getStopButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(startTime2);

  await user.click(getStartButtonOrThrow());

  getCurrentTime.mockReturnValueOnce(stopTime2);

  await user.click(getStopButtonOrThrow());

  const secondTimeEntry = screen.getByText(formattedStartTime2Matcher);

  expect(secondTimeEntry).toBeInTheDocument();

  const deleteButtonForSecondTimeEntry =
    within(secondTimeEntry).getByTestId("delete-icon");

  expect(deleteButtonForSecondTimeEntry).toBeInTheDocument();

  await user.click(deleteButtonForSecondTimeEntry);

  expect(screen.queryByText(formattedStartTime1Matcher)).toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime1Matcher)).toBeInTheDocument();

  expect(
    screen.queryByText(formattedStartTime2Matcher),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(formattedStopTime2Matcher)).not.toBeInTheDocument();
});
