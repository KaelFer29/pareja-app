alter table public.profiles
add constraint profiles_mood_valid
check (mood is null or mood in ('happy', 'loving', 'calm', 'tired', 'sad', 'stressed'));

create table public.nudges (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  sender_id uuid default auth.uid() references public.profiles (id) on delete set null,
  kind text not null check (kind in ('thinking_of_you', 'miss_you', 'love_you', 'hug')),
  created_at timestamptz not null default now()
);

create index nudges_couple_id_created_at_idx on public.nudges (couple_id, created_at desc);
create index nudges_sender_id_idx on public.nudges (sender_id);

alter table public.nudges enable row level security;

revoke all on public.nudges from anon, authenticated;
grant select on public.nudges to authenticated;
grant insert (couple_id, kind) on public.nudges to authenticated;

create policy "Ver toques de la pareja"
on public.nudges for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Enviar toques a la pareja"
on public.nudges for insert
to authenticated
with check (
  (select private.is_couple_member(couple_id))
  and sender_id = (select auth.uid())
);

alter publication supabase_realtime add table public.nudges;
