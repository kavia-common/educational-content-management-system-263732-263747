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

## Quick Start (Prototype with Supabase)

1) Install dependencies:
   npm install

2) Create .env in lms_frontend root with:
   REACT_APP_SUPABASE_URL=<your_supabase_project_url>
   REACT_APP_SUPABASE_KEY=<anon_or_prototype_key>

   Warning: Using a service role key in the frontend is unsafe. This setup is for prototype/demo only.
   For production, use the anon key with strict RLS or route through a secure backend proxy.

3) Start:
   npm start

4) Open:
   - "/" Dashboard (shows Learning Paths)
   - "/paths/:id" Courses in a path
   - "/courses/:id" Course modules with simple video player

Environment guards:
- If REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY are missing, the console warns to aid debugging.

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

## Key Characteristics
- Routing with react-router-dom (v6)
- Ocean Professional theme (blue primary, amber secondary)
- Core pages: / (Dashboard), /paths, /paths/:id, /courses, /courses/:id, /assignments, /grades

## Environment Variables
Create a `.env` using `.env.example` as reference:

Prototype Supabase mode (used by newly added components):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY  (prototype only; prefer anon key with RLS)

General (existing):
- REACT_APP_FRONTEND_URL
- REACT_APP_BACKEND_URL
- REACT_APP_FEATURE_FLAGS
- REACT_APP_HEALTHCHECK_PATH
- REACT_APP_EXPERIMENTS_ENABLED
- and other container variables as needed.

Security warning:
- Do not use the service role key in the frontend.
- This repo’s supabaseClient is for prototype/demos. Migrate to anon key + RLS or a backend proxy later.

## Scripts
- `npm start` - start dev server
- `npm test` - test
- `npm run build` - production build

## Architecture
- src/supabaseClient.js: browser client using env vars (prototype mode)
- src/components/LearningPaths.jsx: fetch learning_paths
- src/components/Courses.jsx: fetch by path_id
- src/components/Modules.jsx: fetch by course_id
- src/components/VideoPlayer.jsx: simple HTML5 player
- src/pages/Dashboard.jsx, PathCourses.jsx, CourseModules.jsx: new pages and routing
- src/apiClient.js: backend proxy fetch wrapper
- src/services/*: existing services for proxy/Supabase (advanced flows)
- src/theme.js and src/styles/theme.css: Ocean Professional theme application

## Migration Recommendation
After prototyping:
- Replace REACT_APP_SUPABASE_KEY with the anon key and enforce RLS
- Or switch to backend proxy mode per kavia-docs/backend-proxy-contract.md
- Never ship a service role key in frontend builds
