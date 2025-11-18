# educational-content-management-system-263732-263747

OceanLMS is a React-based learning management system with optional Supabase integration. This repository contains the frontend app under lms_frontend and documentation assets under assets/ and kavia-docs/.

## Quick Start

- See lms_frontend/README.md for frontend setup instructions.
- See assets/supabase.md for the minimal Supabase schema, RLS policies, and Auth provider configuration.

## Environment Variables (container)

The container uses the following environment variables:
- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- REACT_APP_FRONTEND_URL
- REACT_APP_WS_URL
- REACT_APP_NODE_ENV
- REACT_APP_NEXT_TELEMETRY_DISABLED
- REACT_APP_ENABLE_SOURCE_MAPS
- REACT_APP_PORT
- REACT_APP_TRUST_PROXY
- REACT_APP_LOG_LEVEL
- REACT_APP_HEALTHCHECK_PATH
- REACT_APP_FEATURE_FLAGS
- REACT_APP_EXPERIMENTS_ENABLED
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

For prototype Supabase mode, ensure:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY (anon key; alias REACT_APP_SUPABASE_ANON_KEY)
- REACT_APP_FRONTEND_URL
- REACT_APP_HEALTHCHECK_PATH

Refer to assets/supabase.md for SQL snippets to create tables and RLS and to configure Auth Redirect URLs.