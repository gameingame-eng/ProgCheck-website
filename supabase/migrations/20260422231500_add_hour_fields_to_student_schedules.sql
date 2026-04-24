alter table public.student_schedules
add column if not exists start_hour smallint;

alter table public.student_schedules
add column if not exists end_hour smallint;

alter table public.student_schedules
drop constraint if exists student_schedules_start_hour_check;

alter table public.student_schedules
add constraint student_schedules_start_hour_check
check (start_hour is null or start_hour between 0 and 23);

alter table public.student_schedules
drop constraint if exists student_schedules_end_hour_check;

alter table public.student_schedules
add constraint student_schedules_end_hour_check
check (end_hour is null or end_hour between 1 and 24);

alter table public.student_schedules
drop constraint if exists student_schedules_hour_range_check;

alter table public.student_schedules
add constraint student_schedules_hour_range_check
check (
  (start_hour is null and end_hour is null)
  or (start_hour is not null and end_hour is not null and start_hour < end_hour)
);
