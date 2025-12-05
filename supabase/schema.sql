-- Create users table
create table if not exists users (
  address text primary key,
  last_check_in timestamptz,
  streak integer default 0,
  points integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create notification_tokens table for Farcaster push notifications
create table if not exists notification_tokens (
  fid text primary key,
  token text not null,
  url text not null,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies if needed (optional, but good practice)
alter table users enable row level security;
alter table notification_tokens enable row level security;

create policy "Users can view their own data"
  on users for select
  using ( auth.uid()::text = address ); -- Note: This assumes auth.uid() matches address, which might not be true if using custom auth. 
  -- If using simple public access for this demo:
  
create policy "Public read access"
  on users for select
  using ( true );

create policy "Service role write access"
  on users for all
  using ( true ); -- Ideally restrict this to service role only

-- Notification tokens policies
create policy "Public insert for notifications"
  on notification_tokens for insert
  with check ( true );

create policy "Service role full access for notifications"
  on notification_tokens for all
  using ( true );

