create table if not exists public.teacher_homework_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  details text not null default '',
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  unique (teacher_id, student_id, title, created_at)
);

create index if not exists teacher_homework_assignments_teacher_id_idx
on public.teacher_homework_assignments (teacher_id);

create index if not exists teacher_homework_assignments_student_id_idx
on public.teacher_homework_assignments (student_id);

alter table public.teacher_homework_assignments enable row level security;

create policy "Homework visible to admins teachers and owning students"
on public.teacher_homework_assignments
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or teacher_id = auth.uid()
  or student_id = auth.uid()
);

create policy "Teachers create homework for their students"
on public.teacher_homework_assignments
for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and public.has_role(auth.uid(), 'teacher')
  and exists (
    select 1
    from public.teacher_student_assignments tsa
    where tsa.teacher_id = auth.uid()
      and tsa.student_id = teacher_homework_assignments.student_id
  )
);
