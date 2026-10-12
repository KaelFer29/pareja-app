alter table public.photos add constraint photos_id_couple_id_key unique (id, couple_id);
alter table public.notes add constraint notes_id_couple_id_key unique (id, couple_id);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  photo_id uuid,
  note_id uuid,
  emoji text not null check (emoji in ('❤️', '🥰', '😂', '🥹', '🔥', '👏')),
  created_at timestamptz not null default now(),
  constraint reactions_one_target check (num_nonnulls(photo_id, note_id) = 1),
  constraint reactions_photo_fkey foreign key (photo_id, couple_id)
    references public.photos (id, couple_id) on delete cascade,
  constraint reactions_note_fkey foreign key (note_id, couple_id)
    references public.notes (id, couple_id) on delete cascade,
  constraint reactions_user_photo_key unique (user_id, photo_id),
  constraint reactions_user_note_key unique (user_id, note_id)
);

create index reactions_couple_id_idx on public.reactions (couple_id);
create index reactions_photo_id_idx on public.reactions (photo_id) where photo_id is not null;
create index reactions_note_id_idx on public.reactions (note_id) where note_id is not null;

alter table public.reactions enable row level security;

revoke all on public.reactions from anon, authenticated;
grant select, delete on public.reactions to authenticated;
grant insert (couple_id, photo_id, note_id, emoji) on public.reactions to authenticated;
grant update (emoji) on public.reactions to authenticated;

create policy "Ver reacciones de la pareja"
on public.reactions for select
to authenticated
using ((select private.is_couple_member(couple_id)));

create policy "Reaccionar en la pareja"
on public.reactions for insert
to authenticated
with check (
  (select private.is_couple_member(couple_id))
  and user_id = (select auth.uid())
);

create policy "Cambiar reacciones propias"
on public.reactions for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Quitar reacciones propias"
on public.reactions for delete
to authenticated
using (user_id = (select auth.uid()));

alter publication supabase_realtime add table public.reactions;

create function private.notify_reaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
  target text;
  preview text;
  url text;
begin
  if new.photo_id is not null then
    select uploaded_by, nullif(btrim(caption), '')
    into owner_id, preview
    from public.photos where id = new.photo_id;
    target := 'tu foto';
    url := '/photos/' || new.photo_id;
  else
    select author_id, left(coalesce(nullif(btrim(title), ''), btrim(content)), 80)
    into owner_id, preview
    from public.notes where id = new.note_id;
    target := 'tu nota';
    url := '/notes/' || new.note_id;
  end if;

  if owner_id is null or owner_id = new.user_id then
    return null;
  end if;

  perform private.push_to_partner(
    new.couple_id,
    new.user_id,
    private.sender_name(new.user_id) || ' reaccionó ' || new.emoji || ' a ' || target,
    coalesce(preview, 'Toca para verla.'),
    url
  );
  return null;
end;
$$;

create trigger reactions_notify_owner
after insert or update of emoji on public.reactions
for each row execute function private.notify_reaction();

revoke execute on function private.notify_reaction() from public, anon, authenticated;
