-- Explicit privileges. Projects created with automatic API grants disabled
-- give the API roles nothing on new tables, so every privilege the design
-- needs is granted here — and nothing more. RLS (enabled in the previous
-- migration) still decides which rows each request may touch.
--
--   anon           no table access at all; may only call published_content()
--                  and is_admin() (which returns false for it).
--   authenticated  table privileges below, but every policy requires
--                  public.is_admin(), so a signed-in non-admin gets no rows
--                  and can change nothing.

grant usage on schema public to anon, authenticated;

-- Start from nothing on the content tables, then grant exactly what's needed.
revoke all on table public.site_settings, public.pages, public.projects, public.media, public.revisions, public.admins from anon, authenticated;

grant select, insert, update on table public.site_settings to authenticated;
grant select, insert, update on table public.pages to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.media to authenticated;
-- History is append-only: no update or delete for anyone through the API.
grant select, insert on table public.revisions to authenticated;
-- Admins can see their own row (policy); nobody can write it through the API.
grant select on table public.admins to authenticated;

-- Functions: execution only where intended.
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
revoke all on function public.published_content() from public, anon, authenticated;
grant execute on function public.published_content() to anon, authenticated;
revoke all on function public.publish_all(text) from public, anon, authenticated;
grant execute on function public.publish_all(text) to authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

-- Make sure RLS stays on even if a table is recreated later by hand.
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.projects enable row level security;
alter table public.media enable row level security;
alter table public.revisions enable row level security;
alter table public.admins enable row level security;

-- The migration bookkeeping schema is private to the database owner.
revoke all on schema cms_private from public, anon, authenticated;
