-- E STUDIO content dashboard — schema, row-level security, storage.
--
-- Security model
--   • Every table has RLS on. Only administrators (rows in public.admins) can
--     read or write content tables; the anon and ordinary authenticated roles
--     get nothing from them directly.
--   • Nobody can make themselves an administrator: public.admins has no
--     insert/update/delete policy, so only the secret (service-role) key —
--     used by the provisioning script on the server — can add a row.
--   • The public website reads published content only, through the
--     security-definer function public.published_content(), which never
--     exposes drafts or private media.
--   • Uploads land in the private "media-draft" bucket. Publishing copies the
--     referenced files into the public "media" bucket.

-- ── Administrators ─────────────────────────────────────────────────────────

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "admins: read own row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── Content ────────────────────────────────────────────────────────────────

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  draft jsonb not null,
  published jsonb,
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references auth.users (id) on delete set null
);

create table public.pages (
  key text primary key check (key in ('home', 'work', 'contact')),
  draft jsonb not null,
  published jsonb,
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references auth.users (id) on delete set null
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 80),
  published_slug text unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort integer not null default 0,
  draft jsonb not null,
  published jsonb,
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references auth.users (id) on delete set null
);
create index projects_sort_idx on public.projects (sort, slug);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  draft_path text not null unique,
  public_path text unique,
  mime text not null,
  bytes bigint not null check (bytes > 0),
  width integer check (width > 0),
  height integer check (height > 0),
  duration_seconds numeric check (duration_seconds >= 0),
  poster_id uuid references public.media (id) on delete set null,
  alt jsonb not null default '{"en": "", "ar": ""}',
  description jsonb not null default '{"en": "", "ar": ""}',
  focus text not null default '50% 50%' check (focus ~ '^\d{1,3}% \d{1,3}%$'),
  original_name text,
  published_meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);
create index media_created_idx on public.media (created_at desc);

create table public.revisions (
  id bigint generated always as identity primary key,
  entity text not null check (entity in ('settings', 'page', 'project', 'snapshot')),
  entity_key text not null,
  data jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);
create index revisions_created_idx on public.revisions (created_at desc);

create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();
create trigger pages_touch before update on public.pages for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
create trigger media_touch before update on public.media for each row execute function public.touch_updated_at();

-- ── Row-level security: administrators only ────────────────────────────────

alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.projects enable row level security;
alter table public.media enable row level security;
alter table public.revisions enable row level security;

create policy "settings: admins" on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "pages: admins" on public.pages for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "projects: admins" on public.projects for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "media: admins" on public.media for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
-- Revisions are append-only history: admins can read and add, never edit.
create policy "revisions: admins read" on public.revisions for select to authenticated
  using ((select public.is_admin()));
create policy "revisions: admins add" on public.revisions for insert to authenticated
  with check ((select public.is_admin()));

revoke all on public.site_settings, public.pages, public.projects, public.media, public.revisions, public.admins from anon;

-- ── Public read: published content only ───────────────────────────────────

create or replace function public.published_content()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'settings', (select s.published from public.site_settings s where s.id = 1),
    'pages', coalesce((select jsonb_object_agg(p.key, p.published) from public.pages p where p.published is not null), '{}'::jsonb),
    'projects', coalesce((
      select jsonb_agg(p.published order by (p.published ->> 'sort')::int, p.published_slug)
      from public.projects p
      where p.status = 'published' and p.published is not null and p.published_slug is not null
    ), '[]'::jsonb),
    'media', coalesce((
      select jsonb_agg(m.published_meta || jsonb_build_object('id', m.id, 'path', m.public_path))
      from public.media m
      where m.public_path is not null and m.published_meta is not null
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.published_content() from public;
grant execute on function public.published_content() to anon, authenticated;

-- ── Publishing (admins only; called after referenced media are copied) ─────

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
    'pages', (select jsonb_object_agg(key, published) from public.pages),
    'projects', (select jsonb_agg(jsonb_build_object('id', id, 'published', published, 'published_slug', published_slug)) from public.projects)
  );
  insert into public.revisions (entity, entity_key, data, note, created_by)
  values ('snapshot', 'published', snapshot, coalesce(note, 'Before publish'), uid);

  -- 2. Drafts become the published content.
  update public.site_settings set published = draft, published_at = now(), updated_by = uid where id = 1;
  update public.pages set published = draft, published_at = now(), updated_by = uid;

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
revoke all on function public.publish_all(text) from public;
grant execute on function public.publish_all(text) to authenticated;

-- ── Storage ────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']),
  ('media-draft', 'media-draft', false, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Administrators manage objects in both buckets. Nobody else can list,
-- upload, replace or delete. (Published files are served through the public
-- bucket's URLs; draft files are only reachable by administrators.)
create policy "media objects: admins read" on storage.objects for select to authenticated
  using (bucket_id in ('media', 'media-draft') and (select public.is_admin()));
create policy "media objects: admins insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('media', 'media-draft') and (select public.is_admin()));
create policy "media objects: admins update" on storage.objects for update to authenticated
  using (bucket_id in ('media', 'media-draft') and (select public.is_admin()))
  with check (bucket_id in ('media', 'media-draft') and (select public.is_admin()));
create policy "media objects: admins delete" on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'media-draft') and (select public.is_admin()));
