# Supabase Integration Notes (Frontend-Only Mode)

This project supports a direct browser integration with Supabase as an alternative to the backend proxy approach. Enable it for simpler demos or environments where strict security requirements are relaxed and robust RLS is enforced.

Mode toggle:
- Set REACT_APP_FEATURE_FLAGS to include FLAG_SUPABASE_MODE=true (JSON) or FLAG_SUPABASE_MODE in list form.

Environment variables required:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY

Client initialization:
- src/lib/supabaseClient.js uses createClient(url, anonKey) with auth.persistSession=true and PKCE

Auth:
- AuthContext uses supabase.auth.getSession() and onAuthStateChange
- Profile role is read from profiles table by id
- LoginPage offers email/password sign in/up and magic link (signInWithOtp)

Tables and RLS (assumptions):
- profiles(id uuid pk, full_name text, role text)
  - RLS: user can select and update where id = auth.uid()
- learning_paths(id uuid pk, title text, description text, created_at)
  - RLS: select for authenticated users; insert/update/delete restricted to instructors/admins
- courses(id uuid pk, title text, description text, instructor text, path_id uuid, video_url text, embed_url text, created_at)
  - RLS: select for authenticated users; insert/update/delete restricted to instructors/admins
- enrollments(user_id uuid, course_id uuid, status text, created_at)
  - RLS: select/insert/update where user_id = auth.uid()
- user_course_progress(user_id uuid, course_id uuid, progress_percent int, status text, time_spent_seconds int, updated_at)
  - RLS: select/insert/update where user_id = auth.uid()

Service behavior:
- pathsService: selects from learning_paths; loads courses filtered by path_id
- coursesService: selects from courses; uses enrollments/user_course_progress to compute enrolled/status/progress and to upsert status transitions for enroll/start/complete
- progressService: derives user dashboards and simple admin stats from Supabase tables

Security:
- Do not use the service role key in frontend.
- Ensure RLS policies are correct before enabling Supabase mode.
- For production deployments with stricter controls, prefer backend proxy mode.
