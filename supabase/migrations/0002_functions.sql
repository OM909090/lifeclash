-- ===========================================================================
-- LifeClash — server-authoritative game logic
-- ===========================================================================
-- Every function that grants XP, currency, or levels is SECURITY DEFINER and
-- scopes all work to auth.uid(). The client posts *what it did* (a quest id, a
-- building type) and NEVER *what it earned*. Reward maths lives here and
-- mirrors src/lib/rewards.ts / src/lib/game-config.ts exactly, so the
-- optimistic UI and the authoritative result agree.
-- ===========================================================================

-- ------------------------------------------------------- pure progression ---

create or replace function public.lc_xp_for_level(p_level int)
returns int language sql immutable as $$
  select round(420 * power(1.18, greatest(p_level,1) - 1))::int;
$$;

create or replace function public.lc_building_xp_required(p_level int)
returns int language sql immutable as $$
  select round(180 * power(1.4, greatest(p_level,1) - 1))::int;
$$;

create or replace function public.lc_upgrade_cost(p_level int)
returns int language sql immutable as $$
  select round(320 * power(1.55, greatest(p_level,1) - 1))::int;
$$;

create or replace function public.lc_upgrade_elixir_cost(p_level int)
returns int language sql immutable as $$
  select case when p_level < 3 then 0
              else round(120 * power(1.4, p_level - 3))::int end;
$$;

create or replace function public.lc_building_max_level(p_type building_type)
returns int language sql immutable as $$
  select case p_type
           when 'TOWN_HALL' then 15
           when 'CLAN_MONUMENT' then 10
           else 12 end;
$$;

create or replace function public.lc_budget_scale(p_budget text)
returns numeric language sql immutable as $$
  select case p_budget
           when '15m' then 0.7
           when '1h'  then 1.4
           when '2h'  then 1.9
           else 1.0 end;
$$;

create or replace function public.lc_league(p_trophies int)
returns text language sql immutable as $$
  select case
    when p_trophies >= 2600 then 'LEGEND'
    when p_trophies >= 1800 then 'CRYSTAL'
    when p_trophies >= 1200 then 'GOLD'
    when p_trophies >= 750  then 'SILVER'
    when p_trophies >= 400  then 'BRONZE'
    when p_trophies >= 150  then 'STONE'
    else 'WOOD' end;
$$;

-- Reward from difficulty × cadence × time-budget. Returns {xp,gold,elixir,trophies}.
create or replace function public.lc_reward(p_difficulty int, p_cadence text, p_scale numeric)
returns jsonb language plpgsql immutable as $$
declare
  v_diff numeric := case p_difficulty
                      when 1 then 0.8 when 2 then 1.0
                      when 3 then 1.25 when 4 then 1.6 else 1.0 end;
  v_cad  numeric := case p_cadence
                      when 'WEEKLY' then 4.2 when 'EPIC' then 9 else 1 end;
  v_xp int := round(50 * v_diff * v_cad * coalesce(p_scale,1))::int;
begin
  return jsonb_build_object(
    'xp', v_xp,
    'gold', round(v_xp * 0.55)::int,
    'elixir', round(v_xp * 0.3)::int,
    'trophies', greatest(1, round(v_diff * 6 * (case p_cadence when 'DAILY' then 1 else 2.5 end))::int)
  );
end $$;

create or replace function public.lc_damage(p_xp int, p_difficulty int)
returns int language sql immutable as $$
  select round(p_xp * 2.4 * (1 + p_difficulty * 0.15))::int;
$$;

create or replace function public.lc_category_building(p_category quest_category)
returns building_type language sql immutable as $$
  select case p_category
    when 'LEARNING' then 'ACADEMY'
    when 'FOCUS' then 'ACADEMY'
    when 'FITNESS' then 'TRAINING_GROUNDS'
    when 'FINANCE' then 'TREASURY'
    when 'DISCIPLINE' then 'DEFENSE_TOWER'
    when 'RECOVERY' then 'DEFENSE_TOWER'
    else 'TOWN_HALL' end::building_type;
$$;

-- Scale a base target by the time budget, matching rewards.ts scaleTarget().
create or replace function public.lc_scale_target(p_base int, p_unit text, p_scale numeric)
returns int language plpgsql immutable as $$
declare v numeric;
begin
  if p_base is null then return null; end if;
  v := p_base * coalesce(p_scale,1);
  if p_unit = 'steps' then return (round(v/500)*500)::int; end if;
  if v >= 20 then return (round(v/5)*5)::int; end if;
  return greatest(1, round(v)::int);
end $$;

-- ===========================================================================
-- SEED REALM — called by POST /api/v1/onboarding
-- ===========================================================================
create or replace function public.lc_seed_realm(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_pillars text[] := coalesce(
      (select array_agg(value::text) from jsonb_array_elements_text(coalesce(p->'pillars','[]'::jsonb)) as value),
      array['mind','body']);
  v_consistency text := coalesce(p->>'consistency','starting');
  v_budget text := coalesce(p->>'timeBudget','30m');
  v_scale numeric := lc_budget_scale(v_budget);
  v_trophies int := case v_consistency
                      when 'onoff' then 180 when 'steady' then 460
                      when 'disciplined' then 820 else 40 end;
  v_shift int := case v_consistency
                   when 'starting' then -1 when 'disciplined' then 1 else 0 end;
  v_guardian text;
  v_wanted building_type[];
  v_bt building_type;
  v_tpl jsonb;
  v_tpls jsonb;
  v_reward jsonb;
  v_diff int;
  v_pillar text;
  v_count int;
begin
  if v_uid is null then
    raise exception 'UNAUTHORIZED' using errcode = '28000';
  end if;

  if array_length(v_pillars,1) is null then
    v_pillars := array['mind','body'];
  end if;

  v_guardian := case v_pillars[1]
                  when 'body' then 'warrior'
                  when 'wealth' then 'merchant'
                  when 'discipline' then 'sentinel'
                  when 'recovery' then 'sentinel'
                  else 'scholar' end;

  update public.profiles set
    realm_name   = coalesce(nullif(trim(p->>'realmName'),''), 'Everhold'),
    display_name = coalesce(nullif(trim(p->>'displayName'),''), display_name),
    crest        = coalesce(nullif(p->>'crest',''), crest),
    pillars      = v_pillars,
    guardian     = v_guardian,
    nemesis      = coalesce(p->>'nemesis','procrastination'),
    time_budget  = v_budget,
    season_goal  = coalesce(nullif(trim(p->>'seasonGoal'),''), 'Build the habit'),
    consistency  = v_consistency,
    trophies     = v_trophies,
    level = 1, xp = 0, streak = 0, last_active_date = null,
    gold = 1200, elixir = 600, gems = 100,
    seeded = true
  where id = v_uid;

  -- Fresh start: clear any prior realm so re-seeding is idempotent.
  delete from public.quests where user_id = v_uid;
  delete from public.buildings where user_id = v_uid;

  -- Buildings: Town Hall + one per chosen pillar + a (locked) Clan Monument.
  v_wanted := array['TOWN_HALL']::building_type[];
  foreach v_pillar in array v_pillars loop
    v_bt := case v_pillar
              when 'mind' then 'ACADEMY' when 'focus' then 'ACADEMY'
              when 'body' then 'TRAINING_GROUNDS'
              when 'wealth' then 'TREASURY'
              when 'discipline' then 'DEFENSE_TOWER' when 'recovery' then 'DEFENSE_TOWER'
              else null end::building_type;
    if v_bt is not null and not (v_bt = any(v_wanted)) then
      v_wanted := array_append(v_wanted, v_bt);
    end if;
  end loop;
  v_wanted := array_append(v_wanted, 'CLAN_MONUMENT'::building_type);

  foreach v_bt in array v_wanted loop
    insert into public.buildings(user_id, type, level, x, y, status)
    values (
      v_uid, v_bt, 1,
      case v_bt when 'TOWN_HALL' then 3 when 'ACADEMY' then 1 when 'TRAINING_GROUNDS' then 5
                when 'TREASURY' then 5 when 'DEFENSE_TOWER' then 1 else 3 end,
      case v_bt when 'TOWN_HALL' then 3 when 'ACADEMY' then 2 when 'TRAINING_GROUNDS' then 2
                when 'TREASURY' then 4 when 'DEFENSE_TOWER' then 4 else 5 end,
      case when v_bt = 'CLAN_MONUMENT' then 'LOCKED' else 'ACTIVE' end::building_status
    )
    on conflict (user_id, type) do nothing;
  end loop;

  -- Quest templates (mirrors QUEST_TEMPLATES in game-config.ts).
  v_tpls := $tpl$[
    {"title":"Study Session","desc":"Sit down with one topic and go deep. No tabs, no phone.","cat":"LEARNING","kind":"DURATION","cad":"DAILY","d":3,"b":"ACADEMY","t":30,"u":"min","p":"mind"},
    {"title":"Slay 5 Problems","desc":"Five practice problems. Wrong answers still count as swings.","cat":"LEARNING","kind":"COUNT","cad":"DAILY","d":3,"b":"ACADEMY","t":5,"u":"problems","p":"mind"},
    {"title":"Train Your Body","desc":"Gym, run, ride, court — anything that leaves you breathing hard.","cat":"FITNESS","kind":"DURATION","cad":"DAILY","d":3,"b":"TRAINING_GROUNDS","t":30,"u":"min","p":"body"},
    {"title":"March 6,000 Steps","desc":"Get outside and move. The realm looks better from a walk.","cat":"FITNESS","kind":"COUNT","cad":"DAILY","d":2,"b":"TRAINING_GROUNDS","t":6000,"u":"steps","p":"body"},
    {"title":"Count the Coin","desc":"Log yesterday's spending. Awareness is the whole quest.","cat":"FINANCE","kind":"BOOLEAN","cad":"DAILY","d":1,"b":"TREASURY","p":"wealth"},
    {"title":"Advance the Craft","desc":"One concrete career move: apply, message, ship, or practice.","cat":"FINANCE","kind":"BOOLEAN","cad":"DAILY","d":3,"b":"TREASURY","p":"wealth"},
    {"title":"Hold the Dawn","desc":"Up at your target time. No snooze. The tower is watching.","cat":"DISCIPLINE","kind":"BOOLEAN","cad":"DAILY","d":2,"b":"DEFENSE_TOWER","p":"discipline"},
    {"title":"Rest the Realm","desc":"Lights out inside your sleep window. Seven hours minimum.","cat":"RECOVERY","kind":"BOOLEAN","cad":"DAILY","d":2,"b":"DEFENSE_TOWER","p":"recovery"},
    {"title":"Douse the Glass","desc":"No screens for the last 30 minutes before bed.","cat":"RECOVERY","kind":"DURATION","cad":"DAILY","d":2,"b":"DEFENSE_TOWER","t":30,"u":"min","p":"recovery"},
    {"title":"Deep Work Siege","desc":"One unbroken block on the hardest thing on your list.","cat":"FOCUS","kind":"DURATION","cad":"DAILY","d":4,"b":"ACADEMY","t":45,"u":"min","p":"focus"},
    {"title":"Clear the War Table","desc":"Empty the inbox and pick tomorrow's three priorities.","cat":"FOCUS","kind":"BOOLEAN","cad":"DAILY","d":2,"b":"ACADEMY","p":"focus"},
    {"title":"Five Trainings This Week","desc":"Stack five sessions before the week closes.","cat":"FITNESS","kind":"COUNT","cad":"WEEKLY","d":4,"b":"TRAINING_GROUNDS","t":5,"u":"sessions","p":"body"},
    {"title":"Ten Hours in the Academy","desc":"Ten hours of real study across the week.","cat":"LEARNING","kind":"COUNT","cad":"WEEKLY","d":4,"b":"ACADEMY","t":10,"u":"hours","p":"mind"}
  ]$tpl$::jsonb;

  -- Up to two daily quests per chosen pillar.
  foreach v_pillar in array v_pillars loop
    v_count := 0;
    for v_tpl in select * from jsonb_array_elements(v_tpls) loop
      if v_tpl->>'p' = v_pillar and v_tpl->>'cad' = 'DAILY' and v_count < 2 then
        v_diff := least(4, greatest(1, (v_tpl->>'d')::int + v_shift));
        v_reward := lc_reward(v_diff, 'DAILY', v_scale);
        insert into public.quests(
          user_id, title, description, category, type, cadence, difficulty,
          target_value, unit, building, reward_xp, reward_gold, reward_elixir,
          reward_trophies, damage, template_id)
        values (
          v_uid, v_tpl->>'title', v_tpl->>'desc',
          (v_tpl->>'cat')::quest_category, (v_tpl->>'kind')::quest_kind, 'DAILY', v_diff,
          lc_scale_target((v_tpl->>'t')::int, v_tpl->>'u', v_scale), v_tpl->>'u',
          (v_tpl->>'b')::building_type,
          (v_reward->>'xp')::int, (v_reward->>'gold')::int, (v_reward->>'elixir')::int,
          (v_reward->>'trophies')::int,
          lc_damage((v_reward->>'xp')::int, v_diff), v_tpl->>'title');
        v_count := v_count + 1;
      end if;
    end loop;
  end loop;

  -- Streak anchor quest (always present).
  v_reward := lc_reward(2, 'DAILY', v_scale);
  insert into public.quests(user_id,title,description,category,type,cadence,difficulty,building,
    reward_xp,reward_gold,reward_elixir,reward_trophies,damage,template_id)
  values (v_uid,'Feed the Beacon','Complete any other quest today to keep the flame lit.',
    'DISCIPLINE','STREAK','DAILY',2,'DEFENSE_TOWER',
    (v_reward->>'xp')::int,(v_reward->>'gold')::int,(v_reward->>'elixir')::int,
    (v_reward->>'trophies')::int, lc_damage((v_reward->>'xp')::int,2),'keep-streak');

  -- Up to two weekly quests whose pillar was chosen.
  v_count := 0;
  for v_tpl in select * from jsonb_array_elements(v_tpls) loop
    if v_tpl->>'cad' = 'WEEKLY' and (v_tpl->>'p') = any(v_pillars) and v_count < 2 then
      v_diff := least(4, greatest(1, (v_tpl->>'d')::int + v_shift));
      v_reward := lc_reward(v_diff, 'WEEKLY', v_scale);
      insert into public.quests(user_id,title,description,category,type,cadence,difficulty,
        target_value,unit,building,reward_xp,reward_gold,reward_elixir,reward_trophies,damage,template_id)
      values (v_uid, v_tpl->>'title', v_tpl->>'desc',
        (v_tpl->>'cat')::quest_category,(v_tpl->>'kind')::quest_kind,'WEEKLY',v_diff,
        lc_scale_target((v_tpl->>'t')::int, v_tpl->>'u', v_scale), v_tpl->>'u',
        (v_tpl->>'b')::building_type,
        (v_reward->>'xp')::int,(v_reward->>'gold')::int,(v_reward->>'elixir')::int,
        (v_reward->>'trophies')::int, lc_damage((v_reward->>'xp')::int,v_diff), v_tpl->>'title');
      v_count := v_count + 1;
    end if;
  end loop;

  -- Epic season objective, pinned in the Town Hall.
  v_reward := lc_reward(4, 'EPIC', v_scale);
  insert into public.quests(user_id,title,description,category,type,cadence,status,difficulty,
    target_value,completed_value,unit,building,reward_xp,reward_gold,reward_elixir,reward_trophies,damage,template_id)
  values (v_uid,
    coalesce(nullif(trim(p->>'seasonGoal'),''),'Your Season Goal'),
    'Your season objective, pinned in the Town Hall. Every daily quest moves it forward.',
    'FOCUS','MILESTONE','EPIC','IN_PROGRESS',4,100,8,'%','TOWN_HALL',
    (v_reward->>'xp')::int,(v_reward->>'gold')::int,(v_reward->>'elixir')::int,
    (v_reward->>'trophies')::int, lc_damage((v_reward->>'xp')::int,4),'epic');

  return public.lc_get_state();
end $$;

-- ===========================================================================
-- COMPLETE QUEST — the core loop. Atomic + idempotent + server-authored.
-- ===========================================================================
create or replace function public.lc_complete_quest(p_quest_id uuid, p_idempotency text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  q public.quests%rowtype;
  prof public.profiles%rowtype;
  v_existing jsonb;
  v_level int; v_carry int; v_leveled boolean := false;
  v_league_before text; v_league_after text; v_promoted boolean;
  v_bxp int; v_blevel int; v_bmax int; v_bleveled building_type := null;
  v_clan uuid; v_raid public.raids%rowtype;
  v_result jsonb;
  v_today date := (now() at time zone 'utc')::date;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED' using errcode='28000'; end if;

  -- Idempotency replay: same key -> return the original response, no re-pay.
  select response into v_existing from public.quest_completions
   where idempotency_key = p_idempotency and user_id = v_uid;
  if v_existing is not null then return v_existing; end if;

  -- Lock the quest and verify ownership + state.
  select * into q from public.quests where id = p_quest_id and user_id = v_uid for update;
  if not found then raise exception 'QUEST_NOT_OWNED' using errcode='42501'; end if;
  if q.status = 'COMPLETED' then raise exception 'QUEST_ALREADY_COMPLETED' using errcode='23505'; end if;

  select * into prof from public.profiles where id = v_uid for update;

  -- ---- player XP + non-linear level roll-up ----
  v_level := prof.level;
  v_carry := prof.xp + q.reward_xp;
  while v_carry >= public.lc_xp_for_level(v_level) loop
    v_carry := v_carry - public.lc_xp_for_level(v_level);
    v_level := v_level + 1;
    v_leveled := true;
  end loop;

  v_league_before := public.lc_league(prof.trophies);
  v_league_after  := public.lc_league(prof.trophies + q.reward_trophies);
  v_promoted := v_league_after <> v_league_before;

  -- ---- streak: consecutive-day logic ----
  declare v_streak int; v_longest int;
  begin
    if prof.last_active_date = v_today then
      v_streak := greatest(prof.streak, 1);          -- already counted today
    elsif prof.last_active_date = v_today - 1 then
      v_streak := prof.streak + 1;                    -- consecutive day
    else
      v_streak := 1;                                  -- streak (re)starts
    end if;
    v_longest := greatest(prof.longest_streak, v_streak);

    update public.profiles set
      level = v_level, xp = v_carry,
      trophies = trophies + q.reward_trophies,
      gold = gold + q.reward_gold,
      elixir = elixir + q.reward_elixir,
      streak = v_streak, longest_streak = v_longest, last_active_date = v_today
    where id = v_uid;
  end;

  -- ---- building XP + level roll-up ----
  v_bxp := 0; v_blevel := 0;
  select xp, level into v_bxp, v_blevel from public.buildings
   where user_id = v_uid and type = q.building for update;
  if found then
    v_bmax := public.lc_building_max_level(q.building);
    v_bxp := v_bxp + round(q.reward_xp * 0.6)::int;
    while v_blevel < v_bmax and v_bxp >= public.lc_building_xp_required(v_blevel) loop
      v_bxp := v_bxp - public.lc_building_xp_required(v_blevel);
      v_blevel := v_blevel + 1;
      v_bleveled := q.building;
    end loop;
    update public.buildings set
      xp = v_bxp, level = v_blevel,
      status = case when v_blevel >= v_bmax then 'MAX_LEVEL' else 'ACTIVE' end::building_status
    where user_id = v_uid and type = q.building;
  end if;

  -- Unlock the Clan Monument once the realm hits level 5.
  update public.buildings set status = 'ACTIVE'
   where user_id = v_uid and type = 'CLAN_MONUMENT' and status = 'LOCKED' and v_level >= 5;

  -- ---- clan + raid contribution ----
  select clan_id into v_clan from public.clan_members where user_id = v_uid limit 1;
  if v_clan is not null then
    update public.clans set
      weekly_xp = weekly_xp + q.reward_xp,
      monument_xp = monument_xp + round(q.reward_xp * 0.5)::int
    where id = v_clan;

    update public.clan_members set weekly_xp = weekly_xp + q.reward_xp
     where clan_id = v_clan and user_id = v_uid;

    select * into v_raid from public.raids
     where clan_id = v_clan and status = 'ACTIVE'
     order by created_at desc limit 1 for update;
    if found and q.damage > 0 then
      update public.raids set
        current_hp = greatest(0, current_hp - q.damage),
        clan_damage = clan_damage + q.damage,
        status = case when current_hp - q.damage <= 0 then 'DEFEATED' else status end
      where id = v_raid.id;
      insert into public.raid_contributions(raid_id, user_id, damage, attacks)
      values (v_raid.id, v_uid, q.damage, 1)
      on conflict (raid_id, user_id)
      do update set damage = raid_contributions.damage + q.damage,
                    attacks = raid_contributions.attacks + 1,
                    updated_at = now();
    end if;
  end if;

  -- ---- ledger (auditable) ----
  insert into public.economy_ledger(user_id, currency, amount, balance_after, reason, reference_id)
  values (v_uid, 'GOLD', q.reward_gold, prof.gold + q.reward_gold, 'QUEST_REWARD', q.id::text),
         (v_uid, 'ELIXIR', q.reward_elixir, prof.elixir + q.reward_elixir, 'QUEST_REWARD', q.id::text),
         (v_uid, 'XP', q.reward_xp, 0, 'QUEST_REWARD', q.id::text);

  -- ---- mark complete ----
  update public.quests set
    status = 'COMPLETED', completed_value = coalesce(target_value, 1), completed_at = now()
  where id = q.id;

  -- Nudge the pinned epic quest forward.
  update public.quests set completed_value = least(100, completed_value + 3)
   where user_id = v_uid and cadence = 'EPIC' and status <> 'COMPLETED';

  v_result := jsonb_build_object(
    'questId', q.id,
    'xp', q.reward_xp, 'gold', q.reward_gold, 'elixir', q.reward_elixir,
    'trophies', q.reward_trophies, 'damage', q.damage,
    'leveledUp', v_leveled, 'newLevel', v_level, 'promoted', v_promoted,
    'buildingLeveled', v_bleveled,
    'state', public.lc_get_state()
  );

  insert into public.quest_completions(quest_id, user_id, idempotency_key, response)
  values (q.id, v_uid, p_idempotency, v_result)
  on conflict (idempotency_key) do nothing;

  return v_result;
end $$;

-- ===========================================================================
-- UPGRADE BUILDING
-- ===========================================================================
create or replace function public.lc_upgrade_building(p_type building_type)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  b public.buildings%rowtype;
  prof public.profiles%rowtype;
  v_gold int; v_elixir int; v_max int;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED' using errcode='28000'; end if;

  select * into b from public.buildings where user_id = v_uid and type = p_type for update;
  if not found then raise exception 'BUILDING_LOCKED' using errcode='42501'; end if;

  v_max := public.lc_building_max_level(p_type);
  if b.level >= v_max then raise exception 'BUILDING_MAX_LEVEL' using errcode='23514'; end if;

  select * into prof from public.profiles where id = v_uid for update;
  v_gold := public.lc_upgrade_cost(b.level);
  v_elixir := public.lc_upgrade_elixir_cost(b.level);

  if prof.gold < v_gold then raise exception 'INSUFFICIENT_GOLD' using errcode='23514'; end if;
  if prof.elixir < v_elixir then raise exception 'INSUFFICIENT_ELIXIR' using errcode='23514'; end if;

  update public.profiles set gold = gold - v_gold, elixir = elixir - v_elixir where id = v_uid;
  update public.buildings set
    level = level + 1,
    status = case when b.level + 1 >= v_max then 'MAX_LEVEL' else 'ACTIVE' end::building_status
  where id = b.id;

  insert into public.economy_ledger(user_id, currency, amount, balance_after, reason, reference_id)
  values (v_uid, 'GOLD', -v_gold, prof.gold - v_gold, 'BUILDING_UPGRADE', p_type::text);
  if v_elixir > 0 then
    insert into public.economy_ledger(user_id, currency, amount, balance_after, reason, reference_id)
    values (v_uid, 'ELIXIR', -v_elixir, prof.elixir - v_elixir, 'BUILDING_UPGRADE', p_type::text);
  end if;

  return public.lc_get_state();
end $$;

-- ===========================================================================
-- CUSTOM QUEST CRUD — the "add a task" the checklist requires. Rewards are
-- computed server-side from difficulty/category, never accepted from client.
-- ===========================================================================
create or replace function public.lc_create_quest(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_title text := trim(coalesce(p->>'title',''));
  v_cat quest_category;
  v_diff int := least(4, greatest(1, coalesce((p->>'difficulty')::int, 2)));
  v_kind quest_kind := coalesce(nullif(p->>'type','')::quest_kind, 'BOOLEAN');
  v_target int := nullif(p->>'targetValue','')::int;
  v_scale numeric;
  v_reward jsonb;
  v_id uuid;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED' using errcode='28000'; end if;
  if length(v_title) < 2 then raise exception 'VALIDATION_ERROR' using errcode='22000'; end if;

  begin v_cat := coalesce(nullif(p->>'category','')::quest_category, 'FOCUS');
  exception when others then v_cat := 'FOCUS'; end;

  select lc_budget_scale(time_budget) into v_scale from public.profiles where id = v_uid;
  v_reward := lc_reward(v_diff, 'DAILY', coalesce(v_scale,1));

  insert into public.quests(
    user_id, title, description, category, type, cadence, difficulty,
    target_value, unit, building, reward_xp, reward_gold, reward_elixir,
    reward_trophies, damage, is_custom)
  values (
    v_uid, left(v_title, 80), left(coalesce(p->>'description',''), 240),
    v_cat, v_kind, 'DAILY', v_diff,
    v_target, nullif(p->>'unit',''), lc_category_building(v_cat),
    (v_reward->>'xp')::int, (v_reward->>'gold')::int, (v_reward->>'elixir')::int,
    (v_reward->>'trophies')::int, lc_damage((v_reward->>'xp')::int, v_diff), true)
  returning id into v_id;

  return (select to_jsonb(q) from public.quests q where q.id = v_id);
end $$;

create or replace function public.lc_update_quest(p_id uuid, p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  q public.quests%rowtype;
  v_diff int;
  v_scale numeric;
  v_reward jsonb;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED' using errcode='28000'; end if;
  select * into q from public.quests where id = p_id and user_id = v_uid for update;
  if not found then raise exception 'NOT_FOUND' using errcode='02000'; end if;
  if not q.is_custom then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if q.status = 'COMPLETED' then raise exception 'QUEST_ALREADY_COMPLETED' using errcode='23505'; end if;

  v_diff := least(4, greatest(1, coalesce((p->>'difficulty')::int, q.difficulty)));
  select lc_budget_scale(time_budget) into v_scale from public.profiles where id = v_uid;
  v_reward := lc_reward(v_diff, 'DAILY', coalesce(v_scale,1));

  update public.quests set
    title = coalesce(nullif(trim(p->>'title'),''), title),
    description = coalesce(p->>'description', description),
    difficulty = v_diff,
    target_value = coalesce(nullif(p->>'targetValue','')::int, target_value),
    reward_xp = (v_reward->>'xp')::int,
    reward_gold = (v_reward->>'gold')::int,
    reward_elixir = (v_reward->>'elixir')::int,
    reward_trophies = (v_reward->>'trophies')::int,
    damage = lc_damage((v_reward->>'xp')::int, v_diff)
  where id = p_id;

  return (select to_jsonb(x) from public.quests x where x.id = p_id);
end $$;

create or replace function public.lc_delete_quest(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := auth.uid(); v_custom boolean;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED' using errcode='28000'; end if;
  select is_custom into v_custom from public.quests where id = p_id and user_id = v_uid;
  if v_custom is null then raise exception 'NOT_FOUND' using errcode='02000'; end if;
  if not v_custom then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  delete from public.quests where id = p_id and user_id = v_uid;
  return jsonb_build_object('deleted', p_id);
end $$;

-- ===========================================================================
-- COLLECT RESOURCE — floating bubbles. Amount is clamped server-side.
-- ===========================================================================
create or replace function public.lc_collect_resource(p_kind text, p_amount int)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_amt int := least(500, greatest(1, coalesce(p_amount, 1)));
  prof public.profiles%rowtype;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED' using errcode='28000'; end if;
  select * into prof from public.profiles where id = v_uid for update;

  if p_kind = 'gold' then
    update public.profiles set gold = gold + v_amt where id = v_uid;
    insert into public.economy_ledger(user_id,currency,amount,balance_after,reason)
    values (v_uid,'GOLD',v_amt,prof.gold + v_amt,'RESOURCE_COLLECT');
  elsif p_kind = 'elixir' then
    update public.profiles set elixir = elixir + v_amt where id = v_uid;
    insert into public.economy_ledger(user_id,currency,amount,balance_after,reason)
    values (v_uid,'ELIXIR',v_amt,prof.elixir + v_amt,'RESOURCE_COLLECT');
  else
    raise exception 'VALIDATION_ERROR' using errcode='22000';
  end if;

  return public.lc_get_state();
end $$;

-- ===========================================================================
-- SHOP — prices live on the server; the client only sends an item id.
-- ===========================================================================
create or replace function public.lc_shop_price(p_item text)
returns jsonb language sql immutable as $$
  select case p_item
    when 'oak'         then jsonb_build_object('name','Ancient Oak','cost',800,'currency','GOLD')
    when 'pine'        then jsonb_build_object('name','Frostpine','cost',1200,'currency','GOLD')
    when 'bush'        then jsonb_build_object('name','Hedgerow','cost',500,'currency','GOLD')
    when 'cairn'       then jsonb_build_object('name','Standing Cairn','cost',650,'currency','GOLD')
    when 'banner-blue' then jsonb_build_object('name','Azure Banner','cost',60,'currency','GEMS')
    when 'banner-red'  then jsonb_build_object('name','Crimson Banner','cost',60,'currency','GEMS')
    else null end;
$$;

create or replace function public.lc_purchase_item(p_item text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_price jsonb := public.lc_shop_price(p_item);
  v_cost int; v_cur text; prof public.profiles%rowtype;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED' using errcode='28000'; end if;
  if v_price is null then raise exception 'NOT_FOUND' using errcode='02000'; end if;

  v_cost := (v_price->>'cost')::int;
  v_cur := v_price->>'currency';

  if exists (select 1 from public.purchases where user_id = v_uid and item_id = p_item) then
    raise exception 'ALREADY_OWNED' using errcode='23505';
  end if;

  select * into prof from public.profiles where id = v_uid for update;

  if v_cur = 'GOLD' then
    if prof.gold < v_cost then raise exception 'INSUFFICIENT_GOLD' using errcode='23514'; end if;
    update public.profiles set gold = gold - v_cost where id = v_uid;
  else
    if prof.gems < v_cost then raise exception 'INSUFFICIENT_GEMS' using errcode='23514'; end if;
    update public.profiles set gems = gems - v_cost where id = v_uid;
  end if;

  insert into public.purchases(user_id, item_id, item_name, cost, currency)
  values (v_uid, p_item, v_price->>'name', v_cost, v_cur::currency_type);

  insert into public.economy_ledger(user_id, currency, amount, balance_after, reason, reference_id)
  values (v_uid, v_cur::currency_type, -v_cost,
          case when v_cur='GOLD' then prof.gold - v_cost else prof.gems - v_cost end,
          'SHOP_PURCHASE', p_item);

  return public.lc_get_state();
end $$;

-- ===========================================================================
-- GET STATE — one round-trip snapshot of everything the client renders.
-- ===========================================================================
create or replace function public.lc_get_state()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_profile jsonb;
  v_buildings jsonb;
  v_quests jsonb;
  v_raid jsonb;
  v_clan jsonb;
  v_clan_id uuid;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED' using errcode='28000'; end if;

  select to_jsonb(p) into v_profile from public.profiles p where p.id = v_uid;
  if v_profile is null then return null; end if;

  select coalesce(jsonb_agg(to_jsonb(b) order by b.y, b.x), '[]'::jsonb)
    into v_buildings from public.buildings b where b.user_id = v_uid;

  select coalesce(jsonb_agg(to_jsonb(q) order by q.created_at), '[]'::jsonb)
    into v_quests from public.quests q where q.user_id = v_uid;

  select clan_id into v_clan_id from public.clan_members where user_id = v_uid limit 1;

  select to_jsonb(c) into v_clan from public.clans c where c.id = v_clan_id;

  select to_jsonb(r) || jsonb_build_object(
           'yourDamage',
           coalesce((select damage from public.raid_contributions
                      where raid_id = r.id and user_id = v_uid), 0))
    into v_raid
    from public.raids r
   where r.clan_id = v_clan_id and r.status = 'ACTIVE'
   order by r.created_at desc limit 1;

  return jsonb_build_object(
    'profile', v_profile,
    'buildings', v_buildings,
    'quests', v_quests,
    'clan', v_clan,
    'raid', v_raid
  );
end $$;

-- ---------------------------------------------------------------- grants -----
grant execute on function
  public.lc_seed_realm(jsonb),
  public.lc_complete_quest(uuid, text),
  public.lc_upgrade_building(building_type),
  public.lc_create_quest(jsonb),
  public.lc_update_quest(uuid, jsonb),
  public.lc_delete_quest(uuid),
  public.lc_collect_resource(text, int),
  public.lc_purchase_item(text),
  public.lc_get_state()
to authenticated;
