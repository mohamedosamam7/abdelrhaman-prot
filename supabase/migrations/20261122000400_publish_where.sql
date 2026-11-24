-- Supabase enables pg-safeupdate for API requests: an UPDATE without a WHERE
-- clause is rejected ("UPDATE requires a WHERE clause"), which made every
-- publish fail. Same behaviour as before, with explicit WHERE clauses.
create or replace function public.publish_all(note text default null)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  snapshot jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  -- 1. Keep the outgoing published state so it can be restored.
  snapshot := jsonb_build_object(
    'settings', (select published from public.site_settings where id = 1),
    'pages', (select jsonb_object_agg(key, published) from public.pages where key in ('home', 'work', 'contact')),
    'projects', (select jsonb_agg(jsonb_build_object('id', id, 'published', published, 'published_slug', published_slug)) from public.projects where id is not null)
  );
  insert into public.revisions (entity, entity_key, data, note, created_by)
  values ('snapshot', 'published', snapshot, coalesce(note, 'Before publish'), uid);

  -- 2. Drafts become the published content.
  update public.site_settings set published = draft, published_at = now(), updated_by = uid where id = 1;
  update public.pages set published = draft, published_at = now(), updated_by = uid where key in ('home', 'work', 'contact');

  update public.projects
     set published = draft || jsonb_build_object('featured', featured, 'sort', sort),
         published_slug = slug,
         published_at = now(),
         updated_by = uid
   where status = 'published';

  update public.projects
     set published = null, published_slug = null, updated_by = uid
   where status <> 'published' and published is not null;

  return jsonb_build_object('published_at', now());
end $$;
revoke all on function public.publish_all(text) from public, anon, authenticated;
grant execute on function public.publish_all(text) to authenticated;
