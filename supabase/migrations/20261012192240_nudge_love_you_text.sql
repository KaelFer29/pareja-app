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
    '/'
  );
  return null;
end;
$$;
