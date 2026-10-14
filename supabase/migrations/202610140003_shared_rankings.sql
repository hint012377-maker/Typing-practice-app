-- Run this file in your own Supabase project's SQL Editor.
-- Supports a new installation and the earlier geo_rankings table.
begin;
create table if not exists public.geo_rankings (
  id uuid primary key,
  nickname text not null check (char_length(trim(nickname)) between 1 and 16),
  game text not null check (game in ('typing-ko', 'typing-en', 'climate')),
  score integer not null check (score > 0 and score <= 10000000),
  accuracy integer not null check (accuracy between 0 and 100),
  created_at timestamptz not null default now()
);
alter table public.geo_rankings add column if not exists duration_ms integer;
alter table public.geo_rankings drop constraint if exists valid_completion_duration;
alter table public.geo_rankings add constraint valid_completion_duration check (
  duration_ms is null or (
    game in ('typing-ko', 'typing-en') and score = 197 and duration_ms between 1 and 604800000
  )
);
create index if not exists geo_rankings_order
  on public.geo_rankings (game, score desc, accuracy desc, created_at);
create index if not exists geo_rankings_completion_order
  on public.geo_rankings (game, duration_ms asc, accuracy desc, created_at, id)
  where duration_ms is not null;
alter table public.geo_rankings enable row level security;
grant select, insert on public.geo_rankings to anon;
revoke update, delete on public.geo_rankings from anon;
drop policy if exists "Public learning leaderboard" on public.geo_rankings;
create policy "Public learning leaderboard" on public.geo_rankings
  for select to anon using (true);
drop policy if exists "Anonymous nickname submissions" on public.geo_rankings;
create policy "Anonymous nickname submissions" on public.geo_rankings
  for insert to anon with check (
    created_at between now() - interval '1 day' and now() + interval '1 minute'
    and (
      (game = 'climate' and duration_ms is null)
      or (game in ('typing-ko', 'typing-en') and score = 197 and duration_ms is not null)
    )
  );
commit;
