alter table public.profiles
add column notification_prefs jsonb not null
default '{
  "photos": true,
  "notes": true,
  "nudges": true,
  "edits": true,
  "events": true,
  "places": true,
  "pet": true,
  "reactions": true
}'::jsonb;

alter table public.profiles
add constraint profiles_notification_prefs_object
check (jsonb_typeof(notification_prefs) = 'object');

grant update (notification_prefs) on public.profiles to authenticated;

drop function private.push_to_partner(uuid, uuid, text, text, text);

create function private.push_to_partner(
  target_couple_id uuid,
  sender_id uuid,
  title text,
  body text,
  url text,
  kind text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  messages jsonb;
begin
  select jsonb_agg(jsonb_build_object(
    'to', tokens.token,
    'title', title,
    'body', body,
    'sound', 'default',
    'channelId', 'default',
    'data', jsonb_build_object('url', url)
  ))
  into messages
  from public.push_tokens as tokens
  join public.couple_members as members on members.user_id = tokens.user_id
  join public.profiles as profiles on profiles.id = tokens.user_id
  where members.couple_id = target_couple_id
    and members.user_id is distinct from sender_id
    and coalesce((profiles.notification_prefs ->> kind)::boolean, true);

  if messages is null then
    return;
  end if;

  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    body := messages,
    headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb
  );
exception when others then
  raise warning 'push_to_partner failed: %', sqlerrm;
end;
$$;

create or replace function private.notify_new_photo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.push_to_partner(
    new.couple_id,
    new.uploaded_by,
    private.sender_name(new.uploaded_by) || ' compartió una foto',
    coalesce(nullif(btrim(new.caption), ''), 'Toca para verla.'),
    '/photos/' || new.id,
    'photos'
  );
  return null;
end;
$$;

create or replace function private.notify_new_note()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.push_to_partner(
    new.couple_id,
    new.author_id,
    private.sender_name(new.author_id) || ' escribió una nota',
    left(coalesce(nullif(btrim(new.title), ''), btrim(new.content)), 120),
    '/notes/' || new.id,
    'notes'
  );
  return null;
end;
$$;

create or replace function private.notify_new_nudge()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.push_to_partner(
    new.couple_id,
    new.sender_id,
    private.sender_name(new.sender_id),
    case new.kind
      when 'thinking_of_you' then '💭 Pienso en ti'
      when 'miss_you' then '🥺 Te extraño'
      when 'love_you' then '❤️ Te amo'
      when 'hug' then '🤗 Un abrazo'
      else 'Te envió un toque'
    end,
    '/',
    'nudges'
  );
  return null;
end;
$$;

create or replace function private.notify_photo_update()
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
    '/photos/' || new.id,
    'edits'
  );
  return null;
end;
$$;

create or replace function private.notify_note_update()
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
    '/notes/' || new.id,
    'edits'
  );
  return null;
end;
$$;

create or replace function private.notify_event_update()
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
    '/calendar/' || new.id,
    'edits'
  );
  return null;
end;
$$;

create or replace function private.notify_place_update()
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
    '/places/' || new.id,
    'edits'
  );
  return null;
end;
$$;

create or replace function private.notify_new_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.push_to_partner(
    new.couple_id,
    new.created_by,
    private.sender_name(new.created_by) || ' agregó un plan',
    new.title || ' · ' || to_char(new.starts_on, 'DD/MM')
      || coalesce(' ' || to_char(new.start_time, 'HH24:MI'), ''),
    '/calendar/' || new.id,
    'events'
  );
  return null;
end;
$$;

create or replace function private.notify_new_place()
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
    '/places/' || new.id,
    'places'
  );
  return null;
end;
$$;

create or replace function private.notify_reaction()
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
    url,
    'reactions'
  );
  return null;
end;
$$;

create or replace function private.notify_new_note_reply()
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
    '/notes/' || new.note_id,
    'notes'
  );
  return null;
end;
$$;

create or replace function private.notify_note_reply_update()
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
    '/notes/' || new.note_id,
    'edits'
  );
  return null;
end;
$$;

create or replace function private.notify_new_outing()
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
    '/pet',
    'pet'
  );
  return null;
end;
$$;
