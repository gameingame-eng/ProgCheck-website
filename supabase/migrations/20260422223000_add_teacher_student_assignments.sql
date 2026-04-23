create or replace function public.has_role(user_id uuid, wanted_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = wanted_role
  );
$$;

create table if not exists public.teacher_student_assignments (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid primary key references public.profiles (id) on delete cascade,
  assigned_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint teacher_student_assignments_teacher_is_teacher
    check (teacher_id = assigned_by)
);

create index if not exists teacher_student_assignments_teacher_id_idx
on public.teacher_student_assignments (teacher_id);

alter table public.teacher_student_assignments enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;

create policy "Profiles are visible by relationship"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
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

create policy "Teachers can view assignments and students can view their own"
on public.teacher_student_assignments
for select
to authenticated
using (
  public.has_role(auth.uid(), 'teacher')
  or student_id = auth.uid()
);

create policy "Teachers can self assign students"
on public.teacher_student_assignments
for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and assigned_by = auth.uid()
  and public.has_role(auth.uid(), 'teacher')
  and exists (
    select 1
    from public.profiles student_profile
    where student_profile.id = student_id
      and student_profile.role = 'student'
  )
  and not exists (
    select 1
    from public.teacher_student_assignments existing_assignment
    where existing_assignment.student_id = teacher_student_assignments.student_id
  )
);
