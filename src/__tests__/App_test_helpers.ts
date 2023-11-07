import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { formatAsIsoTimeOfDayWithoutSeconds } from "../time_formatting";

export function getStartButtonIfExists() {
  return screen.queryByTestId("start-icon");
}

export function getStopButtonIfExists() {
  return screen.queryByTestId("stop-icon");
}

export function getStartButtonOrThrow() {
  return screen.getByTestId("start-icon");
}

export function getStopButtonOrThrow() {
  return screen.getByTestId("stop-icon");
}

export const startTime1 = new Date("2023-01-01T01:01:01.000Z");
export const startTime1TimeOfDayMatcher = new RegExp(
  formatAsIsoTimeOfDayWithoutSeconds(startTime1),
);
export const stopTime1 = new Date("2023-01-01T02:02:02.000Z");
export const stopTime1TimeOfDayMatcher = new RegExp(
  formatAsIsoTimeOfDayWithoutSeconds(stopTime1),
);

export const startTime2 = new Date("2023-01-02T03:03:03.000Z");
export const startTime2TimeOfDayMatcher = new RegExp(
  formatAsIsoTimeOfDayWithoutSeconds(startTime2),
);
export const stopTime2 = new Date("2023-01-03T04:04:04.000Z");
export const stopTime2TimeOfDayMatcher = new RegExp(
  formatAsIsoTimeOfDayWithoutSeconds(stopTime2),
);

export const DEFAULT_APP_PROPS = {
  getCurrentTime: vi.fn(),
  persistStartTime: vi.fn(),
  retrievePersistedStartTime: vi.fn(() => Promise.resolve(null)),
  removePersistedStartTime: vi.fn(),
  manageTimeEntries: {
    persistTimeEntries: vi.fn(),
    retrieveTimeEntries: vi.fn(() => Promise.resolve([])),
  },
  shareTimeEntries: {
    shareTimeEntry: vi.fn(),
    isSharingAvailable: false,
  },
};
