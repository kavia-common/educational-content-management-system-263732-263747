# OceanLMS Frontend

React-based LMS frontend with two supported integration modes:

1) Backend proxy mode (default, recommended for production security):
- No Supabase client SDK in the browser
- Cookie-based sessions via secure backend
- All data via backend proxy endpoints

2) Direct Supabase browser mode (feature-flagged for simpler setups):
- Initializes Supabase client in the browser using anon key
- Uses RLS to limit data access
- Auth handled by supabase.auth (PKCE)
- No service role key is ever used client-side

Security notes:
- No service role or private secrets in frontend code.
- In Supabase mode, the anon key is considered public. Ensure tight RLS policies.
- In proxy mode, the browser never sees Supabase keys or tokens.

## Authentication (Supabase PKCE Mode)

When `FLAG_SUPABASE_MODE` is enabled via `REACT_APP_FEATURE_FLAGS`, the app initializes a Supabase client with PKCE and session persistence:

- Client: `src/lib/supabaseClient.js` using:
  - `createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_KEY, { auth: { flowType: "pkce", persistSession: true, redirectTo: window.location.origin + "/oauth/callback" }})`
- AuthContext (`src/context/AuthContext.js`) loads the current session, subscribes to auth state changes, and fetches the user's role from the `profiles` table (`profiles.id = auth.user.id`).
- Protected routes: `src/routes/guards.js` provides `ProtectedRoute` and `RequireRole` to gate access.
- Role-based admin routes: require `profile.role` in `["admin","instructor"]`.

PKCE Redirect URLs:
- Add the following to your Supabase project's Auth Redirect URLs:
  - `https://<your-frontend-domain>/oauth/callback`
  - `http://localhost:3000/oauth/callback` (for local development)

Environment Variables for Supabase mode:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_FEATURE_FLAGS must contain `FLAG_SUPABASE_MODE=true`.

Notes:
- Email magic link is supported via `signInWithOtp` (see `src/lib/supabaseClient.js`).
- The OAuth provider configuration can also be used; Supabase handles PKCE redirects back to `/oauth/callback`.

## Current Demo Configuration

- Guest mode is still supported when `FLAG_SUPABASE_MODE` is not enabled.
- In guest mode, route guards are permissive and the app works without sign-in.
- When `FLAG_SUPABASE_MODE` is enabled, protected routes require a valid session, and admin routes require the correct role.

## Key Characteristics
- Routing with react-router-dom (v6)
- Ocean Professional theme (blue primary, amber secondary)
- Core pages: /dashboard, /paths, /paths/:id, /courses, /courses/:id, /assignments, /grades
- Auth pages: /login (email magic link), /oauth/callback (PKCE handler)

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
- REACT_APP_SUPABASE_KEY

Additional container variables may exist:
- REACT_APP_API_BASE, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY

## Scripts
- `npm start` - start dev server
- `npm test` - test
- `npm run build` - production build

## Architecture
- src/lib/supabaseClient.js: client SDK and feature flag check
- src/routes/guards.js: ProtectedRoute and RequireRole
- src/apiClient.js: backend proxy fetch wrapper
- src/context/AuthContext.js: Supabase or guest mode session/profile
- src/services/*: paths/courses/progress switch between Supabase and proxy endpoints
- src/layouts and components: UI
- src/theme.js: theme variables applied to :root

## Database Tables and RLS (assumptions)
- profiles(id uuid pk, full_name text, role text) with RLS: user can select/update own row
- learning_paths(id uuid pk, title text, description text, thumbnail, created_at)
- courses(id uuid pk, title text, description text, instructor text, path_id uuid, thumbnail, video_url text, embed_url text, created_at)
- enrollments(user_id uuid, course_id uuid, status text, created_at timestamptz)
- user_course_progress(user_id uuid, course_id uuid, progress_percent int, status text, time_spent_seconds int, updated_at timestamptz)
- course_lessons(id uuid pk default gen_random_uuid(), course_id uuid references courses(id), title text, thumbnail text null, duration int null, sequence int not null)
  - Unique index on (course_id, title) recommended for idempotent upserts
  - RLS: select for authenticated users; insert/update/delete restricted to instructors/admins

## Seeding Course Lessons (Frontend-only, Feature-flagged)
See Health page and `src/seeds/lessonsSeed.js`. Enable both flags:
- `FLAG_SUPABASE_MODE=true`
- `FLAG_ALLOW_SEED=true`

Navigate to `/health` and click "Seed Course Lessons". This runs idempotent upserts.

## Backend Proxy Mode (Summary)
Same as described previously (see kavia-docs/backend-proxy-contract.md).

## Notes
- In protected mode, unauthorized users are redirected to /login.
- Admin/authoring pages are gated with `RequireRole(["admin","instructor"])`.
- RLS-friendly queries are used in Supabase mode, scoping by `auth.uid()` for user data.
