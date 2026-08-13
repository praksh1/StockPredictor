# MarketPulse AI

MarketPulse AI is a market-intelligence product that helps users understand potentially market-moving information about stocks on their watchlist. It provides cited, probabilistic AI assessments; it does not provide financial advice, trade instructions, or guaranteed predictions.

## Status

Phase 1 foundation is in progress. The application is not yet ready to deploy. See the documents in `docs/` before adding a data source or user-facing signal.

## Product decisions already made

- Initial market: U.S. equities.
- Private beta quote policy: delayed quotes, visibly labelled with the provider delay.
- Initial channels: in-app alerts, web push, and email.
- Production data must be licensed for the proposed display, alerting, storage, and AI-processing use.
- The system must distinguish source-backed facts from AI inferences.

## Repository map

- `docs/architecture.md` â€” system boundaries and event pipeline.
- `docs/ai-safety.md` â€” required AI output, validation, and user language.
- `docs/data-sources.md` â€” provider and licensing rules.
- `docs/database.md` â€” entity definitions and billing semantics.
- `supabase/migrations/` â€” PostgreSQL database migrations.

## Financial safety notice

Information produced by MarketPulse AI is for informational and educational purposes only. It is not financial, investment, trading, legal, or tax advice. Assessments may be inaccurate, incomplete, or delayed. Past performance and historical relationships do not guarantee future results. Users must conduct their own research before making investment decisions.
