# OceanLMS Frontend

React-based LMS frontend with two integration modes:

1) Backend proxy mode (recommended for production security)
- No Supabase client SDK in the browser
- Cookie-based sessions via secure backend
- All data via backend proxy endpoints

2) Direct Supabase browser mode (prototype-friendly)
- Initializes Supabase client in the browser using the anon key
- Uses RLS to limit data access
- Auth handled by supabase.auth (email/password, magic link, OAuth)
- No service role key is ever used client-side

Security notes:
- Never include service role or private secrets in frontend code.
- In Supabase mode, the anon key is public. Enforce strict RLS.
- In proxy mode, the browser never sees Supabase keys or tokens.

## Authentication (Supabase Auth)

This build includes Supabase Auth integration:
- AuthContext with session management (`getSession`, `onAuthStateChange`) and profile lookup from `profiles`
- ProtectedRoute wrapper to guard pages
- SignIn (/signin), SignUp (/signup), Account (/account), and OAuth callback (/oauth/callback)
- TopNav shows Account/Sign Out when authenticated, and Sign In/Sign Up when not

Flow:
- Email+password is primary; magic link is available via “Send magic link”.
- OAuth buttons (Google, GitHub, Microsoft) are present and require provider setup in Supabase.
- After auth, users are redirected back to `/dashboard` or an optional `next` URL.

Guarded routes:
- /dashboard, /paths, /paths/:id, /courses, /courses/:id, /assignments, /grades, /employee/dashboard
- Admin-only: /admin/dashboard, /authoring/paths, /authoring/courses

Public routes:
- / (landing), /signin, /signup, /oauth/callback, /health

## Quick Start (Direct Supabase mode with anon key)

1) Install dependencies
   npm install

2) Create your environment file
   - Copy the example file if present, or create a new one:
     cp .env.example .env  # if .env.example exists
   - Add the following to lms_frontend/.env:
     REACT_APP_SUPABASE_URL=<your_supabase_project_url>        # e.g. https://xxxxx.supabase.co
     REACT_APP_SUPABASE_ANON_KEY=<your_project_anon_key>       # or REACT_APP_SUPABASE_KEY (alias)
     REACT_APP_FRONTEND_URL=http://localhost:3000              # used for redirectTo/emailRedirectTo
     REACT_APP_HEALTHCHECK_PATH=/health

   Notes:
   - Do NOT use the service role key in the frontend.
   - If you previously set REACT_APP_SUPABASE_KEY, you can keep it; REACT_APP_SUPABASE_ANON_KEY is preferred.
   - Set REACT_APP_FEATURE_FLAGS if you need to enable optional features.

3) Supabase Auth redirect URLs
   In Supabase Dashboard > Authentication:
   - Add Redirect URLs:
     http://localhost:3000/oauth/callback
     http://localhost:3000/signin
   - Add production equivalents (e.g., https://yourdomain.com/oauth/callback and https://yourdomain.com/signin).
   - If email confirmations are enabled, verification links must include /signin as a valid redirect.
   - Ensure Email auth is enabled. Enable OAuth providers (Google/GitHub/Microsoft) if you plan to use them.

4) Supabase database setup
   - Follow assets/supabase.md to create schema and RLS:
     profiles, learning_paths, courses, modules, enrollments, progress, course_lessons
   - Enable RLS on all tables and create policies tied to auth.uid() and profiles.role
   - Insert a profiles row for your user or enable the trigger to auto-create on signup
   - Optional: set your profile role to 'admin' to access authoring pages

5) Start the app
   npm start

6) Use the app
   - Visit /signup to create an account, or /signin to sign in
   - Go to /dashboard once authenticated
   - Explore /paths, /courses, /account, etc.
   - Open /health for environment diagnostics and the lesson seed helper

## Environment Variables (container and app)

Required for direct Supabase mode:
- REACT_APP_SUPABASE_URL
  Short description: Supabase project URL (e.g., https://xxxx.supabase.co).
- REACT_APP_SUPABASE_ANON_KEY (preferred) or REACT_APP_SUPABASE_KEY
  Short description: Public anon key for browser usage; never use a service role in the frontend.
- REACT_APP_FRONTEND_URL
  Short description: The app’s base URL, used for emailRedirectTo and OAuth redirectTo.
- REACT_APP_HEALTHCHECK_PATH
  Short description: Path for the health/diagnostics route (defaults to /health if not set).

Other container variables supported by the project:
- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- REACT_APP_WS_URL
- REACT_APP_NODE_ENV
- REACT_APP_NEXT_TELEMETRY_DISABLED
- REACT_APP_ENABLE_SOURCE_MAPS
- REACT_APP_PORT
- REACT_APP_TRUST_PROXY
- REACT_APP_LOG_LEVEL
- REACT_APP_FEATURE_FLAGS
- REACT_APP_EXPERIMENTS_ENABLED

## Auth Provider Setup

- Enable Email/Password and optional OAuth (Google, GitHub, Microsoft)
- Required Redirect URLs:
  - http://localhost:3000/oauth/callback
  - http://localhost:3000/signin
  - Add your production equivalents
- Frontend uses REACT_APP_FRONTEND_URL to construct emailRedirectTo and redirectTo

## Troubleshooting

- RLS: permission denied for table ...
  - Ensure you are authenticated and RLS policies allow your role to SELECT/INSERT/UPDATE.
  - Confirm a profiles row exists for your user and has the correct role.
  - For writes tied to users (e.g., enrollments or progress), ensure user_id = auth.uid() in the payload and your policy includes with check (user_id = auth.uid()).

- Invalid or missing environment variables
  - The Health page (/health) shows safe diagnostics (masked keys) and the configured health path.
  - Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY).

- OAuth or magic link redirects not working
  - Verify Supabase Auth Redirect URLs include:
    http://localhost:3000/oauth/callback and http://localhost:3000/signin
  - Confirm REACT_APP_FRONTEND_URL matches your environment host and port.

- Service role key warning
  - Do not use the service role key in the frontend. If you accidentally set it, rotate keys in Supabase and use only the anon key here.

- Admin-only pages inaccessible
  - Set your profiles.role = 'admin' for your user.

## Related documentation

- See assets/supabase.md for schema, RLS policies, seed guidance, and provider setup details.
- See kavia-docs/backend-proxy-contract.md for the backend proxy mode contract.

## Scripts
- npm start - start dev server
- npm test - run tests
- npm run build - production build

## Architecture
- src/context/AuthContext.js: Supabase Auth integration and session
- src/components/ProtectedRoute.jsx: route guard
- src/pages/SignInPage.jsx, SignUpPage.jsx, AccountPage.jsx, OAuthCallbackPage.js
- src/supabaseClient.js: Supabase client from env vars
- src/services/*: data services for proxy/Supabase
- src/theme.js and src/styles/theme.css: Ocean Professional theme

## Migration recommendation
- Use anon key + RLS for browser mode, or
- Switch to backend proxy mode per kavia-docs/backend-proxy-contract.md
- Never ship a service role key in frontend builds
