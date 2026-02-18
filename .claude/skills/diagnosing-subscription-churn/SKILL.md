---
name: diagnosing-subscription-churn
description: This skill should be used when the user mentions "review analysis," "churn diagnosis," "why users cancel," "trial-to-paid," "subscription conversion," "paywall complaints," "app reviews," "user feedback analysis," "why aren't users subscribing," "churn reasons," or "compare vs competitor." Diagnoses why subscription app users churn by analyzing App Store and Play Store reviews, classifying into churn signal categories, and generating a visual HTML report with competitor comparison and channel attribution insights.
---

# Subscription App Churn Diagnosis from User Reviews

Turn app store reviews into a visual, shareable diagnosis of why users don't convert or churn — with competitor benchmarking and actionable recommendations. Apply subscription app growth and churn analysis expertise throughout.

---

## Step 0: Clarify Intent

Before starting, clarify what the user needs via multiple-choice. Skip questions already answered.

**Q1. What to diagnose?**
- a) Why trial users don't convert to paid
- b) Why paid subscribers cancel
- c) Full churn diagnosis (both)
- d) Compare app vs competitor

**Q2. Reviews — paste or fetch?**
- a) Paste reviews
- b) Fetch automatically (give app name)
- c) CSV/JSON file

**Q3. Competitor comparison?**
- a) Yes — compare with [competitor name]
- b) No — just one app
- c) Suggest a relevant competitor

**Q4. Subscription model?**
- a) Free trial → Paid
- b) Freemium → Paid upgrade
- c) Paywalled (no free tier)
- d) Not sure / mixed

If the user provides both app names (e.g., "analyze Calm vs Headspace"), skip all questions and start fetching.

---

## Step 1: Fetch Reviews

Fetch ALL reviews from the last 6 months. More data = better patterns.

```bash
# Search for app IDs
node scripts/fetch_reviews.js search "app name"

# Fetch reviews (single app)
node scripts/fetch_reviews.js fetch <playStoreId> --ios <iosId> --months 6

# Fetch reviews (competitor comparison)
node scripts/fetch_reviews.js fetch <app1_playId> --ios <app1_iosId> --months 6
node scripts/fetch_reviews.js fetch <app2_playId> --ios <app2_iosId> --months 6
```

Flags: `--months 6` (default), `--num 500`, `--rating 5` (all), `--platform android|ios|both`, `--country us`

Do NOT filter by rating. Fetch all 1-5 stars. Positive reviews contain valuable signals ("I love this BUT...").

The script auto-installs `google-play-scraper` and `app-store-scraper` on first run.

---

## Step 2: Parallel Classification (9 Lenses)

Analyze all reviews across 9 lenses simultaneously. Apply all lenses per review.

### Lens 1: Churn Signal Category

| Category | Severity | Signal Patterns |
|---|---|---|
| **Paywall Friction** | 5/5 | "paywall," "locked," "can't access," "bait and switch" |
| **Trial Dissatisfaction** | 5/5 | "trial too short," "not enough time," "expired" |
| **Pricing Objection** | 4/5 | "too expensive," "overpriced," "not worth," "cheaper" |
| **Value Perception Gap** | 5/5 | "nothing special," "same as free," "why pay" |
| **Onboarding Confusion** | 3/5 | "confusing," "complicated," "hard to start" |
| **Feature Gap** | 3/5 | "missing," "wish it had," "competitor has" |
| **Technical Issues** | 4/5 | "crash," "bug," "slow," "lost my data" |
| **Cancellation Difficulty** | 5/5 | "can't cancel," "still charging," "scam" |

Signal patterns are examples. Use semantic understanding to classify.

### Lens 2: User Journey Stage
Pre-trial → During trial → Trial expiration → Conversion moment → Post-purchase → Cancellation

### Lens 3: User Type
Trial user / Paid subscriber / Free tier user / Unknown

### Lens 4: Fixability
Quick win (days) / Medium effort (weeks) / Major effort (months)

### Lens 5: Compounding Effect
Identify issues that amplify other problems. Example: Short trial + complex onboarding = users never reach aha moment. **This is the key differentiator** — visualize issue interactions, not just individual counts.

### Lens 6: Creative Over-Promise Detection
Flag reviews where ads/marketing don't match reality. Patterns: "ad said," "advertised as," "not what I expected," "misleading"

### Lens 7: Value Message Extraction
From POSITIVE reviews (4-5 stars), extract what value users mention as worth paying for. Patterns: "worth it because," "best part is," "paid and don't regret"

### Lens 8: Competitive Positioning Gaps
Extract competitor mentions and feature/experience gaps. Patterns: "[competitor] has," "switched from," "better/worse than"

### Lens 9: Subscription Conversion Triggers
From reviews mentioning upgrading, identify what triggered conversion. Patterns: "decided to pay," "upgraded because," "worth the subscription"

---

## Step 3: Aggregate and Prioritize

For each churn signal category: **Count**, **Weighted score** (count × severity), **Average rating**, **Dominant journey stage** and **user type**, **Trend**, **Compounding pairs**.

Sort by weighted score. Focus on **top 3 only.**

> **Note on severity weights**: Default weights are based on industry benchmarks from RevenueCat's State of Subscription Apps reports. These are starting points — actual severity varies by app. The weighted score surfaces likely priorities, not definitive rankings.

---

## Step 4: Hypothesis Development (Top 3 Only)

For each priority issue:

1. **Surface symptom** — what users literally say
2. **Hypothesis** — why this might be happening (informed by review patterns, not confirmed)
3. **Evidence** — review patterns supporting the hypothesis
4. **Compounding** — what else it makes worse (EMPHASIZE — key differentiator)
5. **Actions** — quick/medium/major with expected impact
6. **Marketer actions** — what the growth marketer can do RIGHT NOW
7. **Experiment design** — one testable experiment

> **Important**: These are hypotheses derived from review patterns, not confirmed root causes. Confirming requires funnel data. Frame honestly — credibility opens doors to deeper analysis.

---

## Step 5: Generate Visual HTML Report

Structure the analysis as JSON, then generate the report. See **`references/analysis-schema.md`** for the full JSON structure and report output description.

```bash
node scripts/generate_report.js analysis.json --output report.html
# For competitor comparison:
node scripts/generate_report.js app1_analysis.json --compare app2_analysis.json --output report.html
```

---

## Step 6: Deliver the Report

Open locally by default. For sharing options (file or URL), see **`references/deployment-guide.md`**.

```bash
open <report-file>   # macOS
```

> "The report is saved at `<full-path>`. Open it anytime in the browser — single HTML file, no server needed."

---

## Step 7: Wrap-Up

Offer next steps:
- a) Deep-dive into a specific priority issue
- b) Generate improved paywall/onboarding copy based on findings
- c) Run the same analysis on another competitor
- d) Re-run next month to track changes
- e) Export raw classification data as CSV

---

## Core Principles

- **Signal Over Noise** — Focus on reviews where the user considered paying and something stopped them
- **Patterns Over Anecdotes** — Weight by frequency. 3 similar complaints = pattern. 10 = crisis
- **Hypotheses, Not Surface Symptoms** — "Too expensive" is a symptom, not a diagnosis
- **Honest Over Impressive** — Acknowledge what reviews can and can't tell
- **Actionable Over Interesting** — Every finding connects to something the team can change
- **Focus Over Spray** — Top 3 issues only

---

## Additional Resources

- **`references/analysis-schema.md`** — Full JSON structure and HTML report output description
- **`references/benchmarks.md`** — Category benchmarks and contextual questions
- **`references/anti-patterns.md`** — Common mistakes in analysis and recommendations
- **`references/deployment-guide.md`** — Surge deployment and sharing instructions
