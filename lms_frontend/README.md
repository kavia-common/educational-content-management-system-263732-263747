# OceanLMS Frontend

React-based LMS frontend with two supported integration modes:

1) Backend proxy mode (default, recommended for production security):
- No Supabase client SDK in the browser
- Cookie-based sessions via secure backend
- All data via backend proxy endpoints

2) Direct Supabase browser mode (feature-flagged for simpler setups):
- Initializes Supabase client in the browser using anon key
- Uses RLS to limit data access
- Auth handled by supabase.auth (email/password, magic link)
- No service role key is ever used client-side

Security notes:
- No service role or private secrets in frontend code.
- In Supabase mode, the anon key is considered public. Ensure tight RLS policies.
- In proxy mode, the browser never sees Supabase keys or tokens.

## Current Demo Configuration: Authentication Disabled

For this deployment, sign-in is disabled and the app runs in guest/anonymous mode:
- All pages are publicly reachable without logging in.
- Route guards are permissive; authoring and admin dashboards are accessible.
- The TopNav hides login/logout controls and shows a Guest badge.
- The Login page is removed from routing and any legacy /login hits redirect to /dashboard.

Important implications:
- Any action that depends on authenticated backend/session (or Supabase RLS) may fail with 401/403 if your backend requires auth. In guest mode we do not redirect; UI should continue to function with whatever public data is available.
- Authoring endpoints typically require elevated permissions. You may need to:
  - Allow public access in your backend/proxy for demo purposes, or
  - Re-enable authentication before performing write operations.

How to re-enable authentication later:
- Restore PrivateRoute and role checks in src/context/AuthContext.js and src/App.js.
- Re-add /login and /oauth/callback routes in src/App.js.
- Switch AuthContext to call backend /auth/me or use Supabase mode (see sections below).
- Show login/logout controls in TopNav and role-aware links in Sidebar.

## Key Characteristics
- Routing with react-router-dom (v6)
- Ocean Professional theme (blue primary, amber secondary)
- Core pages: /dashboard, /paths, /paths/:id, /courses, /courses/:id, /assignments, /grades
  - Note: /login is intentionally not used while auth is disabled.

## Environment Variables
Create a `.env` using `.env.example` as reference:

Required/general:
- REACT_APP_FRONTEND_URL: This app URL used for redirects (e.g., https://app.oceanlms.example.com)
- REACT_APP_BACKEND_URL: Base URL for backend proxy (e.g., https://api.oceanlms.example.com)
- REACT_APP_FEATURE_FLAGS: JSON object or comma list
  - Enable Supabase mode by adding FLAG_SUPABASE_MODE=true (in JSON) or FLAG_SUPABASE_MODE (in list)
- REACT_APP_HEALTHCHECK_PATH: optional health path
- REACT_APP_EXPERIMENTS_ENABLED: "true"/"false"

Supabase mode (only used when FLAG_SUPABASE_MODE is enabled):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY

Additional container variables may exist:
- REACT_APP_API_BASE, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY

## Scripts
- `npm start` - start dev server
- `npm test` - test
- `npm run build` - production build

## Architecture
- src/lib/supabaseClient.js: client SDK and feature flag check (not used while auth is disabled)
- src/apiClient.js: backend proxy fetch wrapper (no 401 redirect in guest mode)
- src/context/AuthContext.js: guest/anonymous mode default user with role "admin" for full demo access
- src/services/*: paths/courses/progress switch between Supabase and proxy endpoints
- src/layouts and components: UI
- src/theme.js: theme variables applied to :root

## Supabase Browser Mode
Enable with REACT_APP_FEATURE_FLAGS containing FLAG_SUPABASE_MODE=true (if you re-enable auth).

Auth flow:
- On load, AuthContext calls supabase.auth.getSession() and subscribes to onAuthStateChange
- Profile role is fetched from 'profiles' table by user id (expects profiles.id = auth.user.id)
- Role-based UI gates rely on profile.role (admin, instructor, student)

Tables and RLS assumptions:
- profiles(id uuid pk, full_name text, role text) with RLS: user can select/update own row
- learning_paths(id uuid pk, title text, description text, ...): RLS: all authenticated can select; inserts/updates limited to instructors/admins
- courses(id uuid pk, title text, description text, instructor text, path_id uuid, video_url text, embed_url text): RLS: select for all authenticated; writes limited to instructors/admins
- enrollments(user_id uuid, course_id uuid, status text, created_at timestamptz): RLS: user can manage own rows
- user_course_progress(user_id uuid, course_id uuid, progress_percent int, status text, time_spent_seconds int, updated_at timestamptz): RLS: user can manage own rows

Security considerations:
- Only anon key in frontend; rely on RLS to scope data
- Never expose service role key
- Validate RLS policies to ensure users can only see their own enrollments/progress and public course/path data

## Backend Proxy Mode (Summary)
Same as described previously (see kavia-docs/backend-proxy-contract.md). When auth is re-enabled the app will use:
- GET /auth/me, /auth/login, /auth/logout
- /api/... endpoints for data

## Notes
- While auth is disabled, RLS-dependent actions may fail unless public access is allowed server-side.
- For production, re-enable authentication and restore route guards.

Player routing:
- The player lives at `/courses/:id` (CoursePlayerPage). Links from course lists and learning path courses point here for a consistent start/complete experience.
