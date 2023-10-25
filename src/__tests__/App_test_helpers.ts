import { screen } from "@testing-library/react";
import { formatTime } from "../time_formatting";

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

export const startTime1 = new Date("2023-10-06T07:26:16.932Z");
export const formattedStartTime1Matcher = new RegExp(formatTime(startTime1));
export const stopTime1 = new Date("2023-10-06T12:34:56.456Z");
export const formattedStopTime1Matcher = new RegExp(formatTime(stopTime1));

export const startTime2 = new Date("2023-01-02T08:45:12.432Z");
export const formattedStartTime2Matcher = new RegExp(formatTime(startTime2));
export const stopTime2 = new Date("2023-01-03T05:02:34.7892Z");
export const formattedStopTime2Matcher = new RegExp(formatTime(stopTime2));
