# AI safety and explainability requirements

## What the system may say

Use phrases such as â€œAI Market Assessment,â€ â€œpotential bullish pressure,â€ â€œpotential bearish pressure,â€ and â€œavailable information currently indicates.â€ Every alert must identify its sources and say that the assessment is informational, not advice.

## What it must not say

Never present a guarantee, trade instruction, fabricated fact, fabricated source, invented statistic, or unsupported probability. Prohibited examples include â€œbuy now,â€ â€œwill rise,â€ â€œguaranteed gain,â€ and â€œ78% chance the stock risesâ€ unless that probability has an approved, auditable statistical methodology.

## Required analysis record

The AI provider must return schema-validated JSON containing:

- source-backed facts, each linked to source-document IDs;
- clearly separate inferences and unknowns;
- source quality and event importance;
- a security-specific direction: bullish, neutral, or bearish;
- an independent impact severity: low, medium, high, or critical;
- confidence label: low, medium, or high;
- time horizons, primary drivers, counterarguments, and market context;
- model provider, model version, prompt version, and processing time.

## Validation gate

Before an assessment becomes user visible, code must reject it if it has an invalid classification, missing evidence, a factual claim lacking a source reference, a URL not drawn from a stored source, or a numerical performance/probability claim. Rejected assessments are retained for internal review but are never delivered.

## Evidence display

The alert detail page shows â€œFacts from sourcesâ€ separately from â€œAI interpretation.â€ It displays the primary source and any supporting sources. If sources disagree, the alert says so and lowers its confidence rather than hiding disagreement.
