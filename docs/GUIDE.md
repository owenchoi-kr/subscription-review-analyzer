# Subscription Churn Diagnosis Skill — User Guide

> A Claude Code skill that analyzes App Store & Play Store reviews to diagnose subscription churn and generate a shareable interactive HTML report.

---

## Prerequisites

| Item | Description |
|------|-------------|
| **Claude Code** | Install from [claude.ai/claude-code](https://claude.ai/claude-code) |
| **Node.js** | v18 or higher (check with `node -v`) |
| **Target App** | Any subscription app listed on App Store or Play Store |

---

## Setup (1 min)

### 1. Clone the repo

```bash
git clone https://github.com/owenchoi-kr/subscription-review-analyzer.git
cd subscription-review-analyzer
```

### 2. Install dependencies

```bash
npm install
```

> This installs `google-play-scraper` and `app-store-scraper` automatically.

### 3. Skill registration

The skill file is already at `.claude/skills/diagnosing-subscription-churn/SKILL.md`.
Just open Claude Code inside the `subscription-review-analyzer` directory — it picks up the skill automatically.

---

## Usage

### Option 1: Slash command

```bash
cd subscription-review-analyzer
claude
```

Once Claude Code opens:

```
/diagnosing-subscription-churn
```

### Option 2: Natural language

Just ask Claude Code directly:

```
"Analyze Calm app reviews — why are users churning?"
```

```
"Compare Headspace vs Calm churn patterns."
```

```
"Why is Nightly's trial-to-paid conversion so low? Diagnose from reviews."
```

---

## How It Works

The skill runs through these steps automatically:

```
Step 0  4 quick questions to scope the analysis
   ↓
Step 1  Fetch reviews from App Store & Play Store (last 6 months, all ratings)
   ↓
Step 2  Classify reviews into 8 churn signal categories
   ↓
Step 3  Rank by weighted score (count × severity) → Top 3
   ↓
Step 4  Root cause analysis + experiment design for Top 3
   ↓
Step 5  Generate interactive HTML report
   ↓
Step 6  Open report & sharing options
   ↓
Step 7  Suggest next actions
```

---

## Sharing Your Report

### Option A: Share the HTML file (easiest)

Send the generated `.html` file via Slack, email, or Notion.
It's a single self-contained file — opens in any browser with zero dependencies.

### Option B: Publish as a URL (for LinkedIn posts)

Claude Code walks you through deploying with surge.sh:

```bash
npx surge ./report --domain my-app-churn-report.surge.sh
```

First time only: enter your email to create a free account. After that, deploys are automatic.
Share `https://my-app-churn-report.surge.sh` directly in your LinkedIn posts.

---

## Report Sections

| Section | Description |
|---------|-------------|
| **Intro** | Total reviews analyzed and churn signal ratio |
| **Dot Grid** | Every review visualized as a dot — churn signals in red |
| **Bar Chart** | 8 churn categories ranked by weighted score (click to expand quotes) |
| **Deep Dive ×3** | Top 3 issues, each with a unique layout |
| **Experiments** | A/B test roadmap with hypotheses, metrics, and guardrails |
| **CTA** | Airbridge Core Plan intro + early access offer |

---

## FAQ

### Q: What if there aren't enough reviews?

We recommend at least 30 reviews for meaningful patterns. For apps with fewer reviews, try `--months 12` to extend the time range or include a competitor for comparison.

### Q: Can I generate a Korean report?

Yes. Use the `--lang ko` flag when generating the report. You'll need Korean translations in your analysis JSON.

### Q: How does competitor comparison work?

Select "Compare vs competitor" in Step 0. The skill fetches and analyzes reviews from both apps side by side.

### Q: Can I edit the report after generation?

Yes. Modify your `analysis.json` file and regenerate:
```bash
node scripts/generate_report.js analysis.json --output report.html
```

---

## Contact

- **GitHub**: [github.com/owenchoi-kr/subscription-review-analyzer](https://github.com/owenchoi-kr/subscription-review-analyzer)
- **LinkedIn**: [linkedin.com/in/owenchoi-kr](https://www.linkedin.com/in/owenchoi-kr/)
