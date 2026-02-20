<div align="center">

# Subscription Review Analyzer

**Diagnose why your subscription app users churn — powered by AI.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet)](https://claude.ai/claude-code)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

Feed it any app name + a competitor. It fetches App Store & Play Store reviews,<br>
classifies churn signals across 11 analytical lenses, and generates a shareable interactive report.

[Get Started](#get-started) · [How It Works](#how-it-works) · [Use Cases](#use-cases) · [What's in the Report](#whats-in-the-report)

</div>

---

## Who This Is For

You don't need to be a developer. If you can install two things and type one sentence, you can run this.

> **This tool is for you if:**
>
> - You're a **PM or marketer** at a subscription app and want to understand why users churn
> - You're running **Paid UA** and wondering if your ad spend is actually driving subscriptions
> - You want to **compare your app vs a competitor** — see what they love about the competitor and where you can win
> - You need a **shareable report** to align your team around the top 3 issues to fix
> - You want **iOS vs Android** behavioral differences broken down separately

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
"Analyze Calm app vs Headspace — why are users churning?"
```

Claude will ask you for the competitor (if you didn't mention one), then handle the rest — fetching reviews for both apps, classifying signals, and building the report.

<br>

## How It Works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  App Name +  │───▶│    Fetch     │───▶│  Classify    │───▶│  Root Cause  │───▶│    HTML      │
│  Competitor  │    │   Reviews    │    │  11 Lenses   │    │  Analysis    │    │   Report     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                    Both apps,          8 churn categories   Top 3 issues       Interactive,
                    App Store &         + marketer lenses    Platform split     shareable
                    Play Store          + platform + rating  Competitor intel
```

**Step by step:**

1. **Scope** — Claude asks 4 quick questions: app name, goal, **competitor** (required), and focus area
2. **Fetch** — Pulls reviews for both apps from App Store & Google Play (last 6 months by default, falls back to all-time if insufficient)
3. **Classify** — Every review scored across 11 analytical lenses, split by iOS vs Android
4. **Prioritize** — Ranked by weighted score (count x severity), top 3 only
5. **Analyze** — Root causes, compounding effects, platform gaps, competitor buying points, and experiment designs
6. **Report** — Interactive HTML report in [The Pudding](https://pudding.cool) editorial style
7. **Share** — Open locally or deploy as a URL

<br>

## Always With a Competitor

Every analysis requires a competitor. This isn't optional — it's what makes the report actionable.

```
"Analyze Nightly sleep app vs Sleep Cycle — why are users churning?"
```

The report fetches reviews for **both** apps. Your app gets the full churn diagnosis. The competitor's reviews are mined for **buying points** — what their users love and hate — so you can spot positioning opportunities.

> **Why mandatory?** Without a competitor baseline, churn signals are just complaints. With one, they become positioning gaps you can exploit.

<br>

## Use Cases

| Role | What to ask | What you get |
|:-----|:------------|:-------------|
| **Growth PM** | *"Why is our trial-to-paid below 10%?"* | Top 3 conversion blockers + A/B test designs |
| **UA Marketer** | *"Are my paid users actually subscribing?"* | Channel-to-subscription funnel diagnosis |
| **Product Manager** | *"What should we fix first to reduce churn?"* | Prioritized issues by severity x frequency |
| **Founder** | *"Compare us vs our competitor"* | Side-by-side churn report for positioning |

<br>

## 11 Analytical Lenses

> Every review is scored across 11 lenses simultaneously. The first 8 classify churn signals; the rest extract growth, positioning, and platform intelligence.

### Churn Signal Categories (Lenses 1–8)

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

**Weighted score** = count x severity. High-severity issues with fewer mentions still surface above low-severity noise.

### Marketer & Positioning Lenses (Lens 9)

| Lens | What it finds |
|:-----|:-------------|
| **Creative Over-Promise Detection** | Reviews where ads/marketing don't match reality — "ad said," "not what I expected" |
| **Value Message Extraction** | What paying users say is worth it — from 4-5 star reviews |
| **Competitor Buying Points** | What competitor users love and hate — mined from the competitor's own reviews |
| **Subscription Conversion Triggers** | What made users upgrade — "decided to pay because," "worth the subscription" |

### Rating Extremes (Lens 10)

Analyzes 1–2★ vs 4–5★ reviews separately to find what **lovers and haters** have in common. Surfaces patterns invisible in aggregate — e.g., "even 5-star reviewers complain about the alarm UX."

### Platform Comparison (Lens 11)

Splits every churn category by **iOS vs Android**. Reveals platform-specific behavioral gaps — e.g., "Android users report 50% churn signals vs 6.5% on iOS." Each bar in the report shows 🍎/🤖 counts.

Plus: **Compounding Effect** analysis — how issues amplify each other (e.g., short trial + complex onboarding = users never reach the aha moment).

<br>

## What's in the Report

| Section | What it shows |
|:--------|:--------------|
| **Intro** | Total reviews analyzed, churn signal ratio — one big number with count-up animation |
| **Dot Grid** | Every review as a dot. Churn signals highlighted in red. Visual scale of the problem. |
| **Platform Comparison** | iOS vs Android side-by-side table — signal rates, top issues, and behavioral differences per platform |
| **Bar Chart** | 8 categories ranked by severity. Each bar shows 🍎/🤖 platform split. Click to expand quotes. |
| **Compounding Map** | How issues interact and amplify each other — the key differentiator |
| **Rating Extremes** | Lovers (4–5★) vs Haters (1–2★) — what each group has in common and the gap insight |
| **Competitor Buying Points** | What competitor users love, hate, and where you can win — mined from their reviews |
| **Deep Dive x3** | Top 3 issues — each with a *different* layout (block quotes / timeline / before-after) |
| **Monthly Trend** | Churn signal changes over time. See if problems are getting better or worse. |
| **Experiments** | A/B test roadmap: hypothesis, metric, guardrail, duration, sample size |
| **Limitations** | "What this report can't tell you" — honest about data gaps. Builds credibility. |
| **Methodology** | Collapsible section explaining the analysis process |

Reports are designed to look professional when screenshotted and shared. Single HTML file, no external dependencies, mobile-responsive, print-friendly.

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
| `--months` | 6 | Only reviews from last N months (falls back to all-time if < 10 reviews) |
| `--num` | 500 | Max reviews per platform |
| `--rating` | 5 | Max star rating (5 = all) |
| `--country` | us | Country code |
| `--platform` | both | `android`, `ios`, or `both` |

### Generate report
```bash
# Single app
node scripts/generate_report.js analysis.json --output report.html

# Competitor comparison
node scripts/generate_report.js app1.json --compare app2.json --output report.html
```

| Flag | Default | Description |
|:-----|:--------|:------------|
| `--output` | report.html | Output file path |
| `--lang` | en | Language (en / ko) |
| `--compare` | — | Second analysis JSON for competitor mode |
| `--linkedin` | — | LinkedIn profile URL for footer |
| `--waitlist` | — | Show early access CTA |

</details>

<br>

---

<div align="center">

**MIT License**

Built by [Owen Choi](https://www.linkedin.com/in/owenchoi-kr/) with Claude Code

</div>
