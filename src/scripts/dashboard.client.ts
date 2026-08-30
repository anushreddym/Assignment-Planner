import type { TaskBucket } from "../lib/tasks";
import type { TaskView } from "../lib/view-models";

type SubjectView = { id: string; name: string; color: string };

type ApiResult = {
  ok: boolean;
  error?: string;
  task?: TaskView;
  subject?: SubjectView;
  id?: string;
};

declare global {
  interface Window {
    showToast?: (message: string, type?: string) => void;
  }
}

const BUCKET_TITLES: Record<TaskBucket, string> = {
  past_due: "Past due",
  today: "Today",
  week: "This week",
  later: "Later",
  completed: "Completed",
};

const BUCKET_ORDER: TaskBucket[] = ["past_due", "today", "week", "later", "completed"];

const main = document.querySelector<HTMLElement>("#dashboard");
if (!main) throw new Error("Dashboard root not found");

let openCount = Number(main.dataset.openCount ?? "0");
let subjectCount = Number(main.dataset.subjectCount ?? "0");

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toast(message: string, type = "error") {
  window.showToast?.(message, type);
}

function updateSubText() {
  const sub = main.querySelector<HTMLElement>(".page-head .sub");
  if (!sub) return;

  sub.textContent =
    openCount === 0
      ? `No open assignments across ${subjectCount} subjects.`
      : `You have ${openCount} open assignment${openCount === 1 ? "" : "s"} across ${subjectCount} subject${subjectCount === 1 ? "" : "s"}.`;
}

function getActiveSubjectFilter() {
  return (
    main.querySelector<HTMLButtonElement>("#subject-tabs .subject-tab[data-active='true']")?.dataset
      .subject ?? "all"
  );
}

function applySubjectFilter(subject = getActiveSubjectFilter()) {
  const cards = main.querySelectorAll<HTMLElement>(".task-card-wrapper");

  cards.forEach((card) => {
    const match = subject === "all" || card.dataset.subjectId === subject;
    card.hidden = !match;
  });

  main.querySelectorAll<HTMLElement>(".task-group").forEach((group) => {
    const visible = group.querySelectorAll(".task-card-wrapper:not([hidden])").length;
    group.hidden = visible === 0;
  });
}

function setActiveSubjectTab(subject: string) {
  main.querySelectorAll<HTMLButtonElement>("#subject-tabs .subject-tab").forEach((tab) => {
    tab.dataset.active = String((tab.dataset.subject ?? "all") === subject);
  });
  applySubjectFilter(subject);
}

function closeDeleteToggle(id: string) {
  const input = main.querySelector<HTMLInputElement>(`#${CSS.escape(id)}`);
  if (input) input.checked = false;
}

function clearTaskSelection() {
  main.querySelectorAll<HTMLElement>(".task-card-wrapper.is-selected").forEach((wrapper) => {
    wrapper.classList.remove("is-selected");
    wrapper.querySelector<HTMLButtonElement>("[data-task-select]")?.setAttribute("aria-pressed", "false");
  });
}

function selectTaskCard(wrapper: HTMLElement) {
  clearTaskSelection();
  wrapper.classList.add("is-selected");
  wrapper.querySelector<HTMLButtonElement>("[data-task-select]")?.setAttribute("aria-pressed", "true");
}

function duePillClass(dueStatus: TaskView["dueStatus"]) {
  return dueStatus !== "normal" ? dueStatus : "";
}

async function apiPost(form: HTMLFormElement): Promise<ApiResult> {
  const response = await fetch(form.action, {
    method: form.method,
    body: new FormData(form),
    headers: { Accept: "application/json" },
  });

  const data = (await response.json()) as ApiResult;

  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "Something went wrong");
  }

  return data;
}

function renderTaskCard(task: TaskView) {
  const wrapper = document.createElement("div");
  wrapper.className = "task-card-wrapper";
  wrapper.dataset.subjectId = task.subjectId ?? "";

  wrapper.innerHTML = `
    <article class="task-card" style="--subject-color: var(--subject-${esc(task.color)});">
      <div class="task-card-main">
        <form action="/api/tasks/toggle" method="post" class="task-check-form js-dashboard-form">
          <input type="hidden" name="id" value="${esc(task.id)}" />
          <label class="task-check-hit" title="${task.completed ? "Mark incomplete" : "Mark complete"}">
            <input
              type="checkbox"
              class="task-check"
              ${task.completed ? "checked" : ""}
              aria-label="Mark &quot;${esc(task.title)}&quot; ${task.completed ? "incomplete" : "complete"}"
            />
          </label>
        </form>
        <button type="button" class="task-select-area" data-task-select aria-pressed="false">
          <div class="task-body">
            <div class="task-top-row">
              <span class="subject-label">${esc(task.subjectName)}</span>
            </div>
            <p class="task-title">${esc(task.title)}</p>
            ${task.description ? `<p class="task-desc">${esc(task.description)}</p>` : ""}
          </div>
          <div class="due-pill ${duePillClass(task.dueStatus)}">
            <span class="day">${esc(task.day)}</span>
            <span class="date">${esc(task.date)}</span>
          </div>
        </button>
        <button type="button" class="btn btn-sm mark-done-btn js-mark-done${task.completed ? " is-complete" : ""}" data-task-id="${esc(task.id)}">
          ${task.completed
            ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Mark incomplete`
            : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Mark as done`}
        </button>
      </div>
      <div class="task-actions">
        <label for="edit-task-${esc(task.id)}" class="edit-btn" aria-label="Edit &quot;${esc(task.title)}&quot;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Edit
        </label>
        <input type="checkbox" id="menu-task-${esc(task.id)}" class="delete-toggle" hidden />
        <label for="menu-task-${esc(task.id)}" class="delete-backdrop" aria-hidden="true"></label>
        <label for="menu-task-${esc(task.id)}" class="task-delete-btn" aria-label="Delete &quot;${esc(task.title)}&quot;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
          Delete assignment
        </label>
        <div class="delete-confirm">
          <p>Delete this assignment?</p>
          <div class="delete-confirm-actions">
            <label for="menu-task-${esc(task.id)}" class="btn btn-ghost btn-sm">Cancel</label>
            <form action="/api/tasks/delete" method="post" class="js-dashboard-form">
              <input type="hidden" name="id" value="${esc(task.id)}" />
              <button type="submit" class="btn btn-danger btn-sm">Delete assignment</button>
            </form>
          </div>
        </div>
      </div>

      <input type="checkbox" id="edit-task-${esc(task.id)}" class="edit-toggle" hidden />
      <div class="edit-task-panel">
        <form action="/api/tasks/update" method="post" class="js-dashboard-form">
          <input type="hidden" name="id" value="${esc(task.id)}" />
          <div class="form-grid">
            <div class="field full">
              <label for="edit-title-${esc(task.id)}">Title</label>
              <input class="input" type="text" id="edit-title-${esc(task.id)}" name="title" value="${esc(task.title)}" required />
            </div>
            <div class="field">
              <label for="edit-due-${esc(task.id)}">Due date</label>
              <input class="input" type="date" id="edit-due-${esc(task.id)}" name="due_date" value="${esc(task.dueDate)}" required />
            </div>
            <div class="field full">
              <label for="edit-desc-${esc(task.id)}">Description</label>
              <textarea class="input" id="edit-desc-${esc(task.id)}" name="description" placeholder="Any notes — page numbers, instructions, what to bring.">${esc(task.description)}</textarea>
            </div>
          </div>
          <div class="form-actions">
            <label for="edit-task-${esc(task.id)}" class="btn btn-ghost">Cancel</label>
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </article>
  `;

  return wrapper;
}

function getOrCreateTaskGroup(bucket: TaskBucket) {
  let group = main.querySelector<HTMLElement>(`.task-group[data-bucket="${bucket}"]`);

  if (!group) {
    group = document.createElement("section");
    group.className = "task-group";
    group.dataset.bucket = bucket;
    group.innerHTML = `
      <p class="task-group-title">${BUCKET_TITLES[bucket]}</p>
      <div class="task-list"></div>
    `;

    const emptyState = main.querySelector(".empty-state");
    const insertBefore = BUCKET_ORDER.slice(BUCKET_ORDER.indexOf(group.dataset.bucket as TaskBucket) + 1)
      .map((key) => main.querySelector(`.task-group[data-bucket="${key}"]`))
      .find(Boolean);

    if (insertBefore) {
      main.insertBefore(group, insertBefore);
    } else if (emptyState) {
      main.insertBefore(group, emptyState);
    } else {
      main.appendChild(group);
    }
  }

  return group.querySelector<HTMLElement>(".task-list")!;
}

function insertTaskCard(task: TaskView) {
  const list = getOrCreateTaskGroup(task.bucket);
  const card = renderTaskCard(task);
  list.appendChild(card);
  return card;
}

function replaceTaskCard(task: TaskView) {
  const existing = main.querySelector<HTMLElement>(`.task-card-wrapper input[name="id"][value="${CSS.escape(task.id)}"]`)?.closest(".task-card-wrapper");
  const wasSelected = existing?.classList.contains("is-selected") ?? false;
  existing?.remove();

  const card = insertTaskCard(task);
  if (wasSelected) selectTaskCard(card);
  applySubjectFilter();
  return card;
}

function countOpenTasks() {
  return main.querySelectorAll<HTMLInputElement>(".task-check:not(:checked)").length;
}

function syncOpenCount() {
  openCount = countOpenTasks();
  updateSubText();
}

function removeEmptyGroups() {
  main.querySelectorAll<HTMLElement>(".task-group").forEach((group) => {
    if (group.querySelectorAll(".task-card-wrapper").length === 0) {
      group.remove();
    }
  });
}

function ensureClearAllButton() {
  if (main.querySelector(".page-head-actions")) return;

  const pageHead = main.querySelector(".page-head");
  if (!pageHead) return;

  const actions = document.createElement("div");
  actions.className = "page-head-actions";
  actions.innerHTML = `
    <input type="checkbox" id="clear-all-menu" class="delete-toggle" hidden />
    <label for="clear-all-menu" class="btn btn-ghost btn-sm">Clear all</label>
    <div class="delete-confirm">
      <p>Delete all assignments? This can't be undone.</p>
      <div class="delete-confirm-actions">
        <label for="clear-all-menu" class="btn btn-ghost btn-sm">Cancel</label>
        <form action="/api/tasks/clear" method="post" class="js-dashboard-form">
          <button type="submit" class="btn btn-primary btn-sm">Clear all</button>
        </form>
      </div>
    </div>
  `;
  pageHead.appendChild(actions);
}

function removeClearAllButton() {
  main.querySelector(".page-head-actions")?.remove();
}

function ensureEmptyState() {
  if (main.querySelector(".task-card-wrapper")) return;

  if (main.querySelector(".empty-state")) return;

  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = "No assignments yet. Add one above to get started.";
  main.appendChild(empty);
}

function removeEmptyState() {
  main.querySelector(".empty-state")?.remove();
}

function renderSubjectTab(subject: SubjectView) {
  const wrapper = document.createElement("div");
  wrapper.className = "subject-tab-wrapper";
  wrapper.dataset.subjectId = subject.id;
  wrapper.innerHTML = `
    <button
      type="button"
      class="subject-tab"
      data-subject="${esc(subject.id)}"
      style="color: var(--subject-${esc(subject.color)});"
    >
      <span class="swatch"></span> ${esc(subject.name)}
    </button>
    <div class="subject-actions">
      <input type="checkbox" id="menu-subject-${esc(subject.id)}" class="delete-toggle" hidden />
      <label for="menu-subject-${esc(subject.id)}" class="delete-btn" aria-label="Delete ${esc(subject.name)} subject">✕</label>
      <div class="delete-confirm">
        <p>Delete ${esc(subject.name)}? Its assignments won't be deleted.</p>
        <div class="delete-confirm-actions">
          <label for="menu-subject-${esc(subject.id)}" class="btn btn-ghost btn-sm">Cancel</label>
          <form action="/api/subjects/delete" method="post" class="js-dashboard-form">
            <input type="hidden" name="id" value="${esc(subject.id)}" />
            <button type="submit" class="btn btn-primary btn-sm">Delete</button>
          </form>
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function addSubjectOption(subject: SubjectView) {
  const select = main.querySelector<HTMLSelectElement>("#subject");
  if (!select) return;

  const placeholder = select.querySelector('option[value=""]');
  if (placeholder) placeholder.removeAttribute("selected");

  const option = document.createElement("option");
  option.value = subject.id;
  option.textContent = subject.name;
  select.appendChild(option);
}

function removeSubjectOption(id: string) {
  main.querySelector<HTMLSelectElement>(`#subject option[value="${CSS.escape(id)}"]`)?.remove();
}

main.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const markDone = target.closest<HTMLButtonElement>(".js-mark-done");
  if (markDone) {
    const wrapper = markDone.closest(".task-card-wrapper");
    const form = wrapper?.querySelector<HTMLFormElement>(".task-check-form.js-dashboard-form");
    const checkbox = form?.querySelector<HTMLInputElement>(".task-check");
    if (form && checkbox) {
      checkbox.checked = !checkbox.checked;
      form.requestSubmit();
    }
    return;
  }

  const selectArea = target.closest<HTMLButtonElement>("[data-task-select]");
  if (selectArea) {
    const wrapper = selectArea.closest<HTMLElement>(".task-card-wrapper");
    if (!wrapper) return;

    if (wrapper.classList.contains("is-selected")) {
      clearTaskSelection();
    } else {
      selectTaskCard(wrapper);
    }
    return;
  }

  if (!target.closest(".task-card-wrapper")) {
    clearTaskSelection();
  }
});

main.querySelector("#subject-tabs")?.addEventListener("click", (event) => {
  const tab = (event.target as Element).closest<HTMLButtonElement>(".subject-tab");
  if (!tab) return;

  const subject = tab.dataset.subject ?? "all";
  main.querySelectorAll<HTMLButtonElement>("#subject-tabs .subject-tab").forEach((item) => {
    item.dataset.active = String(item === tab);
  });
  applySubjectFilter(subject);
});

const addSubject = main.querySelector<HTMLDetailsElement>(".add-subject");
if (addSubject) {
  const closeAddSubject = () => {
    addSubject.open = false;
  };

  addSubject.querySelector(".add-subject-cancel")?.addEventListener("click", closeAddSubject);

  addSubject.addEventListener("click", (event) => {
    if (!addSubject.open) return;

    const target = event.target;
    if (!(target instanceof Node)) return;
    if (addSubject.querySelector(".add-subject-body")?.contains(target)) return;
    if (target instanceof Element && target.closest("summary")) return;

    closeAddSubject();
  });
}

main.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (!target.classList.contains("task-check")) return;

  const form = target.closest<HTMLFormElement>(".task-check-form.js-dashboard-form");
  if (!form) return;

  form.requestSubmit();
});

main.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (!form.classList.contains("js-dashboard-form")) return;

  event.preventDefault();

  const action = form.action;
  const submitter = event.submitter instanceof HTMLButtonElement ? event.submitter : null;

  if (submitter) {
    submitter.disabled = true;
  }

  try {
    const data = await apiPost(form);

    if (action.includes("/api/subjects/create") && data.subject) {
      const scroll = main.querySelector(".subject-tabs-scroll");
      scroll?.appendChild(renderSubjectTab(data.subject));
      addSubjectOption(data.subject);
      subjectCount += 1;
      updateSubText();

      form.reset();
      addSubject && (addSubject.open = false);
      toast("Subject added", "success");
      return;
    }

    if (action.includes("/api/subjects/delete") && data.id) {
      main.querySelector(`.subject-tab-wrapper[data-subject-id="${CSS.escape(data.id)}"]`)?.remove();
      removeSubjectOption(data.id);
      subjectCount = Math.max(0, subjectCount - 1);
      updateSubText();
      closeDeleteToggle(`menu-subject-${data.id}`);

      if (getActiveSubjectFilter() === data.id) {
        setActiveSubjectTab("all");
      }
      toast("Subject deleted", "success");
      return;
    }

    if (action.includes("/api/tasks/create") && data.task) {
      removeEmptyState();
      ensureClearAllButton();
      insertTaskCard(data.task);
      if (!data.task.completed) openCount += 1;
      updateSubText();
      applySubjectFilter();

      form.reset();
      const addTask = form.closest<HTMLDetailsElement>(".add-task");
      if (addTask) addTask.open = false;

      toast("Assignment added", "success");
      return;
    }

    if (action.includes("/api/tasks/update") && data.task) {
      replaceTaskCard(data.task);
      syncOpenCount();
      closeDeleteToggle(`edit-task-${data.task.id}`);
      toast("Assignment updated", "success");
      return;
    }

    if (action.includes("/api/tasks/toggle") && data.task) {
      replaceTaskCard(data.task);
      syncOpenCount();
      toast(data.task.completed ? "Assignment completed" : "Assignment reopened", "success");
      return;
    }

    if (action.includes("/api/tasks/delete") && data.id) {
      const card = main
        .querySelector<HTMLInputElement>(`.task-card-wrapper input[name="id"][value="${CSS.escape(data.id)}"]`)
        ?.closest(".task-card-wrapper");
      const wasOpen = card?.querySelector<HTMLInputElement>(".task-check:not(:checked)") !== null;
      card?.remove();
      if (wasOpen) openCount = Math.max(0, openCount - 1);

      clearTaskSelection();

      removeEmptyGroups();
      if (!main.querySelector(".task-card-wrapper")) {
        ensureEmptyState();
        removeClearAllButton();
        openCount = 0;
      }

      updateSubText();
      applySubjectFilter();
      closeDeleteToggle(`menu-task-${data.id}`);
      toast("Assignment deleted", "success");
      return;
    }

    if (action.includes("/api/tasks/clear")) {
      main.querySelectorAll(".task-group").forEach((group) => group.remove());
      ensureEmptyState();
      removeClearAllButton();
      openCount = 0;
      updateSubText();
      closeDeleteToggle("clear-all-menu");
      toast("All assignments cleared", "success");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    toast(message, "error");

    if (form.classList.contains("task-check-form")) {
      const checkbox = form.querySelector<HTMLInputElement>(".task-check");
      if (checkbox) checkbox.checked = !checkbox.checked;
    }
  } finally {
    if (submitter) {
      submitter.disabled = false;
    }
  }
});

applySubjectFilter();
