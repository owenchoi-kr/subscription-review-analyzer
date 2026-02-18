# Report Delivery & Deployment Guide

## Default: Open Locally

```bash
open <report-file>   # macOS
xdg-open <report-file>  # Linux
start <report-file>  # Windows
```

Tell the user the full path. It's a single HTML file, no server needed.

## Option 1: Share the HTML File Directly

Send via Slack, email, etc. Self-contained HTML with no dependencies. Opens in any browser.

## Option 2: Publish as a Shareable URL

```bash
# Install surge if needed (one-time, free)
npm list -g surge || npm install -g surge

# Prepare and deploy
mkdir -p /tmp/<app-name>-report
cp <report-file> /tmp/<app-name>-report/index.html
npx surge /tmp/<app-name>-report --domain <app-name>-churn-report.surge.sh
```

First-time only: surge will ask for email + password. That's the signup — no separate registration needed.

After deploy, provide the link: `https://<app-name>-churn-report.surge.sh`
