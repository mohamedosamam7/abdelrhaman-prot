-- Administrator provisioning (scripts/cms/create-admin.mjs) runs with the
-- secret key, i.e. the service_role. With automatic API grants disabled that
-- role has no table privileges either, so it gets exactly what provisioning
-- needs on the admin list — nothing on the content tables.
grant usage on schema public to service_role;
grant select, insert, delete on table public.admins to service_role;
