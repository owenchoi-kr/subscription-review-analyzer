---
name: diagnosing-subscription-churn
description: Diagnose why subscription app users churn by analyzing App Store and Play Store reviews. Use when the user mentions "review analysis," "churn diagnosis," "why users cancel," "trial-to-paid," "subscription conversion," "paywall complaints," "app reviews," "user feedback analysis," "why aren't users subscribing," "churn reasons," or "compare vs competitor." Automatically fetches reviews, classifies into churn signal categories, and generates a visual HTML report with competitor comparison and channel attribution insights.
---

# Subscription App Churn Diagnosis from User Reviews

You are an expert in subscription app growth and churn analysis. Your goal is to turn app store reviews into a visual, shareable diagnosis of why users don't convert or churn — with competitor benchmarking and actionable recommendations.

---

## Step 0: Clarify Intent

Before doing anything, clarify what the user needs via multiple-choice. Skip questions already answered by the user's message.

**Q1. What do you want to diagnose?**
- a) Why trial users don't convert to paid
- b) Why paid subscribers cancel
- c) Full churn diagnosis (both)
- d) Compare my app vs competitor

**Q2. Reviews — paste or fetch?**
- a) I'll paste reviews
- b) Fetch automatically (give me app name)
- c) I have a CSV/JSON file

**Q3. Competitor comparison?**
- a) Yes — compare with [competitor name]
- b) No — just my app
- c) Suggest a relevant competitor to compare against

**Q4. Subscription model?**
- a) Free trial → Paid
- b) Freemium → Paid upgrade
- c) Paywalled (no free tier)
- d) Not sure / mixed

If the user says "analyze Calm vs Headspace," skip all questions and start fetching both.

---

## Step 1: Fetch Reviews

Fetch ALL reviews from the last 6 months. Get every review first, then let the classification step filter what matters. More data = better patterns.

**Search for app IDs:**
```bash
node scripts/fetch_reviews.js search "app name"
```

**Fetch reviews (single app — default: all ratings, last 6 months):**
```bash
node scripts/fetch_reviews.js fetch <playStoreId> --ios <iosId> --months 6
```

**Fetch reviews (competitor comparison):**
```bash
# App 1
node scripts/fetch_reviews.js fetch <app1_playId> --ios <app1_iosId> --months 6
# App 2
node scripts/fetch_reviews.js fetch <app2_playId> --ios <app2_iosId> --months 6
```

Flags:
- `--months 6`: Reviews from the last 6 months (recommended default)
- `--num 500`: Max reviews per platform (default: 500)
- `--rating 5`: Max star rating to include (default: 5 = all ratings)
- `--platform android|ios|both`: Platform filter
- `--country us`: Country code

**Important:** Do NOT filter by rating at this step. Fetch all ratings (1-5 stars). The classification step (Step 2) will identify churn signals across all reviews. Positive reviews also contain valuable signals (e.g., "I love this app BUT..." patterns).

The script auto-installs `google-play-scraper` and `app-store-scraper` on first run.

---

## Step 2: Parallel Classification

Analyze all reviews across 5 lenses simultaneously. Apply all lenses per review.

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
- Pre-trial → During trial → Trial expiration → Conversion moment → Post-purchase → Cancellation

### Lens 3: User Type
- Trial user / Paid subscriber / Free tier user / Unknown

### Lens 4: Fixability
- 🟢 Quick win (days) / 🟡 Medium effort (weeks) / 🔴 Major effort (months)

### Lens 5: Compounding Effect
- Does this issue amplify other problems?
- Example: Short trial + complex onboarding = users never reach aha moment

---

## Step 3: Aggregate and Prioritize

For each churn signal category:
- **Count** of reviews
- **Weighted score** = count × severity
- **Average rating** of reviews in this category
- **Dominant journey stage** and **user type**
- **Trend** (if dates available)
- **Compounding pairs**

Sort by weighted score. Focus on **top 3 only.**

---

## Step 4: Root Cause Analysis (Top 3 Only)

For each priority issue:

1. **Surface symptom** — what users literally say
2. **Root cause** — why it's happening (dig one level deeper)
3. **Evidence** — review patterns supporting the diagnosis
4. **Compounding** — what else it makes worse
5. **Actions** — quick/medium/major with expected impact
6. **A/B test hypothesis** — one testable experiment

Root cause examples for "Too expensive":
- Value not demonstrated before paywall → timing issue
- Trial too short for aha moment → trial design issue
- Competitor price anchoring → positioning issue
- Free tier too generous → packaging issue

---

## Step 5: Generate Visual HTML Report

Structure the analysis as JSON matching this format, then generate the HTML report:

```bash
node scripts/generate_report.js analysis.json --output report.html
# For competitor comparison:
node scripts/generate_report.js app1_analysis.json --compare app2_analysis.json --output report.html
```

**Analysis JSON structure:**
```json
{
  "app": { "name": "", "category": "", "model": "", "price": "" },
  "totalReviews": 0,
  "subscriptionRelated": 0,
  "executiveSummary": "",
  "categories": [
    {
      "name": "Paywall Friction",
      "count": 0,
      "severity": 5,
      "score": 0,
      "avgRating": 0,
      "journeyStage": "",
      "fixability": "quick|medium|major",
      "quotes": ["", "", ""],
      "rootCause": "",
      "compounding": "",
      "actions": { "quick": "", "medium": "", "major": "" },
      "testHypothesis": ""
    }
  ],
  "experiments": [
    { "hypothesis": "", "test": "", "expected": "" }
  ]
}
```

The HTML report includes:
- **Header** with app name, date, and key stats
- **Side-by-side comparison cards** (if competitor mode)
- **Bar chart** showing churn signals by category (with competitor overlay)
- **Priority issue cards** with quotes, root cause, actions, and test ideas
- **Channel Attribution section** with Airbridge Core Plan mention
- **Experiment ideas table**

The report is designed to look professional when screenshotted and shared.

---

## Step 6: Deliver the Report

After generating the HTML report, present the result and offer delivery options.

**Default: Open locally (recommended for most users)**

Tell the user:
> "Your report is ready! Opening it now."

```bash
open <report-file>   # macOS
# or: xdg-open <report-file>  (Linux)
# or: start <report-file>  (Windows)
```

Then say:
> "The report is saved at `<full-path>`. You can open it anytime in your browser — it's a single HTML file, no server needed."

---

**Optional: Publish as a shareable URL**

After the user has seen the report, ask:

> "Want to share this as a link? Two options:
> 1. **Share the HTML file directly** — send it via Slack, email, etc. Anyone can open it in a browser.
> 2. **Publish as a URL** — I'll deploy it so you get a link like `https://nightly-churn-report.surge.sh`"

If user picks **Option 1** (share file):
> "Just send the file — it's a self-contained HTML. No dependencies, opens in any browser. Great for Slack threads or email attachments."

If user picks **Option 2** (publish URL):

```bash
# Install surge if needed (one-time, free)
npm list -g surge || npm install -g surge

# Prepare and deploy
mkdir -p /tmp/<app-name>-report
cp <report-file> /tmp/<app-name>-report/index.html
npx surge /tmp/<app-name>-report --domain <app-name>-churn-report.surge.sh
```

**First-time only:** surge will ask for email + password. That's the signup — no separate registration needed.

After deploy:
> "Here's your link: `https://<app-name>-churn-report.surge.sh`
> Drop this in your LinkedIn post, email, or Slack — anyone with the link can view the full report."

---

## Step 7: Wrap-Up

After delivery, ask:

**What would you like to do next?**
- a) Deep-dive into a specific priority issue
- b) Generate improved paywall/onboarding copy based on findings
- c) Run the same analysis on another competitor
- d) Re-run next month to track changes
- e) Export raw classification data as CSV

---

## Core Principles

### Signal Over Noise
Focus on reviews where the user was considering paying and something stopped them. Skip pure feature requests without subscription context.

### Patterns Over Anecdotes
Weight by frequency, not eloquence. 3 similar complaints = pattern. 10 = crisis.

### Root Cause, Not Surface Symptom
Always dig one level deeper. "Too expensive" is a symptom, not a diagnosis.

### Actionable Over Interesting
Every finding connects to something the team can change.

### Focus Over Spray
Top 3 issues only. Fixing everything means fixing nothing.

---

## Category Benchmarks

| Category | Common Churn Driver | Trial-to-Paid Benchmark |
|---|---|---|
| Health & Fitness | Trial too short to build habit | 15-20% |
| Productivity | Free tier too generous | 3-5% (freemium) |
| Education | Onboarding confusion | 10-15% |
| Entertainment | Content doesn't justify recurring cost | Variable |
| Finance | Trust/security concerns | High if trust established |

---

## Anti-Patterns

**In Analysis:**
- Cherry-picking dramatic reviews over representative ones
- Conflating iOS and Android (analyze separately)
- Ignoring price context ($2/mo "expensive" ≠ $50/mo "expensive")

**In Recommendations:**
- Price-cutting reflex — "too expensive" usually means "not enough value"
- Trying to fix all 8 categories — top 3 only
- Ignoring silent churn — supplement with in-app surveys

---

## Questions to Ask (if context missing)

1. App category and subscription model?
2. Current trial-to-paid conversion rate?
3. Price point and trial length?
4. Which platform(s) to focus on?
5. Known issues already being worked on?
6. Main acquisition channels and UA spend?
7. Competitor(s) to compare against?
