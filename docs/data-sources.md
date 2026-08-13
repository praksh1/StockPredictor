# Data-source rules

## Beta policy

The private beta supports U.S. equities and delayed market quotes. Every price must show the provider and delay. Do not call delayed data â€œreal-time.â€

## Permitted MVP inputs

- SEC EDGAR filings and structured company facts, accessed within SEC fair-access rules.
- Official company investor-relations feeds where terms allow the intended use.
- One commercial news provider with written rights for in-app display, alerting, storing, and AI processing.
- One commercial market-data provider whose agreement allows the selected delayed display to product users.
- Official macroeconomic releases where terms permit use.

## Prohibited shortcuts

- Do not scrape a website whose terms prohibit it.
- Do not use a personal/developer-only API plan in a paid SaaS product.
- Do not store or expose full article text beyond the purchased license.
- Do not describe demo data as live data.
- Do not treat social-media posts as verified facts. Social feeds are out of the MVP.

## Provider adapter contract

Every provider integration implements an adapter that normalizes records and reports: provider name, license scope, delay, retrieval time, original URL, source quality, and provider-health status. Application code must depend on this contract rather than a vendor-specific response shape.
