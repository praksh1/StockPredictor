# System architecture

## Boundary rule

The customer-facing web application only displays data and requests actions. It never holds an AI, market-data, payment, or email-provider secret. Background workers perform ingestion, analysis, and delivery.

## MVP components

| Component | Responsibility |
|---|---|
| Next.js web app | Landing page, accounts, watchlists, alerts, preferences, and admin interface. |
| API service | Authorizes requests, reads/writes PostgreSQL, and creates background jobs. |
| PostgreSQL | Source of truth for users, entitlements, watchlists, events, analyses, and deliveries. |
| Redis queue | Durable work queue, retries, rate limits, and duplicate-job locks. |
| Ingestion workers | Read authorized source feeds and record normalized source documents. |
| Analysis workers | Group duplicate reports, rank events, collect context, run AI, and validate its result. |
| Delivery workers | Match alerts to users, enforce preferences/quotas, and send in-app/push/email notices. |

## Event processing flow

1. An authorized feed supplies a source document.
2. The ingestion worker records the original URL, publisher, timestamps, license/provider ID, and content hash.
3. The normalizer extracts tickers, companies, event type, and a safe text representation.
4. A clustering service groups materially similar documents into one `event` while retaining every source link.
5. Rules score importance and relevance before any expensive AI request.
6. For a material event, the context service fetches permitted delayed-price, technical, and macro context.
7. The AI provider receives an evidence packet and returns a validated structured assessmentâ€”not a free-form prediction.
8. Each affected security receives a distinct stock-impact assessment. A single event may be bullish for one security and bearish for another.
9. The delivery worker matches eligible alerts to watchlist users, applies preferences and entitlement limits, and records delivery results.

## Failure behavior

- A broken source is marked unavailable; it is never replaced with invented information.
- Failed tasks retry with a capped backoff and an idempotency key.
- An AI/provider failure shows â€œanalysis temporarily unavailableâ€ and preserves the original source.
- A failed notification does not create another billed alert.
- Provider health, failed jobs, and retry counts are visible to administrators.
