# Subscription Review Analyzer

A Claude Code skill that diagnoses **why subscription app users churn** by analyzing App Store and Play Store reviews.

Feed it any subscription app name. It fetches reviews, classifies churn signals, and generates an interactive HTML report you can share.

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
