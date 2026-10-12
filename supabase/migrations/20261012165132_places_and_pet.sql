create table public.places (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  name text not null check (btrim(name) <> '' and char_length(name) <= 80),
  note text not null default '' check (char_length(note) <= 1000),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  visited_on date,
  photo_id uuid,
  created_at timestamptz not null default now(),
  constraint places_photo_fkey foreign key (photo_id, couple_id)
    references public.photos (id, couple_id) on delete set null (photo_id)
);

create index places_couple_id_idx on public.places (couple_id, created_at desc);
create index places_created_by_idx on public.places (created_by);
create index places_photo_id_idx on public.places (photo_id) where photo_id is not null;

alter table public.places enable row level security;

revoke all on public.places from anon, authenticated;
grant select, delete on public.places to authenticated;
grant insert (couple_id, name, note, latitude, longitude, visited_on, photo_id)
  on public.places to authenticated;
grant update (name, note, latitude, longitude, visited_on, photo_id)
  on public.places to authenticated;

create policy "Ver lugares de la pareja"
on public.places for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Crear lugares en la pareja"
on public.places for insert
to authenticated
with check (
  (select private.is_couple_member(couple_id))
  and created_by = (select auth.uid())
);

create policy "Editar lugares de la pareja"
on public.places for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));

create policy "Eliminar lugares de la pareja"
on public.places for delete
to authenticated
using ((select private.is_couple_member(couple_id)));

create function private.notify_new_place()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.push_to_partner(
    new.couple_id,
    new.created_by,
    private.sender_name(new.created_by) || ' marcó un lugar',
    new.name,
    '/places/' || new.id
  );
  return null;
end;
$$;

create trigger places_notify_partner
after insert on public.places
for each row execute function private.notify_new_place();

create table public.pets (
  couple_id uuid primary key references public.couples (id) on delete cascade,
  name text not null check (btrim(name) <> '' and char_length(name) <= 24),
  fullness real not null default 80 check (fullness between 0 and 100),
  happiness real not null default 80 check (happiness between 0 and 100),
  xp integer not null default 0 check (xp >= 0),
  updated_at timestamptz not null default now(),
  last_action text check (last_action in ('feed', 'pet', 'play')),
  last_actor uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index pets_last_actor_idx on public.pets (last_actor);

alter table public.pets enable row level security;

revoke all on public.pets from anon, authenticated;
grant select on public.pets to authenticated;
grant update (name) on public.pets to authenticated;

create policy "Ver la mascota de la pareja"
on public.pets for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Renombrar la mascota de la pareja"
on public.pets for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));

create function private.my_couple_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select couple_id from public.couple_members where user_id = (select auth.uid());
$$;

create function private.adopt_pet(pet_name text)
returns public.pets
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_couple_id uuid := private.my_couple_id();
  result public.pets;
begin
  if target_couple_id is null then
    raise exception 'not_in_couple';
  end if;

  insert into public.pets (couple_id, name)
  values (target_couple_id, btrim(pet_name))
  on conflict (couple_id) do nothing;

  select * into result from public.pets where couple_id = target_couple_id;
  return result;
end;
$$;

create function private.care_for_pet(action text)
returns public.pets
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_couple_id uuid := private.my_couple_id();
  pet_row public.pets;
  hours real;
  next_fullness real;
  next_happiness real;
  gained integer := 0;
  result public.pets;
begin
  if target_couple_id is null then
    raise exception 'not_in_couple';
  end if;

  if action not in ('feed', 'pet', 'play') then
    raise exception 'invalid_action';
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

  update public.pets
  set fullness = next_fullness,
      happiness = next_happiness,
      xp = xp + gained,
      updated_at = now(),
      last_action = action,
      last_actor = (select auth.uid())
  where couple_id = target_couple_id
  returning * into result;

  return result;
end;
$$;

create function public.adopt_pet(pet_name text)
returns public.pets
language sql
security invoker
set search_path = ''
as $$
  select * from private.adopt_pet(pet_name);
$$;

create function public.care_for_pet(action text)
returns public.pets
language sql
security invoker
set search_path = ''
as $$
  select * from private.care_for_pet(action);
$$;

alter publication supabase_realtime add table public.places, public.pets;

revoke execute on function
  private.notify_new_place(),
  private.my_couple_id(),
  private.adopt_pet(text),
  private.care_for_pet(text),
  public.adopt_pet(text),
  public.care_for_pet(text)
from public, anon, authenticated;

grant execute on function
  private.adopt_pet(text),
  private.care_for_pet(text),
  public.adopt_pet(text),
  public.care_for_pet(text)
to authenticated;
