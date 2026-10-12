drop index public.reactions_photo_id_idx;
drop index public.reactions_note_id_idx;
drop index public.places_photo_id_idx;

create index reactions_photo_id_couple_id_idx on public.reactions (photo_id, couple_id);
create index reactions_note_id_couple_id_idx on public.reactions (note_id, couple_id);
create index places_photo_id_couple_id_idx on public.places (photo_id, couple_id);
