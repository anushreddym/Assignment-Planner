-- Run this in Supabase: SQL Editor → New query → paste → Run

create extension if not exists "pgcrypto";

-- Subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null check (color in (
    'blue', 'green', 'violet', 'orange', 'pink',
    'teal', 'yellow', 'red', 'slate', 'lime'
  )),
  created_at timestamptz not null default now()
);

create index if not exists subjects_user_id_idx on public.subjects (user_id);

-- Tasks (subject_id nullable so deleting a subject keeps its tasks)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete set null,
  title text not null,
  description text not null default '',
  due_date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- RLS
alter table public.subjects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "subjects_select_own" on public.subjects;
drop policy if exists "subjects_insert_own" on public.subjects;
drop policy if exists "subjects_update_own" on public.subjects;
drop policy if exists "subjects_delete_own" on public.subjects;

create policy "subjects_select_own"
  on public.subjects for select
  using (auth.uid() = user_id);

create policy "subjects_insert_own"
  on public.subjects for insert
  with check (auth.uid() = user_id);

create policy "subjects_update_own"
  on public.subjects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subjects_delete_own"
  on public.subjects for delete
  using (auth.uid() = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);
