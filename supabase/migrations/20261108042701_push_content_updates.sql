create function private.notify_photo_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null then
    actor := new.uploaded_by;
  end if;

  perform private.push_to_partner(
    new.couple_id,
    actor,
    private.sender_name(actor) || ' editó una foto',
    coalesce(nullif(btrim(new.caption), ''), 'Toca para verla.'),
    '/photos/' || new.id
  );
  return null;
end;
$$;

create function private.notify_note_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  label text;
begin
  if actor is null then
    actor := new.author_id;
  end if;

  if old.pinned is distinct from new.pinned then
    label := case when new.pinned then ' fijó la nota ' else ' desfijó la nota ' end;
  else
    label := ' editó la nota ';
  end if;

  perform private.push_to_partner(
    new.couple_id,
    actor,
    private.sender_name(actor) || label || left(
      coalesce(nullif(btrim(new.title), ''), nullif(btrim(new.content), ''), 'sin título'),
      80
    ),
    left(coalesce(nullif(btrim(new.content), ''), nullif(btrim(new.title), ''), 'Toca para verla.'), 120),
    '/notes/' || new.id
  );
  return null;
end;
$$;

create function private.notify_event_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null then
    actor := new.created_by;
  end if;

  perform private.push_to_partner(
    new.couple_id,
    actor,
    private.sender_name(actor) || ' editó un plan',
    left(coalesce(nullif(btrim(new.title), ''), 'Toca para verlo.'), 120),
    '/calendar/' || new.id
  );
  return null;
end;
$$;

create function private.notify_place_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null then
    actor := new.created_by;
  end if;

  perform private.push_to_partner(
    new.couple_id,
    actor,
    private.sender_name(actor) || ' editó un lugar',
    left(coalesce(nullif(btrim(new.name), ''), 'Toca para verlo.'), 120),
    '/places/' || new.id
  );
  return null;
end;
$$;

create trigger photos_notify_partner_update
after update of caption on public.photos
for each row
when (old.caption is distinct from new.caption)
execute function private.notify_photo_update();

create trigger notes_notify_partner_update
after update of title, content, pinned on public.notes
for each row
when (
  old.title is distinct from new.title
  or old.content is distinct from new.content
  or old.pinned is distinct from new.pinned
)
execute function private.notify_note_update();

create trigger events_notify_partner_update
after update of title, details, starts_on, ends_on, start_time, end_time on public.events
for each row
when (
  old.title is distinct from new.title
  or old.details is distinct from new.details
  or old.starts_on is distinct from new.starts_on
  or old.ends_on is distinct from new.ends_on
  or old.start_time is distinct from new.start_time
  or old.end_time is distinct from new.end_time
)
execute function private.notify_event_update();

create trigger places_notify_partner_update
after update of name, note, latitude, longitude, visited_on, photo_id on public.places
for each row
when (
  old.name is distinct from new.name
  or old.note is distinct from new.note
  or old.latitude is distinct from new.latitude
  or old.longitude is distinct from new.longitude
  or old.visited_on is distinct from new.visited_on
  or old.photo_id is distinct from new.photo_id
)
execute function private.notify_place_update();

revoke execute on function
  private.notify_photo_update(),
  private.notify_note_update(),
  private.notify_event_update(),
  private.notify_place_update()
from public, anon, authenticated;
