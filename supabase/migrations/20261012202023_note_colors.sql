alter table public.notes
  add column color text not null default 'yellow'
  check (color in ('yellow', 'pink', 'peach', 'mint', 'lilac', 'sky'));

grant insert (color) on public.notes to authenticated;
grant update (color) on public.notes to authenticated;
