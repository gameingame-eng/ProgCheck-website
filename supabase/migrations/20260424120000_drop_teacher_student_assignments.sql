-- Drop policies that depend on teacher_student_assignments table
drop policy if exists "Profiles are visible by role and relationship" on public.profiles;
drop policy if exists "Profiles are visible by relationship" on public.profiles;
drop policy if exists "Teachers create homework for their students" on public.teacher_homework_assignments;
drop policy if exists "Teachers can view assignments and students can view their own" on public.teacher_student_assignments;
drop policy if exists "Teachers can self assign students" on public.teacher_student_assignments;

-- Drop the teacher_student_assignments table as teacher-student links are now managed through schedules
drop table if exists public.teacher_student_assignments;

-- Recreate profiles policy to check schedules instead of teacher_student_assignments
create policy "Profiles are visible by role and relationship"
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
      from public.student_schedules ss
      where ss.student_id = auth.uid()
        and ss.teacher_id = profiles.id
    )
  )
);

-- Recreate homework policy to check schedules instead of teacher_student_assignments
create policy "Teachers create homework for their students"
on public.teacher_homework_assignments
for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and public.has_role(auth.uid(), 'teacher')
  and exists (
    select 1
    from public.student_schedules ss
    where ss.teacher_id = auth.uid()
      and ss.student_id = teacher_homework_assignments.student_id
  )
);
