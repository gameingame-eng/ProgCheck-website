alter table public.student_schedules
add column if not exists start_time time;

alter table public.student_schedules
add column if not exists end_time time;

update public.student_schedules
set
  start_time = make_time(start_hour, 0, 0),
  end_time = make_time(end_hour, 0, 0)
where start_hour is not null
  and end_hour is not null
  and (start_time is null or end_time is null);

alter table public.student_schedules
drop constraint if exists student_schedules_time_range_check;

alter table public.student_schedules
add constraint student_schedules_time_range_check
check (
  (start_time is null and end_time is null)
  or (start_time is not null and end_time is not null and start_time < end_time)
);
