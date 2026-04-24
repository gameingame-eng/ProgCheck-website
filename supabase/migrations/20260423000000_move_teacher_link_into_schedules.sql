alter table public.student_schedules
add column if not exists teacher_id uuid references public.profiles (id) on delete set null;

create index if not exists student_schedules_teacher_id_idx
on public.student_schedules (teacher_id);

drop policy if exists "Schedules visible to admins linked teachers and owning students" on public.student_schedules;
drop policy if exists "Admins create schedules" on public.student_schedules;

create policy "Schedules visible to admins teachers and owning students"
on public.student_schedules
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or student_id = auth.uid()
  or teacher_id = auth.uid()
);

create policy "Admins create schedules with teachers"
on public.student_schedules
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_role(auth.uid(), 'admin')
  and exists (
    select 1
    from public.profiles student_profile
    where student_profile.id = student_id
      and student_profile.role = 'student'
  )
  and exists (
    select 1
    from public.profiles teacher_profile
    where teacher_profile.id = teacher_id
      and teacher_profile.role = 'teacher'
  )
);
