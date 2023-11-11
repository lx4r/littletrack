import { screen } from "@testing-library/react";
import { Props as AppProps } from "../App";

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
export const startTime1TimeOfDayMatcher = /01:01/;
// TODO: "date" might be a confusing, because overloaded, term here.
export const startTime1IsoDateTime = "2023-01-01 01:01";

export const stopTime1 = new Date("2023-01-01T02:02:02.000Z");
export const stopTime1TimeOfDayMatcher = /02:02/;
export const stopTime1IsoDateTime = "2023-01-01 02:02";

export const startTime2 = new Date("2023-01-02T03:03:03.000Z");
export const startTime2TimeOfDayMatcher = /03:03/;
export const startTime2IsoDateTime = "2023-01-02 03:03";

export const stopTime2 = new Date("2023-01-03T04:04:04.000Z");
export const stopTime2TimeOfDayMatcher = /04:04/;
export const stopTime2IsoDateTime = "2023-01-03 04:04";

export const DEFAULT_APP_PROPS: AppProps = {
  getCurrentTime: () => new Date(),
  persistStartTime: () => Promise.resolve(),
  retrievePersistedStartTime: () => Promise.resolve(null),
  removePersistedStartTime: () => Promise.resolve(),
  manageTimeEntries: {
    persistTimeEntries: () => Promise.resolve(),
    retrieveTimeEntries: () => Promise.resolve([]),
  },
  shareTimeEntries: {
    shareTimeEntry: () => Promise.resolve(),
    isSharingAvailable: false,
  },
};
