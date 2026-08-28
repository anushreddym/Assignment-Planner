export const SUBJECT_COLORS = [
  "blue",
  "green",
  "violet",
  "orange",
  "pink",
  "teal",
  "yellow",
  "red",
  "slate",
  "lime",
] as const;
export type SubjectColor = (typeof SUBJECT_COLORS)[number];

export function isSubjectColor(value: string): value is SubjectColor {
  return (SUBJECT_COLORS as readonly string[]).includes(value);
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Local calendar YYYY-MM-DD */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDuePill(dueDate: string): { day: string; date: string } {
  const d = parseDateKey(dueDate);
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return { day, date: `${month} ${d.getDate()}` };
}

export function endOfWeek(from: Date): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const day = d.getDay(); // 0 Sun
  const diff = day === 0 ? 0 : 7 - day; // end on Sunday of this week
  d.setDate(d.getDate() + diff);
  return d;
}

export type TaskBucket = "today" | "week" | "later" | "completed";

export function bucketTask(
  dueDate: string,
  completed: boolean,
  todayKey: string,
  weekEndKey: string
): TaskBucket {
  if (completed) return "completed";
  if (dueDate <= todayKey) return "today"; // today + overdue
  if (dueDate <= weekEndKey) return "week";
  return "later";
}

export function addDaysToKey(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** Red styling when due within the next 3 days (inclusive), or overdue. */
export function isUrgent(dueDate: string, completed: boolean, todayKey: string): boolean {
  if (completed) return false;
  const urgentThrough = addDaysToKey(todayKey, 3);
  return dueDate <= urgentThrough;
}

export function formatTodayLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
