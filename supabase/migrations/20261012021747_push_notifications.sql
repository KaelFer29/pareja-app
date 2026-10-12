create extension if not exists pg_net with schema extensions;

create table public.push_tokens (
  token text primary key check (token ~ '^Expo(nent)?PushToken\[.+\]$'),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('android', 'ios')),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

revoke all on public.push_tokens from anon, authenticated;
grant select, delete on public.push_tokens to authenticated;

create policy "Ver tokens propios"
on public.push_tokens for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Eliminar tokens propios"
on public.push_tokens for delete
to authenticated
using (user_id = (select auth.uid()));

create function private.register_push_token(new_token text, new_platform text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.push_tokens (token, user_id, platform)
  values (new_token, (select auth.uid()), new_platform)
  on conflict (token) do update
  set user_id = excluded.user_id,
      platform = excluded.platform,
      updated_at = now();
end;
$$;

create function public.register_push_token(new_token text, new_platform text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.register_push_token(new_token, new_platform);
$$;

create function private.push_to_partner(
  target_couple_id uuid,
  sender_id uuid,
  title text,
  body text,
  url text
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
  from public.push_tokens tokens
  join public.couple_members members on members.user_id = tokens.user_id
  where members.couple_id = target_couple_id
    and members.user_id is distinct from sender_id;

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

create function private.sender_name(sender_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select nullif(btrim(display_name), '') from public.profiles where id = sender_id),
    'Tu pareja'
  );
$$;

create function private.notify_new_photo()
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
    '/photos/' || new.id
  );
  return null;
end;
$$;

create function private.notify_new_note()
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
    '/notes/' || new.id
  );
  return null;
end;
$$;

create function private.notify_new_nudge()
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
      when 'love_you' then '❤️ Te quiero'
      when 'hug' then '🤗 Un abrazo'
      else 'Te envió un toque'
    end,
    '/'
  );
  return null;
end;
$$;

create trigger photos_notify_partner
after insert on public.photos
for each row execute function private.notify_new_photo();

create trigger notes_notify_partner
after insert on public.notes
for each row execute function private.notify_new_note();

create trigger nudges_notify_partner
after insert on public.nudges
for each row execute function private.notify_new_nudge();

revoke execute on function
  private.register_push_token(text, text),
  private.push_to_partner(uuid, uuid, text, text, text),
  private.sender_name(uuid),
  private.notify_new_photo(),
  private.notify_new_note(),
  private.notify_new_nudge()
from public, anon, authenticated;

revoke execute on function public.register_push_token(text, text) from public, anon;

grant execute on function private.register_push_token(text, text) to authenticated;
grant execute on function public.register_push_token(text, text) to authenticated;
