-- ENUM for upgrade type
create type upgrade_type as enum ('click', 'passive');

-- Players table
create table players (
  player_id serial primary key,
  username varchar(50) unique not null,
  ore_count bigint not null default 0,
  last_login_time timestamptz not null default now()
);

-- Upgrades table
create table upgrades (
  upgrade_id serial primary key,
  name varchar(50) not null,
  upgrade_type upgrade_type not null,
  base_cost bigint not null,
  cost_multiplier float not null,
  base_output bigint not null
);

-- Player Upgrades table
create table player_upgrades (
  player_upgrade_id serial primary key,
  player_id int references players(player_id),
  upgrade_id int references upgrades(upgrade_id),
  quantity int not null default 0,
  unique (player_id, upgrade_id)
);
