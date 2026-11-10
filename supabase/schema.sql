-- Birthday Bingo Party App Schema
-- Run this in the Supabase SQL Editor

-- Config table (single row for game settings)
create table config (
  id int primary key default 1 check (id = 1),
  grid_size int not null default 4 check (grid_size in (4, 5)),
  created_at timestamptz default now()
);

insert into config (grid_size) values (4);

-- Challenges pool
create table challenges (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz default now()
);

-- Players
create table players (
  id uuid primary key default gen_random_uuid(),
  name text,
  card_token text unique not null,
  created_at timestamptz default now()
);

-- Prizes
create table prizes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  won_by uuid references players(id),
  created_at timestamptz default now()
);

-- Bingo cards (one row per cell)
create table cards (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  challenge_id uuid not null references challenges(id),
  row int not null,
  col int not null,
  completed boolean not null default false,
  unique(player_id, row, col)
);

-- Tracks which bingo lines have been claimed
create table claimed_lines (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  line_type text not null check (line_type in ('row', 'col', 'diagonal')),
  line_index int not null,
  is_first boolean not null default false,
  prize_id uuid references prizes(id),
  created_at timestamptz default now(),
  unique(player_id, line_type, line_index)
);

-- Enable realtime on prizes table
alter publication supabase_realtime add table prizes;
alter publication supabase_realtime add table cards;

alter table config disable row level security;
alter table challenges disable row level security;
alter table players disable row level security;
alter table prizes disable row level security;
alter table cards disable row level security;
alter table claimed_lines disable row level security;
