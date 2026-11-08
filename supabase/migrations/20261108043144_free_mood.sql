alter table public.profiles
drop constraint if exists profiles_mood_valid;

alter table public.profiles
add column mood_emoji text check (mood_emoji is null or char_length(mood_emoji) between 1 and 8),
add column mood_text text check (mood_text is null or char_length(mood_text) <= 15);

update public.profiles
set
  mood_emoji = case mood
    when 'happy' then '😊'
    when 'loving' then '🥰'
    when 'calm' then '😌'
    when 'tired' then '😴'
    when 'sad' then '😢'
    when 'stressed' then '😣'
  end,
  mood_text = case mood
    when 'happy' then 'Feliz'
    when 'loving' then 'Con amor'
    when 'calm' then 'En calma'
    when 'tired' then 'Con sueño'
    when 'sad' then 'Triste'
    when 'stressed' then 'Con estrés'
  end
where mood is not null;

alter table public.profiles
drop column mood;

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_path, mood_emoji, mood_text) on public.profiles to authenticated;
