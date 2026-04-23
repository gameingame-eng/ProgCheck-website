alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check
check (role in ('student', 'teacher', 'admin'));

drop policy if exists "Profiles are visible by relationship" on public.profiles;

create policy "Profiles are visible by role and relationship"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.has_role(auth.uid(), 'admin')
  or (
    public.has_role(auth.uid(), 'teacher')
    and role = 'student'
  )
  or (
    role = 'teacher'
    and exists (
      select 1
      from public.teacher_student_assignments tsa
      where tsa.student_id = auth.uid()
        and tsa.teacher_id = profiles.id
    )
  )
);

drop policy if exists "Teachers can view assignments and students can view their own" on public.teacher_student_assignments;
drop policy if exists "Teachers can self assign students" on public.teacher_student_assignments;

create policy "Assignments visible to admins teachers and linked students"
on public.teacher_student_assignments
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or teacher_id = auth.uid()
  or student_id = auth.uid()
);

create policy "Admins manage assignments"
on public.teacher_student_assignments
for insert
to authenticated
with check (
  assigned_by = auth.uid()
  and public.has_role(auth.uid(), 'admin')
  and exists (
    select 1
    from public.profiles teacher_profile
    where teacher_profile.id = teacher_id
      and teacher_profile.role = 'teacher'
  )
  and exists (
    select 1
    from public.profiles student_profile
    where student_profile.id = student_id
      and student_profile.role = 'student'
  )
);

create policy "Admins can update assignments"
on public.teacher_student_assignments
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (
  assigned_by = auth.uid()
  and public.has_role(auth.uid(), 'admin')
);

create table if not exists public.student_schedules (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  details text not null default '',
  scheduled_for date,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists student_schedules_student_id_idx
on public.student_schedules (student_id);

alter table public.student_schedules enable row level security;

create policy "Schedules visible to admins linked teachers and owning students"
on public.student_schedules
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or student_id = auth.uid()
  or exists (
    select 1
    from public.teacher_student_assignments tsa
    where tsa.student_id = student_schedules.student_id
      and tsa.teacher_id = auth.uid()
  )
);

create policy "Admins create schedules"
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
);
