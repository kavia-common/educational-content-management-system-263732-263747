# Supabase Setup Guide

This document defines the minimal Supabase schema, essential Row Level Security (RLS) policies, and required Auth provider configuration for OceanLMS. It is consistent with the current frontend code and supports both direct browser mode and backend-proxy mode.

## Overview

OceanLMS uses Supabase for:
- Authentication (email/password, magic link, and optional OAuth providers)
- Storage of learner profiles, learning paths, courses, modules, enrollments, and progress

Frontend behavior:
- The frontend reads REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY) and initializes a browser client.
- AuthContext looks up the user's profile from the profiles table by id = auth.uid(), creating one on first login if missing.
- Learning content is behind protected routes with role checks (e.g., admin-only authoring pages).

Security reminders:
- Never use the service role key in the browser.
- Enable and verify RLS on all tables before enabling browser mode.

## Environment Variables

Required for the prototype Supabase mode:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY (preferred) or REACT_APP_SUPABASE_KEY
- REACT_APP_FRONTEND_URL (used for redirectTo/emailRedirectTo)
- REACT_APP_HEALTHCHECK_PATH (e.g., /health)

Optional container variables:
- REACT_APP_BACKEND_URL
- REACT_APP_FEATURE_FLAGS
- REACT_APP_EXPERIMENTS_ENABLED

See also: lms_frontend/README.md for the full .env list and Quick Start.

## Minimal Schema (SQL)

Run these statements in Supabase SQL editor. Adjust names/types as needed.

```sql
-- Enable needed extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1) Profiles: one row per user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student',
  created_at timestamptz not null default now()
);

-- 2) Learning paths
create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 3) Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructor text,
  path_id uuid references public.learning_paths(id) on delete set null,
  video_url text,
  embed_url text,
  created_at timestamptz not null default now()
);

-- 4) Modules (course modules/lessons container)
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  sequence int not null default 1,
  created_at timestamptz not null default now()
);

-- 5) Enrollments (user-course relation)
create table if not exists public.enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'enrolled', -- enrolled|started|completed
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- 6) Progress per user per course
create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress_percent int not null default 0,
  status text not null default 'in_progress', -- in_progress|completed
  time_spent_seconds int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- 7) Optional: Fine-grained course lessons used by seeds
create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  thumbnail text null,
  duration int null,
  sequence int not null,
  created_at timestamptz not null default now()
);

-- Uniqueness for idempotent upserts
create unique index if not exists uq_course_lessons_course_title on public.course_lessons (course_id, title);
```

## RLS Policies

Enable RLS on all tables and add policies that tie access to the authenticated user and roles in profiles.role.

```sql
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.learning_paths enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.course_lessons enable row level security;

-- profiles (self read/update)
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- learning_paths: read for all authenticated; write for admin/instructor
drop policy if exists "learning_paths_read" on public.learning_paths;
create policy "learning_paths_read"
on public.learning_paths
for select
to authenticated
using (true);

drop policy if exists "learning_paths_write_roles" on public.learning_paths;
create policy "learning_paths_write_roles"
on public.learning_paths
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor')
  )
)
with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor')
  )
);

-- courses: read for all authenticated; write for admin/instructor
drop policy if exists "courses_read" on public.courses;
create policy "courses_read"
on public.courses
for select
to authenticated
using (true);

drop policy if exists "courses_write_roles" on public.courses;
create policy "courses_write_roles"
on public.courses
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor')
  )
)
with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor')
  )
);

-- modules: read for all authenticated; write for admin/instructor
drop policy if exists "modules_read" on public.modules;
create policy "modules_read"
on public.modules
for select
to authenticated
using (true);

drop policy if exists "modules_write_roles" on public.modules;
create policy "modules_write_roles"
on public.modules
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor')
  )
)
with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor')
  )
);

-- enrollments: user can manage their own rows
drop policy if exists "enrollments_user_rw" on public.enrollments;
create policy "enrollments_user_rw"
on public.enrollments
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- progress: user can manage their own rows
drop policy if exists "progress_user_rw" on public.progress;
create policy "progress_user_rw"
on public.progress
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- course_lessons: read for all authenticated; write for admin/instructor
drop policy if exists "course_lessons_read" on public.course_lessons;
create policy "course_lessons_read"
on public.course_lessons
for select
to authenticated
using (true);

drop policy if exists "course_lessons_write_roles" on public.course_lessons;
create policy "course_lessons_write_roles"
on public.course_lessons
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor')
  )
)
with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor')
  )
);
```

## Auth Provider Setup

In Supabase Dashboard > Authentication > Providers:
- Enable Email/Password
- Optionally enable OAuth providers used by the UI: Google, GitHub, Microsoft
  - Configure provider client IDs/secrets
  - Ensure authorized redirect URIs include the callback route

Required Redirect URLs (Dashboard > Authentication > URL Configuration):
- http://localhost:3000/oauth/callback
- http://localhost:3000/signin
- Production equivalents, for example:
  - https://yourdomain.com/oauth/callback
  - https://yourdomain.com/signin

Frontend expects:
- Email confirmations redirect to /signin
- OAuth flows redirect to /oauth/callback

These values are derived using REACT_APP_FRONTEND_URL in AuthContext helpers.

## First-Time Setup Flow

1) Create the schema and RLS policies above in Supabase.
2) Ensure "Enable email confirmations" and Email provider as desired.
3) Add the Redirect URLs to Auth settings.
4) In your application:
   - Create lms_frontend/.env (copy .env.example if available)
   - Set REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, REACT_APP_FRONTEND_URL, REACT_APP_HEALTHCHECK_PATH
   - npm install && npm start
   - Navigate to /signup to create a user
5) Insert a profile row for your new user (or create an insert trigger to auto-create profiles):

```sql
insert into public.profiles (id, full_name, role)
values ('<auth_user_id>', 'Admin User', 'admin');
```

Optional trigger to auto-create profile on signup:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'student');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

Note: Use security definer appropriately and ensure privileges.

## Seeding Course Lessons

- Ensure FLAG_SUPABASE_MODE=true and, if implemented, FLAG_ALLOW_SEED=true in REACT_APP_FEATURE_FLAGS.
- Open /health in the running app and click "Seed Course Lessons".
- The seed uses an upsert on (course_id, title) into public.course_lessons.

## Troubleshooting

- RLS “permission denied” or empty results:
  - Verify authentication and that RLS policies permit the operation.
  - Confirm a profiles row exists for your user with the correct role.

- Cannot insert enrollments/progress:
  - Ensure payload has user_id = auth.uid().
  - Policies must include with check (user_id = auth.uid()).

- OAuth/magic link redirect errors:
  - Add http://localhost:3000/oauth/callback and http://localhost:3000/signin to Redirect URLs.
  - Ensure REACT_APP_FRONTEND_URL matches your development origin.

- “Missing env vars” warnings:
  - Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY) in lms_frontend/.env.

- Admin-only pages inaccessible:
  - Ensure your profiles.role = 'admin' and policies allow writes for admin/instructor.

## References

- lms_frontend/src/context/AuthContext.js
- lms_frontend/src/supabaseClient.js
- lms_frontend/README.md
