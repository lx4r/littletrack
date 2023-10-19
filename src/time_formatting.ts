export function formatTime(date: Date) {
  // "sv" stands for Sweden which uses the time format YYYY-MM-DD HH:MM we want.
  return date.toLocaleString("sv", { dateStyle: "short", timeStyle: "short" });
}
