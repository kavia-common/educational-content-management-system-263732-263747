# OceanLMS Frontend

React-based LMS frontend with two supported integration modes:

1) Backend proxy mode (recommended for production security):
- No Supabase client SDK in the browser
- Cookie-based sessions via secure backend
- All data via backend proxy endpoints

2) Direct Supabase browser mode (prototype-friendly):
- Initializes Supabase client in the browser using anon key
- Uses RLS to limit data access
- Auth handled by supabase.auth (email/password, magic link, OAuth)
- No service role key is ever used client-side

Security notes:
- No service role or private secrets in frontend code.
- In Supabase mode, the anon key is considered public. Ensure tight RLS policies.
- In proxy mode, the browser never sees Supabase keys or tokens.

## Authentication (Supabase Auth)

This build includes Supabase Auth integration:
- AuthContext with session management (`getSession`, `onAuthStateChange`) and profile lookup from `profiles`
- ProtectedRoute wrapper to guard pages
- SignIn (/signin), SignUp (/signup), Account (/account), and OAuth callback (/oauth/callback)
- TopNav shows Account/Sign Out when authenticated, and Sign In/Sign Up when not

Flow:
- Email+password is primary. Magic link is available via "Send magic link".
- OAuth buttons (Google, GitHub, Microsoft) are included as placeholders and require provider setup in Supabase.
- After auth, users are redirected back to `/dashboard` or `next` URL.

Guarded routes:
- /dashboard, /paths, /paths/:id, /courses, /courses/:id, /assignments, /grades, /employee/dashboard
- Admin-only: /admin/dashboard, /authoring/paths, /authoring/courses

Public routes:
- / (landing), /signin, /signup, /oauth/callback, /health

## Quick Start (Prototype with Supabase)

1) Install dependencies:
   npm install

2) Create .env in lms_frontend root with:
   REACT_APP_SUPABASE_URL=<your_supabase_project_url>        # e.g. https://xxxxx.supabase.co
   REACT_APP_SUPABASE_KEY=<anon_key_for_prototype>           # or use REACT_APP_SUPABASE_ANON_KEY
   REACT_APP_FRONTEND_URL=<http://localhost:3000>            # used for redirectTo/emailRedirectTo
   REACT_APP_HEALTHCHECK_PATH=/health

   Notes:
   - Do NOT use a service role key in the frontend.
   - In Supabase Auth settings, add Redirect URLs:
     http://localhost:3000/oauth/callback
     http://localhost:3000/signin
     and your deployed URLs equivalents.
   - If email confirmations are enabled, verification links must include /signin as a valid redirect.
   - Ensure Email auth is enabled in your Supabase project Authentication settings.

3) Start:
   npm start

4) Open:
   - "/signin" to sign in or "/signup" to create an account
   - "/dashboard" once authenticated
   - "/paths", "/courses", "/account" and others as needed

## Environment Variables

Prototype Supabase mode:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY  (prototype only; prefer anon key with RLS; supported alias REACT_APP_SUPABASE_ANON_KEY)
- REACT_APP_FRONTEND_URL  (used for emailRedirectTo and OAuth redirectTo)

General (existing):
- REACT_APP_BACKEND_URL
- REACT_APP_FEATURE_FLAGS
- REACT_APP_HEALTHCHECK_PATH
- REACT_APP_EXPERIMENTS_ENABLED
- and other container variables as needed.

Security warning:
- Do not use the service role key in the frontend.

## Scripts
- `npm start` - start dev server
- `npm test` - test
- `npm run build` - production build

## Architecture
- src/context/AuthContext.js: Supabase Auth integration and session
- src/components/ProtectedRoute.jsx: route guard
- src/pages/SignInPage.jsx, SignUpPage.jsx, AccountPage.jsx, OAuthCallbackPage.js
- src/supabaseClient.js: Supabase client from env vars
- src/services/*: data services for proxy/Supabase
- src/theme.js and src/styles/theme.css: Ocean Professional theme

## Migration Recommendation
- Use anon key + RLS for browser mode, or
- Switch to backend proxy mode per kavia-docs/backend-proxy-contract.md
- Never ship a service role key in frontend builds
