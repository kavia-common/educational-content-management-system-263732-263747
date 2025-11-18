# LMS Frontend (Ocean Professional)

React LMS frontend with Supabase PKCE auth and role-based dashboards.

## Environment

Create `.env` in this folder:

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_FEATURE_FLAGS (JSON or comma list; include FLAG_SUPABASE_MODE to enable Supabase client)
- REACT_APP_BACKEND_URL (optional proxy mode)
- REACT_APP_HEALTHCHECK_PATH (optional)

Example:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=public-anon-key
REACT_APP_FEATURE_FLAGS={"FLAG_SUPABASE_MODE":true}
```

Supabase redirect URLs:
- http://localhost:3000/oauth/callback
- https://your-domain/oauth/callback

## Routes

Public:
- /login
- /oauth/callback
- /paths
- /paths/:id
- /courses
- /courses/:id
- /lessons/:id (login required to mark complete)

Protected:
- /employee/dashboard
- /admin/dashboard
- /authoring/paths
- /authoring/courses
- /authoring/lessons

Home:
- / redirects to /admin/dashboard if role=admin else /employee/dashboard.

## Features

- Supabase PKCE with session persistence (no service role, anon key only)
- Role-based guards (ProtectedRoute, RequireRole)
- Browsing: learning paths, courses, lessons (video_url)
- Lesson completion upsert to course_progress
- Employee dashboard with simple charts
- Admin dashboard with entity counts and recent progress
- Admin CRUD pages for paths, courses, lessons
- Ocean Professional theme colors and cards

## Data/RLS

Tables expected:
- profiles(id, full_name, role, avatar_url)
- learning_paths(id, title, description, thumbnail_url, created_at)
- courses(id, title, description, thumbnail_url, path_id, instructor, video_url, embed_url, created_at)
- lessons(id, course_id, title, description, position, video_url, thumbnail_url)
- course_progress(id, user_id, lesson_id, is_completed, completed_at)

RLS examples:
- profiles: user can select/update own row
- course_progress: user can select own rows; insert/upsert only for auth.uid()

## Development

- npm install
- npm start

Set env vars before running. Charts render via simple SVG wrappers (no external lib).
