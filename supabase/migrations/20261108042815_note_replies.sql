do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notes_id_couple_id_key'
  ) then
    alter table public.notes
    add constraint notes_id_couple_id_key unique (id, couple_id);
  end if;
end $$;

create table public.note_replies (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  note_id uuid not null,
  author_id uuid default auth.uid() references public.profiles (id) on delete set null,
  content text not null check (btrim(content) <> '' and char_length(content) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint note_replies_note_couple_fkey
    foreign key (note_id, couple_id) references public.notes (id, couple_id) on delete cascade
);

create index note_replies_note_id_created_at_idx
  on public.note_replies (note_id, created_at asc, id asc);

create trigger note_replies_set_updated_at
before update on public.note_replies
for each row
when (old.content is distinct from new.content)
execute function private.set_updated_at();

alter table public.note_replies enable row level security;

revoke all on public.note_replies from anon, authenticated;
grant select, delete on public.note_replies to authenticated;
grant insert (couple_id, note_id, content) on public.note_replies to authenticated;
grant update (content) on public.note_replies to authenticated;

create policy "Ver respuestas de la pareja"
on public.note_replies for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Crear respuestas en la pareja"
on public.note_replies for insert
to authenticated
with check (
  (select private.is_couple_member(couple_id))
  and author_id = (select auth.uid())
);

create policy "Editar respuestas de la pareja"
on public.note_replies for update
to authenticated
using ((select private.is_couple_member(couple_id)))
with check ((select private.is_couple_member(couple_id)));

create policy "Eliminar respuestas de la pareja"
on public.note_replies for delete
to authenticated
using ((select private.is_couple_member(couple_id)));

alter publication supabase_realtime add table public.note_replies;

create function private.notify_new_note_reply()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.push_to_partner(
    new.couple_id,
    new.author_id,
    private.sender_name(new.author_id) || ' respondió una nota',
    left(btrim(new.content), 120),
    '/notes/' || new.note_id
  );
  return null;
end;
$$;

create function private.notify_note_reply_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null then
    actor := new.author_id;
  end if;

  perform private.push_to_partner(
    new.couple_id,
    actor,
    private.sender_name(actor) || ' editó una respuesta',
    left(btrim(new.content), 120),
    '/notes/' || new.note_id
  );
  return null;
end;
$$;

create trigger note_replies_notify_partner
after insert on public.note_replies
for each row execute function private.notify_new_note_reply();

create trigger note_replies_notify_partner_update
after update of content on public.note_replies
for each row
when (old.content is distinct from new.content)
execute function private.notify_note_reply_update();

revoke execute on function
  private.notify_new_note_reply(),
  private.notify_note_reply_update()
from public, anon, authenticated;
