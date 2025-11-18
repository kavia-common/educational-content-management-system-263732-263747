# LMS Frontend (Ocean Professional)

React LMS frontend that uses Supabase as the sole data source.

## Supabase-only Mode (Required)

This frontend now operates exclusively against Supabase. Local demo data has been removed.

Required environment variables (put these in .env at project root `lms_frontend`):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_FEATURE_FLAGS (must include FLAG_SUPABASE_MODE=true)
- REACT_APP_HEALTHCHECK_PATH (optional)

Example .env:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=public-anon-key
REACT_APP_FEATURE_FLAGS={"FLAG_SUPABASE_MODE":true}
```

Supabase Auth Redirect URLs to configure in your Supabase project:
- http://localhost:3000/oauth/callback
- https://your-domain/oauth/callback

Note: Login route is temporarily disabled; the OAuth callback page is a no-op to keep navigation stable.

## Routes

Public:
- /oauth/callback
- /paths
- /paths/:id
- /courses
- /courses/:id
- /lessons/:id (login required to mark complete when auth is enabled)

Protected (effective when auth is re-enabled):
- /employee/dashboard
- /admin/dashboard
- /authoring/paths
- /authoring/courses
- /authoring/lessons

Home:
- / redirects to /admin/dashboard if role=admin else /employee/dashboard.

## Features

- Supabase PKCE with session persistence (anon public key client)
- Browsing: learning paths, courses, lessons
- Course progression and enrollment via enrollments and user_course_progress/course_progress tables
- Employee and Admin dashboards
- Ocean Professional theme

## Data/RLS

Tables expected:
- profiles(id, email, role)
- learning_paths(id, title, description, thumbnail_url, created_at)
- courses(id, title, description, thumbnail_url, path_id, instructor, video_url, embed_url, created_at)
- lessons(id, course_id, title, description, position, video_url, thumbnail_url)
- enrollments(user_id, course_id, status, created_at)
- course_progress(id, user_id, lesson_id, is_completed, completed_at)

RLS notes:
- profiles: user can select/update own row
- course_progress: user can select own rows; upsert for auth.uid()
- enrollments: user can upsert/select own rows

## Development

- npm install
- npm start

Ensure required env vars are set. Charts render via simple SVG wrappers (no external lib).
