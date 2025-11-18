# OceanLMS Frontend

React-based LMS frontend with cookie-based authentication via a secure backend.

Security stance:
- No Supabase client SDK is initialized in the browser.
- No Supabase anon or service keys are present anywhere in frontend code or responses.
- All authentication and data access go through backend proxy endpoints using HTTP-only cookies.

## Key Characteristics
- Routing with react-router-dom (v6)
- Cookie-based auth (GET /auth/me, GET /auth/login?provider=..., POST /auth/logout)
- API client sends credentials and redirects to /login on 401
- Ocean Professional theme (blue primary, amber secondary)
- Core pages: /login, /oauth/callback, /dashboard, /paths, /paths/:id, /courses, /courses/:id, /assignments, /grades

## Environment Variables
Create a `.env` using `.env.example` as reference:
- REACT_APP_BACKEND_URL: Base URL for backend proxy (e.g., https://api.oceanlms.example.com)
- REACT_APP_FRONTEND_URL: This app URL used for redirect_to/callbacks (e.g., https://app.oceanlms.example.com)
- REACT_APP_LOG_LEVEL: debug|info|warn|error (optional)

Additional container variables that may be present:
- REACT_APP_API_BASE, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED

Never put Supabase URL/keys in frontend. All auth happens via backend.

## Scripts
- `npm start` - start dev server
- `npm test` - test
- `npm run build` - production build

## Architecture
- src/apiClient.js: fetch wrapper with credentials and 401 handling
- src/context/AuthContext.js: auth state and PrivateRoute
- src/layouts/AppLayout.js, src/components/TopNav.js, src/components/Sidebar.js: layout
- src/pages/*: pages
- src/theme.js: theme variables applied to :root

## Backend Proxy Contract (Summary)
The frontend expects a secure backend that:
- Manages authentication and sessions using HTTP-only cookies
- Implements PKCE for OAuth providers so no tokens/keys are exposed to the browser
- Proxies data operations to Supabase (server-side)

Required endpoints:
- GET /auth/login?provider=<prov>&redirect_to=<FRONTEND_URL>/oauth/callback  
  Initiates login (email or OAuth). Backend handles PKCE and redirects through provider.
- GET /auth/callback  
  Completes auth, sets HTTP-only session cookie, then redirects back to `${REACT_APP_FRONTEND_URL}/oauth/callback?next=...`.
- GET /auth/me -> { user: {...} } or 401  
  Returns the current authenticated user based on session cookie.
- POST /auth/logout  
  Clears session cookie.

CORS settings (backend):
- Access-Control-Allow-Origin: exactly `${REACT_APP_FRONTEND_URL}`
- Access-Control-Allow-Credentials: true
- Allow methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization, X-Requested-With

Cookie guidance:
- HttpOnly; Secure; SameSite=Lax (or SameSite=None; Secure if cross-site is required)
- Do not store Supabase tokens in browser-accessible storage.

Example data proxy endpoints:
- GET /api/courses -> [ { id, title, description } ]
- GET /api/courses/:id -> { id, title, description, instructor, modules: [...] }
- GET /api/assignments -> [ { id, title, courseTitle, dueDate } ]
- GET /api/grades -> [ { id, courseTitle, overall, updatedAt } ]
- GET /api/dashboard/summary -> { activeCourses, assignmentsDue, avgGrade }
- GET /api/learning-paths -> [ { id, title, description, progressPercent } ]
- GET /api/learning-paths/:id -> { id, title, description }
- GET /api/learning-paths/:id/courses -> [ { id, title, enrolled, progressPercent } ]
- POST /api/courses/:id/enroll|start|complete -> 204|200

See kavia-docs/backend-proxy-contract.md for full details.

## Notes
Backend must implement:
- GET /auth/me -> { user: {...} } or 401
- GET /auth/login?provider=<prov>&redirect_to=<url>
- GET /auth/callback (sets session cookie then redirects to FE /oauth/callback)
- POST /auth/logout
- Data proxies used by pages: /api/courses, /api/courses/:id, /api/learning-paths, /api/learning-paths/:id, /api/learning-paths/:id/courses, /assignments, /grades, /dashboard/summary

Player routing:
- The player lives at `/courses/:id` (CoursePlayerPage). Links from course lists and learning path courses point here for a consistent start/complete experience.
