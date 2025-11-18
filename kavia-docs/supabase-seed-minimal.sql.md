# Supabase Minimal Seed Script (Learning Paths, Courses, Lessons)

## Overview

This document provides a minimal, idempotent SQL seed script for Supabase that inserts a handful of learning paths, courses mapped to those paths, and lessons mapped to courses. The statements use conflict handling to avoid duplicate inserts and can be run multiple times safely.

This seed aligns with the existing schema and RLS defined in supabase-lms-schema-rls.md:
- Tables: learning_paths, courses, lessons
- Relationships: courses.path_id -> learning_paths.id, lessons.course_id -> courses.id
- Primary keys: bigserial ids
- RLS: authenticated users can select catalog; admin role required for inserts/updates/deletes

## How to Run (Supabase SQL Editor)

1. Open Supabase Dashboard for your project.
2. Go to SQL → New query.
3. Paste the SQL from the Seed Script section below.
4. If you have RLS enabled and are running as anon (not service role), ensure you temporarily run this as the SQL Editor (which uses elevated privileges) or that your current session role is permitted to insert (admin). The SQL Editor in the dashboard runs with sufficient privileges by default.
5. Execute the query. You can rerun safely; the script uses ON CONFLICT or filtered inserts to remain idempotent.

Tip:
- After running seeds, verify data:
  - select * from public.learning_paths;
  - select * from public.courses order by path_id, id;
  - select * from public.lessons order by course_id, id;

## Seed Script

```sql
-- =====================================================================
-- Minimal Catalog Seed (idempotent): learning_paths, courses, lessons
-- Safe to re-run. Designed for schema from supabase-lms-schema-rls.md.
-- =====================================================================

-- 1) Insert learning paths (avoids duplicates by unique title filter)
insert into public.learning_paths (title, description, thumbnail)
select x.title, x.description, x.thumbnail
from (values
  ('Onboarding', 'Welcome to the company, core policies, culture, and tools.', null),
  ('Web Development Basics', 'Foundations of HTML, CSS, and JavaScript.', null),
  ('Data Literacy', 'Introductory data skills for business users.', null)
) as x(title, description, thumbnail)
where not exists (
  select 1 from public.learning_paths lp where lp.title = x.title
);

-- 2) Insert courses mapped to paths
-- We use SELECT with a WHERE title=... to fetch FK (path_id) and avoid duplicates by matching on course title within that path.
-- Course titles are assumed unique per path for this seed data.

-- Onboarding -> Company Orientation, Tools 101
insert into public.courses (path_id, title, description, thumbnail)
select lp.id, 'Company Orientation', 'Company overview: values, policies, and key contacts.', null
from public.learning_paths lp
where lp.title = 'Onboarding'
  and not exists (
    select 1 from public.courses c where c.title = 'Company Orientation' and c.path_id = lp.id
  );

insert into public.courses (path_id, title, description, thumbnail)
select lp.id, 'Tools 101', 'Intro to core internal tools and workflows.', null
from public.learning_paths lp
where lp.title = 'Onboarding'
  and not exists (
    select 1 from public.courses c where c.title = 'Tools 101' and c.path_id = lp.id
  );

-- Web Development Basics -> HTML & CSS Basics, JavaScript 101
insert into public.courses (path_id, title, description, thumbnail)
select lp.id, 'HTML & CSS Basics', 'Structure and style fundamentals for the web.', null
from public.learning_paths lp
where lp.title = 'Web Development Basics'
  and not exists (
    select 1 from public.courses c where c.title = 'HTML & CSS Basics' and c.path_id = lp.id
  );

insert into public.courses (path_id, title, description, thumbnail)
select lp.id, 'JavaScript 101', 'Intro to variables, types, and control flow.', null
from public.learning_paths lp
where lp.title = 'Web Development Basics'
  and not exists (
    select 1 from public.courses c where c.title = 'JavaScript 101' and c.path_id = lp.id
  );

-- Data Literacy -> Data Fundamentals
insert into public.courses (path_id, title, description, thumbnail)
select lp.id, 'Data Fundamentals', 'Understanding data types, sources, and quality.', null
from public.learning_paths lp
where lp.title = 'Data Literacy'
  and not exists (
    select 1 from public.courses c where c.title = 'Data Fundamentals' and c.path_id = lp.id
  );

-- 3) Insert lessons mapped to courses
-- Uses join by course title and NOT EXISTS to ensure idempotence. Duration is in seconds.

-- Company Orientation lessons
insert into public.lessons (course_id, title, duration, thumbnail, video_url)
select c.id, 'Welcome Message', 300, null, 'https://example.com/videos/welcome.mp4'
from public.courses c
join public.learning_paths lp on lp.id = c.path_id
where lp.title = 'Onboarding'
  and c.title = 'Company Orientation'
  and not exists (
    select 1 from public.lessons l where l.course_id = c.id and l.title = 'Welcome Message'
  );

insert into public.lessons (course_id, title, duration, thumbnail, video_url)
select c.id, 'Policies Overview', 420, null, 'https://example.com/videos/policies.mp4'
from public.courses c
join public.learning_paths lp on lp.id = c.path_id
where lp.title = 'Onboarding'
  and c.title = 'Company Orientation'
  and not exists (
    select 1 from public.lessons l where l.course_id = c.id and l.title = 'Policies Overview'
  );

-- Tools 101 lessons
insert into public.lessons (course_id, title, duration, thumbnail, video_url)
select c.id, 'Accounts & Access', 360, null, 'https://example.com/videos/accounts-access.mp4'
from public.courses c
join public.learning_paths lp on lp.id = c.path_id
where lp.title = 'Onboarding'
  and c.title = 'Tools 101'
  and not exists (
    select 1 from public.lessons l where l.course_id = c.id and l.title = 'Accounts & Access'
  );

-- HTML & CSS Basics lessons
insert into public.lessons (course_id, title, duration, thumbnail, video_url)
select c.id, 'HTML Structure', 480, null, 'https://example.com/videos/html-structure.mp4'
from public.courses c
join public.learning_paths lp on lp.id = c.path_id
where lp.title = 'Web Development Basics'
  and c.title = 'HTML & CSS Basics'
  and not exists (
    select 1 from public.lessons l where l.course_id = c.id and l.title = 'HTML Structure'
  );

insert into public.lessons (course_id, title, duration, thumbnail, video_url)
select c.id, 'CSS Selectors', 540, null, 'https://example.com/videos/css-selectors.mp4'
from public.courses c
join public.learning_paths lp on lp.id = c.path_id
where lp.title = 'Web Development Basics'
  and c.title = 'HTML & CSS Basics'
  and not exists (
    select 1 from public.lessons l where l.course_id = c.id and l.title = 'CSS Selectors'
  );

-- JavaScript 101 lessons
insert into public.lessons (course_id, title, duration, thumbnail, video_url)
select c.id, 'Variables and Types', 600, null, 'https://example.com/videos/js-variables.mp4'
from public.courses c
join public.learning_paths lp on lp.id = c.path_id
where lp.title = 'Web Development Basics'
  and c.title = 'JavaScript 101'
  and not exists (
    select 1 from public.lessons l where l.course_id = c.id and l.title = 'Variables and Types'
  );

insert into public.lessons (course_id, title, duration, thumbnail, video_url)
select c.id, 'Control Flow Basics', 540, null, 'https://example.com/videos/js-control-flow.mp4'
from public.courses c
join public.learning_paths lp on lp.id = c.path_id
where lp.title = 'Web Development Basics'
  and c.title = 'JavaScript 101'
  and not exists (
    select 1 from public.lessons l where l.course_id = c.id and l.title = 'Control Flow Basics'
  );

-- Data Fundamentals lessons
insert into public.lessons (course_id, title, duration, thumbnail, video_url)
select c.id, 'What is Data?', 420, null, 'https://example.com/videos/what-is-data.mp4'
from public.courses c
join public.learning_paths lp on lp.id = c.path_id
where lp.title = 'Data Literacy'
  and c.title = 'Data Fundamentals'
  and not exists (
    select 1 from public.lessons l where l.course_id = c.id and l.title = 'What is Data?'
  );
```

## Notes and Variations

- If you prefer explicit ON CONFLICT clauses, add unique constraints that match business keys, for example:
  - unique(title) on learning_paths if titles are unique in your org
  - unique(path_id, title) on courses to prevent duplicates per path
  - unique(course_id, title) on lessons to prevent duplicates per course

Then the insert statements can use:
- insert ... on conflict (path_id, title) do nothing;
- insert ... on conflict (course_id, title) do nothing;

The current script uses NOT EXISTS filters so it works even if you have not created those unique indexes.

- RLS considerations: The Supabase SQL Editor runs with elevated permissions and bypasses RLS checks; if you want to run this via application code with anon key, ensure that the current user has admin role and that write policies allow the operation.

- Frontend alignment: This seed provides enough data for:
  - Paths list and details
  - Course list and details
  - Lessons list and player pages

## Sources

- educational-content-management-system-263732-263747/kavia-docs/supabase-lms-schema-rls.md
- educational-content-management-system-263732-263747/lms_frontend/README.md
- educational-content-management-system-263732-263747/assets/supabase.md
