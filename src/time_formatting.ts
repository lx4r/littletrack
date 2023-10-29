export function formatAsIsoDateTime(date: Date) {
  // "sv" stands for Sweden which uses the time format YYYY-MM-DD HH:MM we want.
  return date.toLocaleString("sv", { dateStyle: "short", timeStyle: "short" });
}

export function getIsoDate(date: Date) {
  return date.toISOString().split("T")[0];
}
