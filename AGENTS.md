# subscription-review-analyzer

## Purpose

A Claude Code skill that diagnoses subscription app churn by fetching and analyzing App Store and Play Store reviews. Given a target app and a competitor, the skill classifies reviews into 8 churn signal categories, runs 11 analytical lenses, and generates a single self-contained interactive HTML report with competitor benchmarking and marketer-actionable recommendations.

## Tech Stack

- **Runtime**: Node.js v18+ (primary), Python 3 (supplementary scripts)
- **Key dependencies**: `google-play-scraper`, `app-store-scraper`
- **Output**: Self-contained HTML report (no external dependencies)

## Architecture

```
User prompt
    → SKILL.md (7-step workflow orchestrated by Claude)
        → scripts/fetch_reviews.js  (Step 1: fetch reviews → reviews_*.json)
        → Claude classifies reviews  (Step 2–4: 11 lenses → analysis_*.json)
        → scripts/generate_report.js (Step 5: analysis JSON → report.html)
```

Data artifacts at root: `reviews_*.json` (raw), `analysis_*.json` (classified), `report_*.html` (final output).

## Key Files

| File | Role |
|---|---|
| `scripts/fetch_reviews.js` | Fetch reviews from Google Play and App Store |
| `scripts/generate_report.js` | Render analysis JSON into an HTML report |
| `analyze_churn.py` | Ad-hoc Python analysis with regex classification |
| `analyze_extra.py` | Deep-dive: competitor buying points, journey stage, fixability |
| `.claude/skills/diagnosing-subscription-churn/SKILL.md` | The Claude skill definition (7-step workflow) |
| `docs/GUIDE.md` | User-facing quickstart |

## Commands

```bash
npm install                                         # install scraper deps
node scripts/fetch_reviews.js search "app name"    # find app IDs
node scripts/fetch_reviews.js fetch <playId> --ios <iosId> --months 6
node scripts/generate_report.js analysis.json --output report.html
```

## Conventions

- Review data schema: `{ platform, score, title, text, date, thumbsUp }`
- Churn categories (8): Paywall Friction, Trial Dissatisfaction, Value Perception Gap, Cancellation Difficulty, Pricing Objection, Technical Issues, Onboarding Confusion, Feature Gap
- Analysis JSON schema defined in `.claude/skills/diagnosing-subscription-churn/references/analysis-schema.md`
- Minimum 30 reviews for valid analysis; script auto-expands to all-time if under threshold
- Report supports `--lang en|ko`, `--linkedin <url>`, `--waitlist` flags
