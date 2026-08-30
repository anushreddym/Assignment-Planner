import {
  bucketTask,
  endOfWeek,
  formatDuePill,
  getDueStatus,
  toDateKey,
  type DueStatus,
  type TaskBucket,
} from "./tasks";

export type TaskView = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subjectId: string | null;
  subjectName: string;
  color: string;
  day: string;
  date: string;
  dueStatus: DueStatus;
  completed: boolean;
  bucket: TaskBucket;
};

export type TaskRow = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  subject_id: string | null;
  subjects: { id: string; name: string; color: string } | null;
};

export function toTaskView(task: TaskRow, todayKey: string, weekEndKey: string): TaskView {
  const color = task.subjects?.color ?? "blue";
  const subjectName = task.subjects?.name ?? "No subject";
  const { day, date } = formatDuePill(task.due_date);

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    dueDate: task.due_date,
    subjectId: task.subject_id,
    subjectName,
    color,
    day,
    date,
    dueStatus: getDueStatus(task.due_date, task.completed, todayKey),
    completed: task.completed,
    bucket: bucketTask(task.due_date, task.completed, todayKey, weekEndKey),
  };
}

export function todayKeys() {
  const today = new Date();
  return { todayKey: toDateKey(today), weekEndKey: toDateKey(endOfWeek(today)) };
}
