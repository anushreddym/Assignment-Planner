export const prerender = false;

import type { APIRoute } from "astro";
import { apiError, apiRedirectOrJson, apiUnauthorized } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";
import { toTaskView, todayKeys, type TaskRow } from "../../../lib/view-models";

const TASK_SELECT = "id, title, description, due_date, completed, subject_id, subjects(id, name, color)";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiUnauthorized(request, redirect);

  const formData = await request.formData();
  const subjectId = formData.get("subject_id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() ?? "";
  const dueDate = formData.get("due_date")?.toString();

  if (!subjectId || !title || !dueDate) {
    return apiError(request, redirect, "/dashboard", "Subject, title, and due date are required");
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subject) {
    return apiError(request, redirect, "/dashboard", "Subject not found");
  }

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      title,
      description,
      due_date: dueDate,
    })
    .select(TASK_SELECT)
    .single();

  if (error || !inserted) {
    return apiError(request, redirect, "/dashboard", error?.message ?? "Failed to create task");
  }

  const keys = todayKeys();
  const task = toTaskView(inserted as unknown as TaskRow, keys.todayKey, keys.weekEndKey);

  return apiRedirectOrJson(request, redirect, "/dashboard", { task });
};
