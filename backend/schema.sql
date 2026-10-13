-- MANIFEST · Supabase schema
-- Paste this whole file into Supabase → SQL Editor → Run. It is idempotent
-- enough to re-run on an empty project; on a project with data, read it first.
--
-- Posture, stated plainly:
--   * Phones use the public anon (publishable) key. No sign-in.
--   * Phones may: join a room, answer the OPEN activity once, post to a wall,
--     vote once per post. They cannot change room state, edit or delete anything.
--   * Only the host (holding the room key) changes room state, hides posts
--     or resets a room, and only through the SECURITY DEFINER functions below.
--   * Room state, answers, wall posts and the people list are readable by
--     anyone who knows the room code. Do not ask participants to post
--     personal or confidential data.
--   * Progress, help chat and certificates are NOT readable by other phones.
--     A phone reaches only its own rows, by its participant id (a random
--     UUID only that phone knows). The host reads them with the host key.
--   * Sized for one class of up to about 60 people on Supabase's free plan.

create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────── tables ─────────────────────────

create table if not exists public.sessions (
  code        text primary key check (code ~ '^[A-Z0-9]{3,8}$'),
  title       text not null default '',
  state       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- The host key lives in its own table with RLS on and NO policies,
-- so no client can read it. Only the definer functions touch it.
create table if not exists public.session_secrets (
  code      text primary key references public.sessions(code) on delete cascade,
  key_hash  text not null
);

create table if not exists public.participants (
  id         uuid primary key,
  room       text not null references public.sessions(code) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  team       text not null default '' check (char_length(team) <= 20),
  joined_at  timestamptz not null default now()
);
create index if not exists participants_room_idx on public.participants(room);

create table if not exists public.responses (
  id        bigint generated always as identity primary key,
  room      text not null references public.sessions(code) on delete cascade,
  activity  text not null check (char_length(activity) <= 60),
  pid       uuid not null references public.participants(id) on delete cascade,
  name      text not null default '' check (char_length(name) <= 40),
  team      text not null default '' check (char_length(team) <= 20),
  answer    jsonb check (pg_column_size(answer) < 2000),
  ms        integer not null default 0 check (ms between 0 and 600000),
  at        timestamptz not null default now(),
  unique (room, activity, pid)            -- one answer per person per activity
);
create index if not exists responses_room_activity_idx on public.responses(room, activity);

create table if not exists public.posts (
  id      bigint generated always as identity primary key,
  room    text not null references public.sessions(code) on delete cascade,
  board   text not null check (char_length(board) <= 60),
  pid     uuid not null references public.participants(id) on delete cascade,
  author  text not null default '' check (char_length(author) <= 40),   -- '' = anonymous
  team    text not null default '' check (char_length(team) <= 20),
  body    text not null check (char_length(body) between 1 and 280),
  col     text not null default '' check (char_length(col) <= 40),
  votes   integer not null default 0,
  hidden  boolean not null default false,
  at      timestamptz not null default now()
);
create index if not exists posts_room_board_idx on public.posts(room, board);

create table if not exists public.votes (
  post  bigint not null references public.posts(id) on delete cascade,
  pid   uuid not null references public.participants(id) on delete cascade,
  primary key (post, pid)                 -- one vote per person per post
);


-- Progress: one row per person, overwritten as they work. Lets the trainer
-- see who is on which task and who has asked for help.
create table if not exists public.progress (
  pid         uuid primary key references public.participants(id) on delete cascade,
  room        text not null references public.sessions(code) on delete cascade,
  data        jsonb not null default '{}'::jsonb check (pg_column_size(data) < 6000),
  page        text not null default '' check (char_length(page) <= 80),
  help        text not null default '' check (char_length(help) <= 120),   -- '' = fine, else what they are stuck on
  updated_at  timestamptz not null default now()
);
create index if not exists progress_room_idx on public.progress(room);

-- Help chat: private between one participant and the trainer.
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  room       text not null references public.sessions(code) on delete cascade,
  pid        uuid not null references public.participants(id) on delete cascade,
  from_host  boolean not null default false,
  body       text not null check (char_length(body) between 1 and 500),
  context    text not null default '' check (char_length(context) <= 120),
  seen       boolean not null default false,          -- the trainer has read it
  at         timestamptz not null default now()
);
create index if not exists messages_room_idx on public.messages(room, id);
create index if not exists messages_pid_idx  on public.messages(pid, id);

-- Certificates: issued only while the trainer has certificates switched on.
create table if not exists public.certificates (
  id         text primary key check (id ~ '^CTB-[0-9]{4}-[A-Z0-9]{6}$'),
  room       text not null references public.sessions(code) on delete cascade,
  pid        uuid not null unique references public.participants(id) on delete cascade,
  full_name  text not null check (char_length(full_name) between 2 and 80),
  issued_at  timestamptz not null default now()
);

-- ───────────────────────── vote counter ─────────────────────────

create or replace function public.bump_votes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.posts set votes = votes + 1 where id = new.post;
  return new;
end $$;

drop trigger if exists votes_bump on public.votes;
create trigger votes_bump after insert on public.votes
for each row execute function public.bump_votes();

-- ───────────────────────── row level security ─────────────────────────

alter table public.sessions        enable row level security;
alter table public.session_secrets enable row level security;   -- no policies on purpose
alter table public.participants    enable row level security;
alter table public.responses       enable row level security;
alter table public.posts           enable row level security;
alter table public.votes           enable row level security;
-- No policies on these three on purpose: only the functions below reach them.
alter table public.progress        enable row level security;
alter table public.messages        enable row level security;
alter table public.certificates    enable row level security;

drop policy if exists sessions_read on public.sessions;
create policy sessions_read on public.sessions for select using (true);

drop policy if exists participants_read on public.participants;
create policy participants_read on public.participants for select using (true);

drop policy if exists responses_read on public.responses;
create policy responses_read on public.responses for select using (true);

-- An answer is accepted only while that activity is the open one in its room.
-- A tap that lands after the host locks the question is refused by the database,
-- not just by the phone.
drop policy if exists responses_insert on public.responses;
create policy responses_insert on public.responses for insert with check (
  exists (
    select 1 from public.sessions s
    where s.code = responses.room
      and s.state -> 'act' ->> 'id' = responses.activity
      and s.state -> 'act' ->> 'phase' = 'open'
  )
  and exists (select 1 from public.participants p where p.id = responses.pid and p.room = responses.room)
);

drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select using (true);

drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert with check (
  hidden = false and votes = 0
  and exists (select 1 from public.participants p where p.id = posts.pid and p.room = posts.room)
);

drop policy if exists votes_read on public.votes;
create policy votes_read on public.votes for select using (true);

drop policy if exists votes_insert on public.votes;
create policy votes_insert on public.votes for insert with check (true);

-- ───────────────────────── functions ─────────────────────────

-- Phones join through this, so they never need update rights on the table.
create or replace function public.join_room(p_id uuid, p_room text, p_name text, p_team text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.sessions where code = p_room) then
    raise exception 'room % is not open', p_room using errcode = 'P0002';
  end if;
  insert into public.participants (id, room, name, team)
  values (p_id, p_room, left(trim(p_name), 40), left(coalesce(p_team, ''), 20))
  on conflict (id) do update set name = excluded.name, team = excluded.team, room = excluded.room;
end $$;

-- First call with a new room code creates the room and sets its key.
-- Later calls return true only if the key matches.
create or replace function public.host_open(p_room text, p_key text, p_title text default '')
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare h text;
begin
  if char_length(coalesce(p_key, '')) < 6 then
    raise exception 'host key must be at least 6 characters';
  end if;
  select key_hash into h from public.session_secrets where code = p_room;
  if h is null then
    insert into public.sessions (code, title) values (p_room, coalesce(p_title, ''))
      on conflict (code) do nothing;
    insert into public.session_secrets (code, key_hash) values (p_room, crypt(p_key, gen_salt('bf')));
    return true;
  end if;
  return h = crypt(p_key, h);
end $$;

create or replace function public.host_check(p_room text, p_key text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare h text;
begin
  select key_hash into h from public.session_secrets where code = p_room;
  if h is null or h <> crypt(p_key, h) then
    raise exception 'wrong host key' using errcode = '28000';
  end if;
end $$;

create or replace function public.host_set_state(p_room text, p_key text, p_state jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.host_check(p_room, p_key);
  update public.sessions set state = p_state, updated_at = now() where code = p_room;
end $$;

create or replace function public.host_hide_post(p_room text, p_key text, p_post bigint, p_hidden boolean)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.host_check(p_room, p_key);
  update public.posts set hidden = p_hidden where id = p_post and room = p_room;
end $$;

-- Wipes answers, posts and people for one room. Use it after rehearsal.
create or replace function public.host_reset(p_room text, p_key text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.host_check(p_room, p_key);
  delete from public.messages     where room = p_room;
  delete from public.progress     where room = p_room;
  delete from public.certificates where room = p_room;
  delete from public.responses    where room = p_room;
  delete from public.posts        where room = p_room;
  delete from public.participants where room = p_room;
  update public.sessions set state = '{}'::jsonb, updated_at = now() where code = p_room;
end $$;

revoke all on function public.host_check(text, text) from public, anon, authenticated;
grant execute on function public.join_room(uuid, text, text, text)        to anon, authenticated;
grant execute on function public.host_open(text, text, text)              to anon, authenticated;
grant execute on function public.host_set_state(text, text, jsonb)        to anon, authenticated;
grant execute on function public.host_hide_post(text, text, bigint, boolean) to anon, authenticated;
grant execute on function public.host_reset(text, text)                   to anon, authenticated;

-- ───────────────────────── progress, help chat, certificates ─────────────────────────

create or replace function public.is_member(p_pid uuid, p_room text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.participants where id = p_pid and room = p_room)
$$;

create or replace function public.save_progress(p_pid uuid, p_room text, p_data jsonb, p_page text, p_help text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_member(p_pid, p_room) then raise exception 'not in this room' using errcode = '42501'; end if;
  insert into public.progress (pid, room, data, page, help, updated_at)
  values (p_pid, p_room, coalesce(p_data, '{}'::jsonb), left(coalesce(p_page, ''), 80), left(coalesce(p_help, ''), 120), now())
  on conflict (pid) do update set room = excluded.room, data = excluded.data, page = excluded.page, help = excluded.help, updated_at = now();
end $$;

create or replace function public.send_message(p_pid uuid, p_room text, p_body text, p_context text default '')
returns bigint language plpgsql security definer set search_path = public as $$
declare new_id bigint;
begin
  if not public.is_member(p_pid, p_room) then raise exception 'not in this room' using errcode = '42501'; end if;
  if (select count(*) from public.messages where pid = p_pid and not from_host and at > now() - interval '10 minutes') >= 20 then
    raise exception 'too many messages, wait a minute' using errcode = '54000';
  end if;
  insert into public.messages (room, pid, from_host, body, context)
  values (p_room, p_pid, false, left(trim(p_body), 500), left(coalesce(p_context, ''), 120))
  returning id into new_id;
  return new_id;
end $$;

-- A phone reads only its own thread.
create or replace function public.my_messages(p_pid uuid, p_room text, p_after bigint default 0)
returns table (id bigint, from_host boolean, body text, context text, at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.id, m.from_host, m.body, m.context, m.at from public.messages m
  where m.pid = p_pid and m.room = p_room and m.id > coalesce(p_after, 0)
  order by m.id limit 200
$$;

create or replace function public.host_inbox(p_room text, p_key text, p_after bigint default 0)
returns table (id bigint, pid uuid, from_host boolean, body text, context text, seen boolean, at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.host_check(p_room, p_key);
  return query select m.id, m.pid, m.from_host, m.body, m.context, m.seen, m.at from public.messages m
    where m.room = p_room and m.id > coalesce(p_after, 0) order by m.id limit 1000;
end $$;

create or replace function public.host_reply(p_room text, p_key text, p_pid uuid, p_body text)
returns bigint language plpgsql security definer set search_path = public, extensions as $$
declare new_id bigint;
begin
  perform public.host_check(p_room, p_key);
  if not public.is_member(p_pid, p_room) then raise exception 'not in this room'; end if;
  insert into public.messages (room, pid, from_host, body, seen) values (p_room, p_pid, true, left(trim(p_body), 500), true)
  returning id into new_id;
  update public.messages set seen = true where pid = p_pid and room = p_room and not from_host;
  update public.progress set help = '' where pid = p_pid;
  return new_id;
end $$;

create or replace function public.host_mark_seen(p_room text, p_key text, p_pid uuid)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.host_check(p_room, p_key);
  update public.messages set seen = true where pid = p_pid and room = p_room and not from_host;
end $$;

create or replace function public.host_progress(p_room text, p_key text)
returns table (pid uuid, data jsonb, page text, help text, updated_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.host_check(p_room, p_key);
  return query select g.pid, g.data, g.page, g.help, g.updated_at from public.progress g where g.room = p_room;
end $$;

create or replace function public.host_clear_help(p_room text, p_key text, p_pid uuid)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.host_check(p_room, p_key);
  update public.progress set help = '' where pid = p_pid and room = p_room;
end $$;

-- Works only after the trainer switches certificates on (room state "certs": true).
-- Asking again returns the same certificate, with the name updated.
create or replace function public.claim_certificate(p_pid uuid, p_room text, p_name text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare cid text; nm text := left(regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g'), 80);
begin
  if not public.is_member(p_pid, p_room) then raise exception 'not in this room' using errcode = '42501'; end if;
  if not exists (select 1 from public.sessions where code = p_room and state ->> 'certs' = 'true') then
    raise exception 'certificates are not open yet' using errcode = '42501';
  end if;
  if char_length(nm) < 2 then raise exception 'please type your full name'; end if;
  select id into cid from public.certificates where pid = p_pid;
  if cid is not null then
    update public.certificates set full_name = nm where id = cid;
    return cid;
  end if;
  loop
    cid := 'CTB-' || to_char(now() at time zone 'Asia/Bangkok', 'YYMM') || '-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6));
    begin
      insert into public.certificates (id, room, pid, full_name) values (cid, p_room, p_pid, nm);
      return cid;
    exception when unique_violation then
      if exists (select 1 from public.certificates where pid = p_pid) then
        select id into cid from public.certificates where pid = p_pid; return cid;
      end if;
    end;
  end loop;
end $$;

-- Public: anyone with a certificate ID can check it is real (LinkedIn links here).
create or replace function public.verify_certificate(p_id text)
returns table (id text, full_name text, course text, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.id, c.full_name, s.title, c.issued_at from public.certificates c join public.sessions s on s.code = c.room
  where c.id = upper(trim(p_id))
$$;

revoke all on function public.is_member(uuid, text) from public, anon, authenticated;
grant execute on function public.save_progress(uuid, text, jsonb, text, text)  to anon, authenticated;
grant execute on function public.send_message(uuid, text, text, text)         to anon, authenticated;
grant execute on function public.my_messages(uuid, text, bigint)              to anon, authenticated;
grant execute on function public.host_inbox(text, text, bigint)               to anon, authenticated;
grant execute on function public.host_reply(text, text, uuid, text)           to anon, authenticated;
grant execute on function public.host_mark_seen(text, text, uuid)             to anon, authenticated;
grant execute on function public.host_progress(text, text)                    to anon, authenticated;
grant execute on function public.host_clear_help(text, text, uuid)            to anon, authenticated;
grant execute on function public.claim_certificate(uuid, text, text)          to anon, authenticated;
grant execute on function public.verify_certificate(text)                     to anon, authenticated;

-- ───────────────────────── realtime ─────────────────────────
-- Phones follow the host through UPDATEs on sessions; the host and the
-- projector count answers and wall posts as they arrive.
do $$
begin
  begin alter publication supabase_realtime add table public.sessions;     exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.participants; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.responses;    exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.posts;        exception when duplicate_object then null; end;
end $$;
