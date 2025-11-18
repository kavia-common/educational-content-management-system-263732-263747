# Supabase LMS Schema and RLS Policies

## Overview

This document provides a ready-to-run SQL script for Supabase to support an LMS with PKCE auth (no anon key), admin and employee roles, and strict Row Level Security (RLS). It defines tables, foreign keys, indexes, helper functions for role checks, RLS policies, and optional seed data. The script is ordered safely for execution in the Supabase SQL editor.

Key points:
- Profiles are linked to auth.users by id (uuid), with roles restricted to 'admin' or 'employee'.
- Employees can read the catalog (paths, courses, lessons), read/write only their own enrollments and progress, and read their own profile.
- Admins have full CRUD on the catalog and can view/edit all enrollments and progress.
- RLS uses auth.uid() and role checks via public.profile_role(current_setting('request.jwt.claim.sub')).
- Timestamps include created_at default now() and updated_at triggers for automatic maintenance.
- Optional seed data controlled by setting `app.seed` to 'true'.

## Ready-to-run SQL

```sql
-- =====================================================================
-- Supabase LMS Schema + RLS (PKCE, no anon key scenario)
-- Safe execution order: extensions -> schema/tables -> constraints/indexes
-- -> helper functions/views -> RLS enablement -> policies -> optional seeds
-- =====================================================================

-- 0) Extensions (safe, idempotent)
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- 1) Schema (optional isolation, using public for simplicity)
-- Using public schema for all objects to reduce cross-schema privilege complexity.

-- 2) Tables

-- 2.1 profiles
-- Linked to auth.users.id, tracks application role.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null check (role in ('admin', 'employee')),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.2 learning_paths (catalog)
create table if not exists public.learning_paths (
  id bigserial primary key,
  title text not null,
  description text,
  thumbnail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.3 courses (catalog)
create table if not exists public.courses (
  id bigserial primary key,
  path_id bigint not null,
  title text not null,
  description text,
  thumbnail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_courses_path
    foreign key (path_id) references public.learning_paths(id) on delete cascade
);

-- 2.4 lessons (catalog)
create table if not exists public.lessons (
  id bigserial primary key,
  course_id bigint not null,
  title text not null,
  duration int, -- seconds
  thumbnail text,
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_lessons_course
    foreign key (course_id) references public.courses(id) on delete cascade
);

-- 2.5 enrollments (user-course enrollment)
create table if not exists public.enrollments (
  id bigserial primary key,
  user_id uuid not null,
  course_id bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_enroll_user
    foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint fk_enroll_course
    foreign key (course_id) references public.courses(id) on delete cascade,
  constraint uq_enroll unique (user_id, course_id)
);

-- 2.6 course_progress (user-lesson completion)
create table if not exists public.course_progress (
  id bigserial primary key,
  user_id uuid not null,
  course_id bigint not null,
  lesson_id bigint not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_progress_user
    foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint fk_progress_course
    foreign key (course_id) references public.courses(id) on delete cascade,
  constraint fk_progress_lesson
    foreign key (lesson_id) references public.lessons(id) on delete cascade,
  constraint uq_progress unique (user_id, lesson_id)
);

-- 3) Indexes (FKs + common filters)
-- profiles
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- learning_paths
create index if not exists idx_learning_paths_created_at on public.learning_paths(created_at);

-- courses
create index if not exists idx_courses_path_id on public.courses(path_id);
create index if not exists idx_courses_created_at on public.courses(created_at);

-- lessons
create index if not exists idx_lessons_course_id on public.lessons(course_id);
create index if not exists idx_lessons_created_at on public.lessons(created_at);

-- enrollments
create index if not exists idx_enrollments_user_id on public.enrollments(user_id);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);
create index if not exists idx_enrollments_created_at on public.enrollments(created_at);

-- course_progress
create index if not exists idx_progress_user_id on public.course_progress(user_id);
create index if not exists idx_progress_course_id on public.course_progress(course_id);
create index if not exists idx_progress_lesson_id on public.course_progress(lesson_id);
create index if not exists idx_progress_is_completed on public.course_progress(is_completed);
create index if not exists idx_progress_created_at on public.course_progress(created_at);

-- 4) Updated_at trigger function and triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach triggers
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_learning_paths_updated_at on public.learning_paths;
create trigger trg_learning_paths_updated_at
before update on public.learning_paths
for each row execute function public.set_updated_at();

drop trigger if exists trg_courses_updated_at on public.courses;
create trigger trg_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists trg_enrollments_updated_at on public.enrollments;
create trigger trg_enrollments_updated_at
before update on public.enrollments
for each row execute function public.set_updated_at();

drop trigger if exists trg_course_progress_updated_at on public.course_progress;
create trigger trg_course_progress_updated_at
before update on public.course_progress
for each row execute function public.set_updated_at();

-- 5) Helper: read role for a given user id (uuid), defaulting safely
-- Note: request.jwt.claim.sub contains the auth.uid() as a string when authenticated.
create or replace function public.profile_role(uid uuid)
returns text
language sql
stable
as $$
  select coalesce(
    (select role from public.profiles p where p.id = uid),
    'employee'  -- default assumption if profile not yet created
  );
$$;

-- Convenience helper for current request user (uses JWT claim)
create or replace function public.current_role()
returns text
language sql
stable
as $$
  select public.profile_role(nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);
$$;

-- 6) RLS enablement
alter table public.profiles enable row level security;
alter table public.learning_paths enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.course_progress enable row level security;

-- 7) Policies

-- 7.1 profiles
-- Employees can select their own profile only; admins can select all.
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
on public.profiles
for select
using (
  (auth.uid() = id)
  or (public.current_role() = 'admin')
);

-- Allow users to update only their own profile; admins can update all.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles
for update
using (
  (auth.uid() = id) or (public.current_role() = 'admin')
)
with check (
  (auth.uid() = id) or (public.current_role() = 'admin')
);

-- Prevent inserts/deletes by normal users via RLS; admins allowed
drop policy if exists profiles_insert_admin on public.profiles;
create policy profiles_insert_admin
on public.profiles
for insert
to authenticated
with check (public.current_role() = 'admin');

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin
on public.profiles
for delete
to authenticated
using (public.current_role() = 'admin');

-- 7.2 learning_paths (catalog)
-- All authenticated can read catalog; only admins can write.
drop policy if exists paths_select_all on public.learning_paths;
create policy paths_select_all
on public.learning_paths
for select
to authenticated
using (true);

drop policy if exists paths_admin_write on public.learning_paths;
create policy paths_admin_write
on public.learning_paths
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- 7.3 courses (catalog)
drop policy if exists courses_select_all on public.courses;
create policy courses_select_all
on public.courses
for select
to authenticated
using (true);

drop policy if exists courses_admin_write on public.courses;
create policy courses_admin_write
on public.courses
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- 7.4 lessons (catalog)
drop policy if exists lessons_select_all on public.lessons;
create policy lessons_select_all
on public.lessons
for select
to authenticated
using (true);

drop policy if exists lessons_admin_write on public.lessons;
create policy lessons_admin_write
on public.lessons
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- 7.5 enrollments
-- Select: user can see own or admin can see all
drop policy if exists enrollments_select_own_or_admin on public.enrollments;
create policy enrollments_select_own_or_admin
on public.enrollments
for select
to authenticated
using (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
);

-- Insert: user can enroll self or admin can enroll anyone
drop policy if exists enrollments_insert_self_or_admin on public.enrollments;
create policy enrollments_insert_self_or_admin
on public.enrollments
for insert
to authenticated
with check (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
);

-- Update/Delete: user can manage own enrollment or admin can manage all
drop policy if exists enrollments_update_self_or_admin on public.enrollments;
create policy enrollments_update_self_or_admin
on public.enrollments
for update
to authenticated
using (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
)
with check (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
);

drop policy if exists enrollments_delete_self_or_admin on public.enrollments;
create policy enrollments_delete_self_or_admin
on public.enrollments
for delete
to authenticated
using (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
);

-- 7.6 course_progress
-- Select: user can see own progress; admin can see all
drop policy if exists progress_select_own_or_admin on public.course_progress;
create policy progress_select_own_or_admin
on public.course_progress
for select
to authenticated
using (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
);

-- Insert: user can record own progress or admin can record for anyone
drop policy if exists progress_insert_self_or_admin on public.course_progress;
create policy progress_insert_self_or_admin
on public.course_progress
for insert
to authenticated
with check (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
);

-- Update/Delete: user can update own progress or admin can update all
drop policy if exists progress_update_self_or_admin on public.course_progress;
create policy progress_update_self_or_admin
on public.course_progress
for update
to authenticated
using (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
)
with check (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
);

drop policy if exists progress_delete_self_or_admin on public.course_progress;
create policy progress_delete_self_or_admin
on public.course_progress
for delete
to authenticated
using (
  (user_id = auth.uid()) or (public.current_role() = 'admin')
);

-- 8) Optional: seed data
-- To run seeds, first execute:
-- select set_config('app.seed','true', false);
do $$
begin
  if current_setting('app.seed', true) = 'true' then
    -- Minimal catalog seeds
    insert into public.learning_paths (title, description, thumbnail)
    values
      ('Onboarding', 'Welcome to the company', null),
      ('Web Development Basics', 'HTML/CSS/JS fundamentals', null)
    on conflict do nothing;

    insert into public.courses (path_id, title, description, thumbnail)
    select lp.id, 'Company Orientation', 'Policies, culture, tools', null
    from public.learning_paths lp
    where lp.title = 'Onboarding'
    on conflict do nothing;

    insert into public.courses (path_id, title, description, thumbnail)
    select lp.id, 'JavaScript 101', 'Intro to JS', null
    from public.learning_paths lp
    where lp.title = 'Web Development Basics'
    on conflict do nothing;

    insert into public.lessons (course_id, title, duration, thumbnail, video_url)
    select c.id, 'Welcome Message', 300, null, 'https://example.com/videos/welcome.mp4'
    from public.courses c
    where c.title = 'Company Orientation'
    on conflict do nothing;

    insert into public.lessons (course_id, title, duration, thumbnail, video_url)
    select c.id, 'Variables and Types', 600, null, 'https://example.com/videos/js-variables.mp4'
    from public.courses c
    where c.title = 'JavaScript 101'
    on conflict do nothing;
  end if;
end$$;
```

## Usage Notes and How-to

### Auth and Profiles linkage
- Profiles.id references auth.users.id and is the canonical way to associate application data to the authenticated user. The frontend should create or upsert the profile after signup/login to ensure role is set.
- Roles: 'admin' and 'employee'. The default in helper functions assumes 'employee' if a profile row is missing.

### RLS and permissions
- Catalog (learning_paths, courses, lessons): all authenticated users can read; only admins can insert/update/delete.
- Enrollments and course_progress: regular users can only read and modify their own rows; admins can read and modify all.

### PKCE and keys
- Use Supabase PKCE flow from the frontend (supabase-js), without exposing service-role keys in the client. Ensure the project anon key is not used in production if you are strictly enforcing PKCE with server-side token exchange. In a pure client scenario, the public anon key is still typically used with PKCE; lock down RLS strictly as configured above.

### Redirect URLs
- Add the following to Supabase Authentication -> URL Configuration -> Redirect URLs:
  - http://localhost:3000/oauth/callback
  - https://your-domain/oauth/callback

### Storage bucket (videos)
- Create a storage bucket named 'videos' in Supabase Storage via the dashboard if you intend to manage videos there.
- If videos are public, configure public access or signed URLs as needed. The lessons.video_url can point to either signed URLs or public URLs.

### Seeds
- To seed initial catalog data, set the seed flag and rerun:
  - select set_config('app.seed','true', false);
  - Then run the script or just the DO block.
- Remove or set to false in production.

### Indices and performance
- Foreign key columns and common filter columns (user_id, course_id, path_id, lesson_id, is_completed, created_at) have indexes to support common queries used in dashboards and detail pages.

### Updated_at handling
- A generic trigger updates updated_at on every update operation for all main tables.

## Frontend Expectations Mapping

- profiles(id uuid pk, email text unique, role text check ('admin','employee'), created_at)
- learning_paths(id bigserial pk, title text, description text, thumbnail text, created_at)
- courses(id bigserial pk, path_id bigint fk, title text, description text, thumbnail text, created_at)
- lessons(id bigserial pk, course_id bigint fk, title text, duration int, thumbnail text, video_url text, created_at)
- enrollments(id bigserial pk, user_id uuid fk, course_id bigint fk, created_at, unique(user_id, course_id))
- course_progress(id bigserial pk, user_id uuid fk, course_id bigint fk, lesson_id bigint fk, is_completed boolean default false, completed_at timestamptz, created_at, unique(user_id, lesson_id))

This schema matches the frontend usage and includes additional fields (updated_at) managed automatically.

## Security Considerations

- All access is through RLS and auth.uid() checks. Ensure the client library is initialized with your Supabase URL and appropriate key for PKCE usage.
- Do not embed service role keys in the frontend. For administrative automations, use a secure server environment.

## Sources

- Frontend references and expected tables:
  - educational-content-management-system-263732-263747/README.md
  - educational-content-management-system-263732-263747/lms_frontend/README.md
  - educational-content-management-system-263732-263747/lms_frontend/src/App.js
