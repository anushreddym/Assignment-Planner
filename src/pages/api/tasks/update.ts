export const prerender = false;

import type { APIRoute } from "astro";
import { apiError, apiRedirectOrJson, apiUnauthorized } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";
import { toTaskView, todayKeys, type TaskRow } from "../../../lib/view-models";

const TASK_SELECT = "id, title, description, due_date, completed, subject_id, subjects(id, name, color)";

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiUnauthorized(request);

  const formData = await request.formData();
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() ?? "";
  const dueDate = formData.get("due_date")?.toString();

  if (!id || !title || !dueDate) {
    return apiError(request, "/dashboard", "Title and due date are required");
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description,
      due_date: dueDate,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return apiError(request, "/dashboard", error.message);
  }

  const { data: updated, error: fetchError } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !updated) {
    return apiError(
      request,
      "/dashboard",
      fetchError?.message ?? "Task not found"
    );
  }

  const keys = todayKeys();
  const task = toTaskView(updated as unknown as TaskRow, keys.todayKey, keys.weekEndKey);

  return apiRedirectOrJson(request, "/dashboard", { task });
};
