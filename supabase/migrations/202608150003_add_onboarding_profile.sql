-- Stores a user-selected trading style for product personalization. This is
-- not investment suitability information and does not produce advice.
alter table public.profiles
  add column if not exists trader_style text check (trader_style in ('day_trader', 'swing_trader', 'long_term_investor', 'combination')),
  add column if not exists onboarding_completed_at timestamptz;

revoke update on public.profiles from authenticated;
grant update (display_name, trader_style, onboarding_completed_at, updated_at) on public.profiles to authenticated;
