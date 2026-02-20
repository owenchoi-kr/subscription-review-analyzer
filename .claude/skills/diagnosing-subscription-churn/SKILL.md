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

**Q3. Who is the main competitor?** *(REQUIRED)*
- a) [User provides competitor name]
- b) I'm not sure — suggest one for me

Competitor analysis is **mandatory**, not optional. Every diagnosis includes a competitor comparison to surface buying points the competitor's users love but the target app lacks. If the user says "no competitor," push back: explain that competitor reviews are the richest source of unmet needs and buying triggers. If they truly can't name one, research and suggest the most relevant competitor yourself.

**Q4. Subscription model?**
- a) Free trial → Paid
- b) Freemium → Paid upgrade
- c) Paywalled (no free tier)
- d) Not sure / mixed

If the user provides both app names (e.g., "analyze Calm vs Headspace"), skip all questions and start fetching.

---

## Step 1: Fetch Reviews (Target App + Competitor)

Fetch reviews from the last 6 months for **both the target app and the competitor**. Competitor fetch is mandatory — it powers the buying point analysis in Step 2.

```bash
# Search for app IDs (run for both target and competitor)
node scripts/fetch_reviews.js search "target app name"
node scripts/fetch_reviews.js search "competitor app name"

# Fetch reviews — ALWAYS fetch both
node scripts/fetch_reviews.js fetch <target_playId> --ios <target_iosId> --months 6
node scripts/fetch_reviews.js fetch <competitor_playId> --ios <competitor_iosId> --months 6
```

Flags: `--months 6` (default), `--num 500`, `--rating 5` (all), `--platform android|ios|both`, `--country us`

Do NOT filter by rating. Fetch all 1-5 stars. Positive reviews contain valuable signals ("I love this BUT...").

**Fallback behavior:** If fewer than 30 reviews exist within the requested time window, the script automatically expands to all-time reviews and displays a clear warning. When this happens:
- The output JSON includes a `dateRange` object showing exactly how many reviews are recent vs older
- **Tell the user**: "Only X reviews were found in the last 6 months. I've included older reviews to have enough data for analysis, but keep in mind older reviews may reflect issues that have already been fixed."
- Weight recent reviews more heavily during classification — patterns from the last 6 months matter more than patterns from 2+ years ago

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

### Lens 8: Competitor Buying Points (from competitor reviews)
Analyze the **competitor's** reviews (fetched in Step 1) to extract buying points — reasons users chose and stayed with the competitor. This is NOT about what users of the target app say about competitors; it's direct analysis of competitor user love:
- **From competitor's 4-5★ reviews**: What do their happy users rave about? What made them pay?
- **From competitor's 1-2★ reviews**: What do their unhappy users wish was different? These are opportunities for the target app.
- **Buying point categories**: Price/value, unique features, UX quality, content quality, integrations, brand trust, community
- **Output**: Populate `competitorBuyingPoints` in `marketerLenses` with specific quotes and themes

### Lens 9: Subscription Conversion Triggers
From reviews mentioning upgrading, identify what triggered conversion. Patterns: "decided to pay," "upgraded because," "worth the subscription"

### Lens 10: Rating Extremes Analysis (1-2★ vs 4-5★ Commonalities)
App store reviews are inherently bimodal — users who love it or hate it. Analyze the commonalities within each extreme:

**Low ratings (1-2★) — What do haters have in common?**
- Common user profile (new user? long-time user? specific use case?)
- Shared pain points (top 3 themes with quotes)
- Journey stage when they left the review
- Platform skew (mostly iOS or Android?)

**High ratings (4-5★) — What do lovers have in common?**
- Common user profile (power user? specific demographic? use case?)
- Shared delight points (top 3 themes with quotes)
- Features most frequently praised
- What triggered them to leave a positive review (milestone? specific result?)

**The gap**: Identify the biggest disconnects between what lovers praise and what haters complain about. This reveals whether the product works great for a specific segment but fails for others — a targeting problem, not a product problem.

**Output**: Populate `ratingExtremes` in the analysis JSON.

### Lens 11: Platform Comparison (iOS vs Android)
Classify every review by platform and analyze behavioral differences:
- **Per category**: Count churn signals separately for iOS and Android (`platformSplit`)
- **Overall**: Compare churn signal rates, avg ratings, and top issues per platform
- **Behavioral patterns**: iOS and Android users often have different expectations, price sensitivity, and pain points. Note differences such as:
  - Billing/refund friction (Google Play vs App Store policies)
  - Payment sensitivity (Android users tend to be more price-sensitive)
  - Technical issues (platform-specific bugs, OS version fragmentation)
  - Feature expectations (e.g., Apple Watch integration only relevant to iOS)
- **Output**: Populate `platformBreakdown` at the top level and `platformSplit` in each category

---

## Step 3: Aggregate and Prioritize

For each churn signal category: **Count**, **Weighted score** (count × severity), **Average rating**, **Dominant journey stage** and **user type**, **Trend**, **Compounding pairs**, **Platform split** (iOS vs Android).

Sort by weighted score. Focus on **top 3 only.**

**Platform-level aggregation**: Also calculate overall stats per platform — total reviews, churn signal count, churn signal rate, avg rating, and identify the #1 issue per platform. Write a 1-2 sentence insight summarizing the key behavioral difference (e.g., "Android users complain about billing 3x more than iOS users, likely due to Google Play's more complex refund process").

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
