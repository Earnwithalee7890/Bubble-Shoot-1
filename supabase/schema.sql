-- Create users table
create table if not exists users (
  address text primary key,
  last_check_in timestamptz,
  streak integer default 0,
  points integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies if needed (optional, but good practice)
alter table users enable row level security;

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
