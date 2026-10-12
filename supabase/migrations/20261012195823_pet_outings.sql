create table public.outing_ideas (
  key text primary key,
  title text not null check (btrim(title) <> '' and char_length(title) <= 80),
  emoji text not null
);

insert into public.outing_ideas (key, title, emoji) values
  ('movies', 'Ir al cine', '🎬'),
  ('ice_cream', 'Salir por un helado', '🍦'),
  ('coffee', 'Ir a una cafetería', '☕'),
  ('museum', 'Visitar un museo o exposición', '🖼️'),
  ('hike', 'Caminata o sendero', '🥾'),
  ('home', 'Quedarse en casita', '🏠');

alter table public.outing_ideas enable row level security;

revoke all on public.outing_ideas from anon, authenticated;
grant select on public.outing_ideas to authenticated;

create policy "Ver ideas de salidas"
on public.outing_ideas for select
to authenticated
using (true);

alter table public.events
  add column outing_streak integer check (outing_streak > 0);

create table public.pet_outings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  idea_key text not null references public.outing_ideas (key) on update cascade,
  streak integer not null check (streak > 0),
  reached_on date not null,
  status text not null default 'pending' check (status in ('pending', 'scheduled', 'dismissed')),
  event_id uuid references public.events (id) on delete set null,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (couple_id, reached_on, streak)
);

create index pet_outings_couple_id_idx on public.pet_outings (couple_id, created_at desc);
create index pet_outings_idea_key_idx on public.pet_outings (idea_key);
create index pet_outings_event_id_idx on public.pet_outings (event_id) where event_id is not null;
create index pet_outings_created_by_idx on public.pet_outings (created_by);

alter table public.pet_outings enable row level security;

revoke all on public.pet_outings from anon, authenticated;
grant select on public.pet_outings to authenticated;

create policy "Ver salidas de la pareja"
on public.pet_outings for select
to authenticated
using ((select private.is_couple_member(couple_id)));

alter publication supabase_realtime add table public.pet_outings;

create or replace function private.care_for_pet(action text, local_day date default null)
returns public.pets
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_couple_id uuid := private.my_couple_id();
  pet_row public.pets;
  care_day date;
  hours real;
  next_fullness real;
  next_happiness real;
  next_streak integer;
  gained integer := 0;
  last_idea text;
  next_idea text;
  result public.pets;
begin
  if target_couple_id is null then
    raise exception 'not_in_couple';
  end if;

  if action not in ('feed', 'pet', 'play') then
    raise exception 'invalid_action';
  end if;

  care_day := (now() at time zone 'utc')::date;
  if local_day is not null and abs(local_day - care_day) <= 1 then
    care_day := local_day;
  end if;

  select * into pet_row from public.pets where couple_id = target_couple_id for update;
  if not found then
    raise exception 'no_pet';
  end if;

  hours := extract(epoch from now() - pet_row.updated_at) / 3600;
  next_fullness := greatest(0, pet_row.fullness - hours * 4);
  next_happiness := greatest(0, pet_row.happiness - hours * 3);

  if action = 'feed' then
    if next_fullness < 95 then gained := 5; end if;
    next_fullness := least(100, next_fullness + 30);
  elsif action = 'pet' then
    if next_happiness < 95 then gained := 5; end if;
    next_happiness := least(100, next_happiness + 20);
  else
    if next_happiness < 95 and next_fullness >= 10 then gained := 10; end if;
    next_happiness := least(100, next_happiness + 30);
    next_fullness := greatest(0, next_fullness - 10);
  end if;

  if pet_row.last_care_on is not null and pet_row.last_care_on >= care_day then
    next_streak := pet_row.streak;
  elsif pet_row.last_care_on = care_day - 1 then
    next_streak := pet_row.streak + 1;
  else
    next_streak := 1;
  end if;

  update public.pets
  set fullness = next_fullness,
      happiness = next_happiness,
      xp = xp + gained,
      streak = next_streak,
      best_streak = greatest(best_streak, next_streak),
      last_care_on = greatest(coalesce(last_care_on, care_day), care_day),
      updated_at = now(),
      last_action = action,
      last_actor = (select auth.uid())
  where couple_id = target_couple_id
  returning * into result;

  if next_streak <> pet_row.streak and next_streak % 7 = 0 then
    select idea_key into last_idea
    from public.pet_outings
    where couple_id = target_couple_id
    order by created_at desc
    limit 1;

    select key into next_idea
    from public.outing_ideas
    where key is distinct from last_idea
    order by random()
    limit 1;

    if next_idea is not null then
      insert into public.pet_outings (couple_id, idea_key, streak, reached_on)
      values (target_couple_id, next_idea, next_streak, care_day)
      on conflict (couple_id, reached_on, streak) do nothing;
    end if;
  end if;

  return result;
end;
$$;

create function private.schedule_outing(outing_id uuid, outing_day date)
returns public.events
language plpgsql
security definer
set search_path = ''
as $$
declare
  outing public.pet_outings;
  idea public.outing_ideas;
  pet_name text;
  created public.events;
begin
  select * into outing from public.pet_outings where id = outing_id for update;
  if not found or not private.is_couple_member(outing.couple_id) then
    raise exception 'outing_not_found';
  end if;

  if outing.status <> 'pending' then
    raise exception 'outing_already_answered';
  end if;

  if outing_day is null
    or outing_day <= outing.reached_on
    or outing_day < (now() at time zone 'utc')::date - 1 then
    raise exception 'invalid_outing_day';
  end if;

  select * into idea from public.outing_ideas where key = outing.idea_key;
  select name into pet_name from public.pets where couple_id = outing.couple_id;

  insert into public.events (couple_id, created_by, title, details, starts_on, outing_streak)
  values (
    outing.couple_id,
    (select auth.uid()),
    idea.emoji || ' ' || idea.title,
    coalesce(pet_name, 'Su perrito') || ' lo propuso por sus ' || outing.streak || ' días de racha.',
    outing_day,
    outing.streak
  )
  returning * into created;

  update public.pet_outings
  set status = 'scheduled', event_id = created.id
  where id = outing.id;

  return created;
end;
$$;

create function private.dismiss_outing(outing_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  outing public.pet_outings;
begin
  select * into outing from public.pet_outings where id = outing_id for update;
  if not found or not private.is_couple_member(outing.couple_id) then
    raise exception 'outing_not_found';
  end if;

  if outing.status = 'pending' then
    update public.pet_outings set status = 'dismissed' where id = outing.id;
  end if;
end;
$$;

create function public.schedule_outing(outing_id uuid, outing_day date)
returns public.events
language sql
security invoker
set search_path = ''
as $$
  select * from private.schedule_outing(outing_id, outing_day);
$$;

create function public.dismiss_outing(outing_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.dismiss_outing(outing_id);
$$;

revoke execute on function
  private.schedule_outing(uuid, date),
  private.dismiss_outing(uuid),
  public.schedule_outing(uuid, date),
  public.dismiss_outing(uuid)
from public, anon, authenticated;

grant execute on function
  private.schedule_outing(uuid, date),
  private.dismiss_outing(uuid),
  public.schedule_outing(uuid, date),
  public.dismiss_outing(uuid)
to authenticated;

create function private.notify_new_outing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pet_name text;
  idea public.outing_ideas;
begin
  select name into pet_name from public.pets where couple_id = new.couple_id;
  select * into idea from public.outing_ideas where key = new.idea_key;

  perform private.push_to_partner(
    new.couple_id,
    new.created_by,
    coalesce(pet_name, 'Su perrito') || ' propone una salida',
    idea.emoji || ' ' || idea.title || ' por sus ' || new.streak || ' días de racha.',
    '/pet'
  );
  return null;
end;
$$;

create trigger pet_outings_notify_partner
after insert on public.pet_outings
for each row execute function private.notify_new_outing();

revoke execute on function private.notify_new_outing() from public, anon, authenticated;
