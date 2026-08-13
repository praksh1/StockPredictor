# Database and billing rules

## Core distinctions

- A **source document** is one publisher item, filing, or release.
- An **event** is the underlying occurrence represented by one or more source documents.
- An **analysis** is a versioned, structured AI assessment of one event for one security.
- An **alert** is the current user-visible assessment for one event/security pair.
- A **delivery** is a channel attempt for one userâ€™s alert.

These distinctions ensure that twenty reports about one occurrence become one event, while their original links remain available.

## Billing definition

A plan allowance counts one qualifying user-visible security alert. Email, push, and in-app delivery of that same alert count once total. Internal retries, source documents, duplicate articles, and failed deliveries never consume allowance. The immutable `usage_ledger` is the audit record for every chargeable unit.

## Access control

All user-owned tables use a `user_id` linked to the authenticated user. Row-level security policies are mandatory: customers can access only their own profile, preferences, watchlists, alerts, deliveries, and usage records. Administrative access is server-side and auditable.
