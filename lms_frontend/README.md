# LMS Frontend (Ocean Professional)

React LMS frontend that uses Supabase as the sole data source.

## Supabase client usage (aligns with user's snippet)

We initialize a single Supabase browser client using:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY (public anon key only)

The client is created in `src/lib/supabaseClient.js` via:
- `createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_KEY)`
- PKCE auth flow with `persistSession` and `autoRefreshToken`
- A convenience `supabase` export (may be null if env vars are missing)
- Preferred `getSupabase()` accessor which throws if env is not set

Security note:
- Do NOT log or include the service role key in frontend code. Only use the anon/public key.

## Environment variables

Create `.env` in the `lms_frontend` folder with:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-public-anon-key
# Optional extras
REACT_APP_FEATURE_FLAGS={"FLAG_SUPABASE_MODE":true}
REACT_APP_HEALTHCHECK_PATH=/health
```

Auth Redirect URLs to configure in Supabase:
- http://localhost:3000/oauth/callback
- https://your-domain/oauth/callback

## Schema alignment

The app expects these tables and columns (based on our current Supabase schema):

- learning_paths(id, title, description, thumbnail, created_at)
  - Note: column is `thumbnail` (not `image_url`)
- courses(id, path_id, title, description, thumbnail, created_at)
  - Note: column is `thumbnail` (not `image_url`)
- lessons(id, course_id, title, video_url, thumbnail, created_at)
  - Used as “modules” equivalent in UI

Services map `thumbnail` to a UI-friendly `thumbnail_url` field.

## Routes

Public:
- /oauth/callback
- /paths
- /paths/:id
- /courses
- /courses/:id
- /lessons/:id (login required for write actions when auth is enabled)

Protected (effective once auth gating is enabled):
- /employee/dashboard
- /admin/dashboard
- /authoring/paths
- /authoring/courses
- /authoring/lessons

Home:
- / redirects to /admin/dashboard if role=admin else /employee/dashboard.

## Features

- Supabase PKCE with session persistence (anon public key client)
- Browsing: learning paths, courses (filtered by path), lessons (as modules)
- Enrollment/progress scaffolding using enrollments and course_progress tables
- Ocean Professional theme

## Development

- npm install
- npm start

If env vars are missing, data-fetching calls catch errors and render empty states; use `getSupabase()` in try/catch for explicit handling.
