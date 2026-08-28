-- Run in Supabase SQL Editor if you already created the tables earlier.
-- Expands allowed subject colors.

alter table public.subjects
  drop constraint if exists subjects_color_check;

alter table public.subjects
  add constraint subjects_color_check
  check (color in (
    'blue', 'green', 'violet', 'orange', 'pink',
    'teal', 'yellow', 'red', 'slate', 'lime'
  ));
