create table public.important_dates (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null check (btrim(title) <> '' and char_length(title) <= 60),
  date date not null,
  repeats_yearly boolean not null default true,
  created_at timestamptz not null default now()
);

create index important_dates_couple_id_date_idx on public.important_dates (couple_id, date);

alter table public.important_dates enable row level security;

revoke all on public.important_dates from anon, authenticated;
grant select, delete on public.important_dates to authenticated;
grant insert (couple_id, title, date, repeats_yearly) on public.important_dates to authenticated;
grant update (title, date, repeats_yearly) on public.important_dates to authenticated;

create policy "Ver fechas de la pareja"
on public.important_dates for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Crear fechas en la pareja"
on public.important_dates for insert
to authenticated
with check ((select private.is_couple_member(couple_id)));

create policy "Editar fechas de la pareja"
on public.important_dates for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));

create policy "Eliminar fechas de la pareja"
on public.important_dates for delete
to authenticated
using ((select private.is_couple_member(couple_id)));

alter publication supabase_realtime add table public.important_dates, public.couples;
