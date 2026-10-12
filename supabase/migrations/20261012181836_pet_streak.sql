alter table public.pets
  add column streak integer not null default 0 check (streak >= 0),
  add column best_streak integer not null default 0 check (best_streak >= 0),
  add column last_care_on date;

drop function public.care_for_pet(text);
drop function private.care_for_pet(text);

create function private.care_for_pet(action text, local_day date default null)
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

  return result;
end;
$$;

create function public.care_for_pet(action text, local_day date default null)
returns public.pets
language sql
security invoker
set search_path = ''
as $$
  select * from private.care_for_pet(action, local_day);
$$;

revoke execute on function
  private.care_for_pet(text, date),
  public.care_for_pet(text, date)
from public, anon, authenticated;

grant execute on function
  private.care_for_pet(text, date),
  public.care_for_pet(text, date)
to authenticated;
