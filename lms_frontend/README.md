# OceanLMS Frontend

React-based LMS frontend with cookie-based authentication via a secure backend (no Supabase client or anon key used on the client).

## Key Characteristics
- Routing with react-router-dom (v6)
- Cookie-based auth (GET /auth/me, GET /auth/login?provider=..., POST /auth/logout)
- API client sends credentials and redirects to /login on 401
- Ocean Professional theme (blue primary, amber secondary)
- Core pages: /login, /oauth/callback, /dashboard, /courses, /courses/:id, /assignments, /grades

## Environment Variables
Create a `.env` using `.env.example` as reference:
- REACT_APP_BACKEND_URL: Base URL for backend proxy
- REACT_APP_FRONTEND_URL: This app URL (for redirect_to/callbacks)
- REACT_APP_LOG_LEVEL: debug|info|warn|error (optional)

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

## Notes
Backend must implement:
- GET /auth/me -> { user: {...} } or 401
- GET /auth/login?provider=<prov>&redirect_to=<url>
- POST /auth/logout
