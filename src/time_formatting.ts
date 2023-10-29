function formatAsIsoDateParts(date: Date) {
  const [isoDate, isoTime] = date.toISOString().split("T");
  const isoTimeOfDayWithoutSeconds = isoTime.slice(0, 5);

  return { isoDate, isoTimeOfDayWithoutSeconds };
}

export function formatAsIsoTimeOfDayWithoutSeconds(date: Date) {
  const { isoTimeOfDayWithoutSeconds } = formatAsIsoDateParts(date);

  return isoTimeOfDayWithoutSeconds;
}

export function formatAsIsoDate(date: Date) {
  const { isoDate } = formatAsIsoDateParts(date);

  return isoDate;
}

export function formatAsIsoDateTime(date: Date) {
  const { isoDate, isoTimeOfDayWithoutSeconds } = formatAsIsoDateParts(date);

  return `${isoDate} ${isoTimeOfDayWithoutSeconds}`;
}
