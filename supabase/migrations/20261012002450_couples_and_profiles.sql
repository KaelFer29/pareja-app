create schema if not exists private;

grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  avatar_path text,
  mood text,
  updated_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  started_on date,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;

revoke all on public.profiles, public.couples, public.couple_members from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name, avatar_path, mood) on public.profiles to authenticated;
grant select on public.couples to authenticated;
grant update (started_on) on public.couples to authenticated;
grant select on public.couple_members to authenticated;

create function private.is_couple_member(target_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_id = target_couple_id
      and user_id = (select auth.uid())
  );
$$;

create function private.shares_couple_with(other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.couple_members mine
    join public.couple_members theirs on theirs.couple_id = mine.couple_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = other_user_id
  );
$$;

create policy "Ver perfil propio y de la pareja"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or (select private.shares_couple_with(id)));

create policy "Editar perfil propio"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Ver pareja propia"
on public.couples for select
to authenticated
using ((select private.is_couple_member(id)));

create policy "Editar pareja propia"
on public.couples for update
to authenticated
using ((select private.is_couple_member(id)))
with check ((select private.is_couple_member(id)));

create policy "Ver miembros de la pareja propia"
on public.couple_members for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 40));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create function private.generate_invite_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', floor(random() * 32)::int + 1, 1),
    ''
  )
  from generate_series(1, 6);
$$;

create function private.create_couple()
returns public.couples
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_couple public.couples;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from public.couple_members where user_id = current_user_id) then
    raise exception 'already_in_couple';
  end if;

  loop
    begin
      insert into public.couples (invite_code)
      values (private.generate_invite_code())
      returning * into new_couple;
      exit;
    exception when unique_violation then
    end;
  end loop;

  insert into public.couple_members (couple_id, user_id)
  values (new_couple.id, current_user_id);

  return new_couple;
end;
$$;

create function private.join_couple(code text)
returns public.couples
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_couple public.couples;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from public.couple_members where user_id = current_user_id) then
    raise exception 'already_in_couple';
  end if;

  select * into target_couple
  from public.couples
  where invite_code = upper(trim(code))
  for update;

  if not found then
    raise exception 'invalid_code';
  end if;

  if (select count(*) from public.couple_members where couple_id = target_couple.id) >= 2 then
    raise exception 'couple_full';
  end if;

  insert into public.couple_members (couple_id, user_id)
  values (target_couple.id, current_user_id);

  return target_couple;
end;
$$;

create function public.create_couple()
returns public.couples
language sql
security invoker
set search_path = ''
as $$
  select * from private.create_couple();
$$;

create function public.join_couple(code text)
returns public.couples
language sql
security invoker
set search_path = ''
as $$
  select * from private.join_couple(code);
$$;

revoke execute on all functions in schema private from public, anon;
revoke execute on function public.create_couple(), public.join_couple(text) from public, anon;

grant execute on function
  private.is_couple_member(uuid),
  private.shares_couple_with(uuid),
  private.create_couple(),
  private.join_couple(text)
to authenticated;

grant execute on function public.create_couple(), public.join_couple(text) to authenticated;

alter publication supabase_realtime add table public.couple_members, public.profiles;
