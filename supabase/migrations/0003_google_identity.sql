-- ===========================================================================
-- LifeClash — identity-backed profiles (Google OAuth + email)
-- ===========================================================================
-- Additive and idempotent: safe to run after 0001/0002 have already been
-- applied. Captures the OAuth identity (name, avatar, email, provider) into the
-- profile so the "digital profile" reflects the real signed-in account.
-- ===========================================================================

alter table public.profiles
  add column if not exists email         text,
  add column if not exists avatar_url    text,
  add column if not exists auth_provider text not null default 'email';

-- Redefine the new-user trigger to read the richer OAuth metadata. Google puts
-- name under full_name/name and the photo under avatar_url/picture; the
-- provider lives in raw_app_meta_data.
create or replace function public.lc_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_username text;
  v_display  text;
  v_avatar   text;
  v_provider text;
  v_clan     uuid;
  v_meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  v_display := coalesce(
    nullif(v_meta->>'display_name',''),
    nullif(v_meta->>'full_name',''),
    nullif(v_meta->>'name',''),
    'Chieftain'
  );

  v_avatar := coalesce(
    nullif(v_meta->>'avatar_url',''),
    nullif(v_meta->>'picture','')
  );

  v_provider := coalesce(
    nullif(new.raw_app_meta_data->>'provider',''),
    'email'
  );

  v_username := coalesce(
    nullif(v_meta->>'username',''),
    'chief_' || substr(replace(new.id::text,'-',''),1,10)
  );
  if exists (select 1 from public.profiles where username = v_username) then
    v_username := v_username || '_' || substr(replace(new.id::text,'-',''),11,4);
  end if;

  insert into public.profiles (id, username, display_name, email, avatar_url, auth_provider)
  values (new.id, v_username, v_display, new.email, v_avatar, v_provider)
  on conflict (id) do update
    set email = excluded.email,
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        auth_provider = excluded.auth_provider;

  select id into v_clan from public.clans order by created_at limit 1;
  if v_clan is not null then
    insert into public.clan_members (clan_id, user_id, role)
    values (v_clan, new.id, 'MEMBER')
    on conflict (clan_id, user_id) do nothing;
  end if;

  return new;
end $$;

-- Backfill identity for any profiles created before this migration.
update public.profiles p set
  email = u.email,
  avatar_url = coalesce(
    p.avatar_url,
    nullif(u.raw_user_meta_data->>'avatar_url',''),
    nullif(u.raw_user_meta_data->>'picture','')
  ),
  auth_provider = coalesce(nullif(u.raw_app_meta_data->>'provider',''), 'email')
from auth.users u
where u.id = p.id and p.email is null;
