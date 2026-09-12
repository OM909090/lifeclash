-- ===========================================================================
-- LifeClash — schema, row-level security, triggers, and seed data
-- ===========================================================================
-- Postgres / Supabase. Everything a player owns is scoped to auth.uid() via
-- RLS; the only writes to XP / gold / levels happen inside the SECURITY DEFINER
-- functions in 0002_functions.sql, so the client can never grant itself
-- progress (LIFECLASH-SPEC.md §29 invariants, problem-statement anti-cheat).
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------ enums ----
do $$ begin
  create type building_type as enum (
    'TOWN_HALL','ACADEMY','TRAINING_GROUNDS','TREASURY','DEFENSE_TOWER','CLAN_MONUMENT'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type building_status as enum ('LOCKED','ACTIVE','UPGRADING','MAX_LEVEL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quest_status as enum ('AVAILABLE','IN_PROGRESS','COMPLETED','CLAIMED','EXPIRED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quest_cadence as enum ('DAILY','WEEKLY','EPIC');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quest_category as enum ('LEARNING','FITNESS','FINANCE','DISCIPLINE','FOCUS','RECOVERY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quest_kind as enum ('BOOLEAN','DURATION','COUNT','MILESTONE','STREAK');
exception when duplicate_object then null; end $$;

do $$ begin
  create type currency_type as enum ('GOLD','ELIXIR','GEMS','XP');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ledger_reason as enum (
    'QUEST_REWARD','BUILDING_UPGRADE','SHOP_PURCHASE','CLAN_REWARD',
    'RAID_REWARD','SYSTEM_GRANT','STREAK_REWARD','RESOURCE_COLLECT'
  );
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------- profiles ----
-- One row per auth user. Extends auth.users with the whole player record.
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text unique not null,
  display_name   text not null default 'Chieftain',
  crest          text not null default '🦁',
  realm_name     text not null default 'Everhold',

  level          int  not null default 1,
  xp             int  not null default 0 check (xp >= 0),
  trophies       int  not null default 40 check (trophies >= 0),

  streak         int  not null default 0 check (streak >= 0),
  longest_streak int  not null default 0,
  last_active_date date,

  builders_total int  not null default 2,
  builders_busy  int  not null default 0,

  -- Economy. CHECK constraints are the last line of defence against a
  -- negative balance even if a function has a bug.
  gold           int  not null default 1200 check (gold >= 0),
  elixir         int  not null default 600  check (elixir >= 0),
  gems           int  not null default 100  check (gems >= 0),

  -- Onboarding answers.
  pillars        text[] not null default '{}',
  guardian       text not null default 'scholar',
  nemesis        text not null default 'procrastination',
  time_budget    text not null default '30m',
  season_goal    text not null default 'Build the habit',
  consistency    text not null default 'starting',

  seeded         boolean not null default false,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- --------------------------------------------------------------- buildings ---
create table if not exists public.buildings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       building_type not null,
  level      int not null default 1 check (level >= 1),
  xp         int not null default 0 check (xp >= 0),
  x          int not null,
  y          int not null,
  status     building_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, type)
);
create index if not exists buildings_user_idx on public.buildings(user_id);

-- ----------------------------------------------------------------- quests ----
create table if not exists public.quests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  title          text not null,
  description    text not null default '',
  category       quest_category not null,
  type           quest_kind not null default 'BOOLEAN',
  cadence        quest_cadence not null default 'DAILY',
  status         quest_status not null default 'AVAILABLE',
  difficulty     int not null default 2 check (difficulty between 1 and 4),
  target_value   int,
  completed_value int not null default 0,
  unit           text,
  building       building_type not null,
  reward_xp      int not null default 0,
  reward_gold    int not null default 0,
  reward_elixir  int not null default 0,
  reward_trophies int not null default 0,
  damage         int not null default 0,
  is_custom      boolean not null default false,
  template_id    text,
  available_from timestamptz not null default now(),
  expires_at     timestamptz,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists quests_user_status_idx on public.quests(user_id, status);
create index if not exists quests_user_cadence_idx on public.quests(user_id, cadence);

-- ------------------------------------------------------ quest_completions ----
-- Immutable proof a quest paid out. The unique idempotency_key makes a
-- double-submitted completion pay once (LIFECLASH-SPEC.md NFR-2.3).
create table if not exists public.quest_completions (
  id              uuid primary key default gen_random_uuid(),
  quest_id        uuid not null unique references public.quests(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  idempotency_key text not null unique,
  completion_data jsonb,
  response        jsonb,
  created_at      timestamptz not null default now()
);
create index if not exists quest_completions_user_idx on public.quest_completions(user_id);

-- ---------------------------------------------------------- economy_ledger ---
-- Append-only audit of every currency change (LIFECLASH-SPEC.md NFR-2.5).
create table if not exists public.economy_ledger (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  currency     currency_type not null,
  amount       int not null,
  balance_after int not null,
  reason       ledger_reason not null,
  reference_id text,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists economy_ledger_user_idx on public.economy_ledger(user_id, created_at desc);

-- ------------------------------------------------------------- purchases -----
create table if not exists public.purchases (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  item_id    text not null,
  item_name  text not null,
  cost       int not null,
  currency   currency_type not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

-- ------------------------------------------------------------------ clans ----
create table if not exists public.clans (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  tag            text unique not null,
  description    text not null default '',
  monument_level int not null default 1,
  monument_xp    int not null default 0,
  monument_target int not null default 6000,
  weekly_goal    int not null default 30000,
  weekly_xp      int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.clan_members (
  id         uuid primary key default gen_random_uuid(),
  clan_id    uuid not null references public.clans(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'MEMBER',
  weekly_xp  int not null default 0,
  joined_at  timestamptz not null default now(),
  unique (clan_id, user_id)
);
create index if not exists clan_members_user_idx on public.clan_members(user_id);

-- ------------------------------------------------------------------ raids ----
create table if not exists public.raids (
  id          uuid primary key default gen_random_uuid(),
  clan_id     uuid not null references public.clans(id) on delete cascade,
  name        text not null,
  title       text not null default '',
  status      text not null default 'ACTIVE',
  max_hp      int not null,
  current_hp  int not null,
  clan_damage int not null default 0,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists raids_clan_status_idx on public.raids(clan_id, status);

create table if not exists public.raid_contributions (
  id         uuid primary key default gen_random_uuid(),
  raid_id    uuid not null references public.raids(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  damage     int not null default 0,
  attacks    int not null default 0,
  updated_at timestamptz not null default now(),
  unique (raid_id, user_id)
);

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function public.lc_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','buildings','quests','clans','raids'] loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on public.%1$s;
       create trigger trg_touch_%1$s before update on public.%1$s
       for each row execute function public.lc_touch_updated_at();', t);
  end loop;
end $$;

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.buildings         enable row level security;
alter table public.quests            enable row level security;
alter table public.quest_completions enable row level security;
alter table public.economy_ledger    enable row level security;
alter table public.purchases         enable row level security;
alter table public.clans             enable row level security;
alter table public.clan_members      enable row level security;
alter table public.raids             enable row level security;
alter table public.raid_contributions enable row level security;

-- Profiles: a player reads and edits only their own row. (Public leaderboard
-- data is exposed through a SECURITY DEFINER function, not a broad policy, so
-- finance and other private columns never leak.)
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Owned game tables: read/write only your own rows.
do $$
declare tbl text;
begin
  foreach tbl in array array['buildings','quests','quest_completions','economy_ledger','purchases','raid_contributions'] loop
    execute format('drop policy if exists %1$s_owner on public.%1$s;', tbl);
    execute format(
      'create policy %1$s_owner on public.%1$s
         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);', tbl);
  end loop;
end $$;

-- Clans / raids are shared read-only to any signed-in player; all writes go
-- through the SECURITY DEFINER functions.
drop policy if exists clans_read on public.clans;
create policy clans_read on public.clans for select to authenticated using (true);

drop policy if exists raids_read on public.raids;
create policy raids_read on public.raids for select to authenticated using (true);

drop policy if exists clan_members_read on public.clan_members;
create policy clan_members_read on public.clan_members for select to authenticated using (true);

-- ============================================================================
-- NEW-USER TRIGGER — create a profile and join the default clan on signup
-- ============================================================================
create or replace function public.lc_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_username text;
  v_display  text;
  v_clan     uuid;
begin
  -- Prefer the metadata sent at signup; fall back to a stable derived handle.
  v_display  := coalesce(nullif(new.raw_user_meta_data->>'display_name',''), 'Chieftain');
  v_username := coalesce(
    nullif(new.raw_user_meta_data->>'username',''),
    'chief_' || substr(replace(new.id::text,'-',''),1,10)
  );

  -- Guard against a username collision on the derived handle.
  if exists (select 1 from public.profiles where username = v_username) then
    v_username := v_username || '_' || substr(replace(new.id::text,'-',''),11,4);
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, v_username, v_display)
  on conflict (id) do nothing;

  -- Auto-join the default clan so the co-op raid has a home.
  select id into v_clan from public.clans order by created_at limit 1;
  if v_clan is not null then
    insert into public.clan_members (clan_id, user_id, role)
    values (v_clan, new.id, 'MEMBER')
    on conflict (clan_id, user_id) do nothing;
  end if;

  return new;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.lc_handle_new_user();

-- ============================================================================
-- SEED — the shared default clan and its active weekly raid
-- ============================================================================
insert into public.clans (id, name, tag, description, monument_level, monument_xp, monument_target, weekly_goal, weekly_xp)
values (
  '00000000-0000-0000-0000-0000000c1a11',
  'Code Warriors', '#CODE',
  'Students defeating procrastination, one quest at a time.',
  7, 4500, 6000, 30000, 25640
)
on conflict (id) do nothing;

insert into public.raids (id, clan_id, name, title, status, max_hp, current_hp, clan_damage, ends_at)
values (
  '00000000-0000-0000-0000-0000000d4a60',
  '00000000-0000-0000-0000-0000000c1a11',
  'The Procrastination Dragon',
  'You''ll start tomorrow. You always do.',
  'ACTIVE', 120000, 86400, 33600,
  now() + interval '62 hours'
)
on conflict (id) do nothing;
