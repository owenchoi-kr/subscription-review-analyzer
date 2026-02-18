# Subscription Review Analyzer

A Claude Code skill that diagnoses **why subscription app users churn** by analyzing App Store and Play Store reviews.

Feed it any subscription app name. It fetches reviews, classifies churn signals, and generates an interactive HTML report you can share.

---

## Who This Is For

You don't need to be a developer. If you can install two things and type one sentence, you can run this.

**This tool is for you if:**
- You're a **PM or marketer** at a subscription app and want to understand why users churn
- You're running **Paid UA** and wondering if your ad spend is actually driving subscriptions
- You want a **data-backed churn diagnosis** without hiring an analyst or building dashboards
- You need a **shareable report** to align your team around the top 3 issues to fix

---

## How to Use It (Non-Developer Guide)

### Step 1: Install the prerequisites (one-time, ~5 min)

You need two things installed on your computer:

**a) Node.js** — the runtime that powers the scripts
- Go to [nodejs.org](https://nodejs.org) and download the LTS version
- Install it like any other app
- Verify: open Terminal (Mac) or Command Prompt (Windows) and type `node -v` — you should see a version number

**b) Claude Code** — the AI that runs the analysis
- Go to [claude.ai/claude-code](https://claude.ai/claude-code) and follow the install instructions
- Verify: type `claude` in your terminal — it should open

### Step 2: Download this project (one-time, ~1 min)

Open your terminal and paste these three lines:

```bash
git clone https://github.com/owenchoi-kr/subscription-review-analyzer.git
cd subscription-review-analyzer
npm install
```

That's it. You won't need to do this again.

### Step 3: Run the analysis (~5 min)

From inside the `subscription-review-analyzer` folder, type:

```bash
claude
```

Then just tell it what you want in plain English:

```
"Analyze Calm app reviews and tell me why users are churning."
```

```
"Diagnose Nightly's subscription churn from App Store reviews."
```

```
"Compare Headspace vs Calm — who has worse churn and why?"
```

Claude will ask you a few quick questions (multiple choice), then do everything automatically:
1. Find and fetch reviews from both App Store and Google Play
2. Read every review and classify churn signals
3. Identify the top 3 reasons users leave
4. Generate a visual HTML report

### Step 4: View and share your report

The report opens in your browser automatically. It's a single HTML file — no server, no login, no expiration.

**To share it:**
- **Slack / Email / Notion** → just attach the `.html` file
- **LinkedIn / public link** → Claude can deploy it as a URL for you (it'll ask)

---

## Example Use Cases

| Role | What to ask | What you get |
|------|------------|--------------|
| **Growth PM** | "Why is our trial-to-paid below 10%?" | Top 3 conversion blockers + A/B test designs |
| **UA Marketer** | "Are my paid users actually subscribing?" | Channel-to-subscription funnel diagnosis |
| **Product Manager** | "What should we fix first to reduce churn?" | Prioritized issues by severity x frequency |
| **Founder** | "Analyze our competitor's weak spots" | Competitor churn report you can use for positioning |

---

## What It Does

```
App name → Fetch reviews → Classify churn signals → Root cause analysis → HTML report
```

1. **Fetches** reviews from App Store & Google Play (last 6 months, all ratings)
2. **Classifies** each review across 8 churn signal categories with severity scoring
3. **Identifies** top 3 issues by weighted score (count x severity)
4. **Analyzes** root causes, compounding effects, and actionable fixes
5. **Generates** a shareable, interactive HTML report ([The Pudding](https://pudding.cool)-style)

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/owenchoi-kr/subscription-review-analyzer.git
cd subscription-review-analyzer
npm install
```

### 2. Open Claude Code in this directory

```bash
claude
```

### 3. Run the skill

**Slash command:**
```
/diagnosing-subscription-churn
```

**Or just ask naturally:**
```
"Analyze Calm app reviews — why are users churning?"
```

---

## Report Preview

The generated report includes:

| Section | Description |
|---------|-------------|
| **Dot Grid** | Every review as a dot. Churn signals highlighted in red. |
| **Bar Chart** | 8 churn categories ranked by severity. Click to expand review quotes. |
| **Deep Dive x3** | Top 3 issues, each with a unique layout (quotes, timeline, before/after). |
| **Experiments** | A/B test roadmap with hypotheses, metrics, and guardrails. |
| **Methodology** | Collapsible section explaining the analysis process. |

---

## 8 Churn Signal Categories

| Category | Severity | Examples |
|----------|----------|----------|
| Paywall Friction | 5/5 | "paywall," "locked," "bait and switch" |
| Trial Dissatisfaction | 5/5 | "trial too short," "expired" |
| Value Perception Gap | 5/5 | "nothing special," "same as free" |
| Cancellation Difficulty | 5/5 | "can't cancel," "still charging" |
| Pricing Objection | 4/5 | "too expensive," "not worth it" |
| Technical Issues | 4/5 | "crash," "bug," "lost my data" |
| Onboarding Confusion | 3/5 | "confusing," "hard to start" |
| Feature Gap | 3/5 | "missing," "competitor has" |

---

## Sharing Your Report

**Option A: Send the HTML file**
The report is a single self-contained `.html` file. Send it via Slack, email, or Notion — opens in any browser.

**Option B: Publish as a URL**
```bash
npx surge ./report --domain my-app-churn-report.surge.sh
```
First time only: enter an email to create a free account. Then share the link anywhere.

---

## Scripts Reference

### Search for an app
```bash
node scripts/fetch_reviews.js search "app name"
```

### Fetch reviews
```bash
node scripts/fetch_reviews.js fetch <playStoreId> --ios <iosId> --months 6
```

| Flag | Default | Description |
|------|---------|-------------|
| `--ios` | — | iOS App Store ID |
| `--months` | 0 (all) | Only reviews from last N months |
| `--num` | 500 | Max reviews per platform |
| `--rating` | 5 | Max star rating (5 = all) |
| `--country` | us | Country code |

### Generate report
```bash
node scripts/generate_report.js analysis.json --output report.html
```

| Flag | Default | Description |
|------|---------|-------------|
| `--output` | report.html | Output file path |
| `--lang` | en | Language (en / ko) |
| `--linkedin` | — | LinkedIn profile URL for footer |
| `--waitlist` | — | Show waitlist CTA |

---

## License

MIT

---

Built by [Owen Choi](https://www.linkedin.com/in/owenchoi-kr/) with Claude Code.
