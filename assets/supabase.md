# Supabase Integration Notes (Frontend-Only Mode)

This project supports a direct browser integration with Supabase as an alternative to the backend proxy approach. Enable it for simpler demos or environments where strict security requirements are relaxed and robust RLS is enforced.

Mode toggle:
- Set REACT_APP_FEATURE_FLAGS to include FLAG_SUPABASE_MODE=true (JSON) or FLAG_SUPABASE_MODE in list form.

Environment variables required:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY (preferred) or REACT_APP_SUPABASE_ANON_KEY (legacy alias)

Client initialization:
- src/lib/supabaseClient.js uses createClient(url, anonKey) with auth.persistSession=true and PKCE

Auth:
- AuthContext uses supabase.auth.getSession() and onAuthStateChange
- Profile role is read from profiles table by id
- LoginPage offers email/password sign in/up and magic link (signInWithOtp)

Tables and RLS (assumptions):
- profiles(id uuid pk, full_name text, role text)
  - RLS: user can select and update where id = auth.uid()
- learning_paths(id uuid pk, title text, description text, created_at)
  - RLS: select for authenticated users; insert/update/delete restricted to instructors/admins
- courses(id uuid pk, title text, description text, instructor text, path_id uuid, video_url text, embed_url text, created_at)
  - RLS: select for authenticated users; insert/update/delete restricted to instructors/admins
- enrollments(user_id uuid, course_id uuid, status text, created_at)
  - RLS: select/insert/update where user_id = auth.uid()
- user_course_progress(user_id uuid, course_id uuid, progress_percent int, status text, time_spent_seconds int, updated_at)
  - RLS: select/insert/update where user_id = auth.uid()
- course_lessons(id uuid pk default gen_random_uuid(), course_id uuid references public.courses(id) on delete cascade, title text not null, thumbnail text null, duration int null, sequence int not null, created_at timestamptz default now())
  - Index/constraint: unique(course_id, title) to support idempotent upserts
  - RLS:
    - Enable RLS
    - SELECT: authenticated users
    - INSERT/UPDATE/DELETE: only for instructors/admins (based on profiles.role)
      Example policies below.

SQL DDL (example):
```sql
-- Table
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

-- RLS
alter table public.course_lessons enable row level security;

-- Allow authenticated users to read lessons
create policy if not exists "course_lessons_select_authenticated"
on public.course_lessons
for select
to authenticated
using (true);

-- Only instructors/admins can modify lessons
-- This assumes profiles(id=auth.uid(), role in ['admin','instructor'])
create policy if not exists "course_lessons_write_admins"
on public.course_lessons
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','instructor')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','instructor')
  )
);
```

Seeding lessons from frontend:
- Ensure feature flags: FLAG_SUPABASE_MODE=true and FLAG_ALLOW_SEED=true
- Open /health and click "Seed Course Lessons"
- Upserts in batches with onConflict=(course_id,title)
```

Service behavior:
- pathsService: selects from learning_paths; loads courses filtered by path_id
- coursesService: selects from courses; uses enrollments/user_course_progress to compute enrolled/status/progress and to upsert status transitions for enroll/start/complete
- progressService: derives user dashboards and simple admin stats from Supabase tables

Security:
- Do not use the service role key in frontend.
- Ensure RLS policies are correct before enabling Supabase mode.
- For production deployments with stricter controls, prefer backend proxy mode.
