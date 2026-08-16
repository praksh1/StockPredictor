-- Starter security catalog for the private beta. These are identifiers only;
-- this migration does not create prices, alerts, or simulated market data.
insert into public.securities (ticker, name, exchange, sector, industry)
values
  ('AAPL', 'Apple Inc.', 'NASDAQ', 'Technology', 'Consumer Electronics'),
  ('AMD', 'Advanced Micro Devices, Inc.', 'NASDAQ', 'Technology', 'Semiconductors'),
  ('AMZN', 'Amazon.com, Inc.', 'NASDAQ', 'Consumer Discretionary', 'Broadline Retail'),
  ('CVX', 'Chevron Corporation', 'NYSE', 'Energy', 'Integrated Oil and Gas'),
  ('META', 'Meta Platforms, Inc.', 'NASDAQ', 'Communication Services', 'Interactive Media'),
  ('MSFT', 'Microsoft Corporation', 'NASDAQ', 'Technology', 'Software'),
  ('NVDA', 'NVIDIA Corporation', 'NASDAQ', 'Technology', 'Semiconductors'),
  ('TSLA', 'Tesla, Inc.', 'NASDAQ', 'Consumer Discretionary', 'Automobiles')
on conflict (ticker, exchange) do update
set name = excluded.name, sector = excluded.sector, industry = excluded.industry, is_active = true;
