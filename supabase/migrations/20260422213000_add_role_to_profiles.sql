alter table public.profiles
add column if not exists role text not null default 'student';

update public.profiles
set role = coalesce(role, 'student')
where role is null;
