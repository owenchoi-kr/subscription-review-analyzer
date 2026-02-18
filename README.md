<div align="center">

# Subscription Review Analyzer

**Diagnose why your subscription app users churn — powered by AI.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet)](https://claude.ai/claude-code)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

Feed it any app name. It fetches App Store & Play Store reviews,<br>
classifies churn signals, and generates a shareable interactive report.

[Get Started](#get-started) · [How It Works](#how-it-works) · [Use Cases](#use-cases) · [Report Sections](#whats-in-the-report)

</div>

---

## Who This Is For

You don't need to be a developer. If you can install two things and type one sentence, you can run this.

> **This tool is for you if:**
>
> - You're a **PM or marketer** at a subscription app and want to understand why users churn
> - You're running **Paid UA** and wondering if your ad spend is actually driving subscriptions
> - You want a **data-backed churn diagnosis** without hiring an analyst or building dashboards
> - You need a **shareable report** to align your team around the top 3 issues to fix

<br>

## Get Started

### Prerequisites (one-time, ~5 min)

<table>
<tr>
<td width="80" align="center"><strong>1</strong></td>
<td>
<strong>Node.js</strong> — the runtime that powers the scripts<br>
Download from <a href="https://nodejs.org">nodejs.org</a> (LTS version). Verify: <code>node -v</code>
</td>
</tr>
<tr>
<td width="80" align="center"><strong>2</strong></td>
<td>
<strong>Claude Code</strong> — the AI that runs the analysis<br>
Install from <a href="https://claude.ai/claude-code">claude.ai/claude-code</a>. Verify: type <code>claude</code> in terminal
</td>
</tr>
</table>

### Setup (one-time, ~1 min)

```bash
git clone https://github.com/owenchoi-kr/subscription-review-analyzer.git
cd subscription-review-analyzer
npm install
```

### Run

```bash
claude
```

Then just talk to it:

```
"Analyze Calm app reviews and tell me why users are churning."
```

That's it. Claude handles the rest — fetching reviews, classifying signals, building the report.

<br>

## How It Works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   App Name   │───▶│    Fetch     │───▶│  Classify    │───▶│  Root Cause  │───▶│    HTML      │
│              │    │   Reviews    │    │   Signals    │    │  Analysis    │    │   Report     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                    Last 6 months      8 categories        Top 3 issues       Interactive &
                    All ratings        Severity scoring    A/B test designs   shareable
```

**Step by step:**

1. **Scope** — Claude asks 4 quick multiple-choice questions
2. **Fetch** — Pulls reviews from App Store & Google Play (last 6 months, all ratings)
3. **Classify** — Every review scored across 8 churn signal categories
4. **Prioritize** — Ranked by weighted score (count x severity), top 3 only
5. **Analyze** — Root causes, compounding effects, and experiment designs
6. **Report** — Interactive HTML report in [The Pudding](https://pudding.cool) style
7. **Share** — Open locally or deploy as a URL

<br>

## Use Cases

| Role | What to ask | What you get |
|:-----|:------------|:-------------|
| **Growth PM** | *"Why is our trial-to-paid below 10%?"* | Top 3 conversion blockers + A/B test designs |
| **UA Marketer** | *"Are my paid users actually subscribing?"* | Channel-to-subscription funnel diagnosis |
| **Product Manager** | *"What should we fix first to reduce churn?"* | Prioritized issues by severity x frequency |
| **Founder** | *"Analyze our competitor's weak spots"* | Competitor churn report for positioning |

<br>

## 8 Churn Signal Categories

> The framework used to classify every review. Each category has a severity weight (1-5) that determines its priority in the final ranking.

| | Category | Severity | Signal Examples |
|:-:|:---------|:--------:|:----------------|
| `!!` | **Paywall Friction** | `5/5` | "paywall," "locked," "bait and switch" |
| `!!` | **Trial Dissatisfaction** | `5/5` | "trial too short," "expired" |
| `!!` | **Value Perception Gap** | `5/5` | "nothing special," "same as free" |
| `!!` | **Cancellation Difficulty** | `5/5` | "can't cancel," "still charging" |
| `!` | **Pricing Objection** | `4/5` | "too expensive," "not worth it" |
| `!` | **Technical Issues** | `4/5` | "crash," "bug," "lost my data" |
| | **Onboarding Confusion** | `3/5` | "confusing," "hard to start" |
| | **Feature Gap** | `3/5` | "missing," "competitor has" |

**Weighted score** = count x severity. This ensures high-severity issues with fewer mentions still surface above low-severity noise.

<br>

## What's in the Report

| Section | What it shows |
|:--------|:--------------|
| **Intro** | Total reviews analyzed, churn signal ratio — one big number |
| **Dot Grid** | Every review as a dot. Churn signals highlighted in red. Visual scale. |
| **Bar Chart** | 8 categories ranked by severity. Click any bar to expand review quotes. |
| **Deep Dive x3** | Top 3 issues — each with a *different* layout (block quotes / timeline / before-after) |
| **Experiments** | A/B test roadmap: hypothesis, metric, guardrail, duration, sample size |
| **Methodology** | Collapsible section explaining the analysis process |

<br>

## Sharing Your Report

<table>
<tr>
<td width="50%" valign="top">

**Option A: Send the file**

The report is a single `.html` file. No server, no dependencies.

- Drag into Slack
- Attach to email
- Upload to Notion

Anyone can open it in any browser.

</td>
<td width="50%" valign="top">

**Option B: Publish as a URL**

Claude can deploy it for you:

```bash
npx surge ./report --domain my-app-churn-report.surge.sh
```

First time: enter an email (free). After that, it's automatic.

Share `https://my-app-churn-report.surge.sh` on LinkedIn, email, anywhere.

</td>
</tr>
</table>

<br>

## Alternative: Slash Command

If you prefer explicit control over natural language:

```
/diagnosing-subscription-churn
```

This triggers the same skill with structured step-by-step prompts.

<br>

<details>
<summary><strong>Scripts Reference (for developers)</strong></summary>

### Search for an app
```bash
node scripts/fetch_reviews.js search "app name"
```

### Fetch reviews
```bash
node scripts/fetch_reviews.js fetch <playStoreId> --ios <iosId> --months 6
```

| Flag | Default | Description |
|:-----|:--------|:------------|
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
|:-----|:--------|:------------|
| `--output` | report.html | Output file path |
| `--lang` | en | Language (en / ko) |
| `--linkedin` | — | LinkedIn profile URL for footer |
| `--waitlist` | — | Show waitlist CTA |

</details>

<br>

---

<div align="center">

**MIT License**

Built by [Owen Choi](https://www.linkedin.com/in/owenchoi-kr/) with Claude Code

</div>
