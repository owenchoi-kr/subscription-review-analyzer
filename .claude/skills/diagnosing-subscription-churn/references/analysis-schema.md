# Analysis JSON Schema & Report Output

## Analysis JSON Structure

Structure the classification results as JSON matching this format before passing to the report generator:

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
      "hypothesis": "",
      "compounding": "",
      "marketerAction": "",
      "actions": { "quick": "", "medium": "", "major": "" },
      "testHypothesis": ""
    }
  ],
  "marketerLenses": {
    "overPromise": [{ "review": "", "expectationGap": "" }],
    "valueMessages": [""],
    "positioningGaps": [{ "competitor": "", "gap": "" }],
    "conversionTriggers": [""]
  },
  "monthlyTrend": [
    { "month": "2025-01", "signals": 0 }
  ],
  "experiments": [
    { "hypothesis": "", "test": "", "expected": "" }
  ]
}
```

## HTML Report Output

The generated report includes:

- **Header** with app name, date, and key stats
- **Side-by-side comparison cards** (if competitor mode)
- **Bar chart** showing churn signals by category (with competitor overlay)
- **Compounding interaction map** visualizing how issues amplify each other
- **Priority issue cards** with quotes, hypothesis, marketer actions, and test ideas
- **Monthly trend chart** showing churn signal changes over time
- **"What This Report Can't Tell You"** section — honest limitations that bridge to deeper analysis
- **Channel Attribution section** with Airbridge Core Plan CTA
- **Experiment ideas table**

The report is designed to look professional when screenshotted and shared. Single HTML file, no external dependencies.

## Hypothesis Examples

For "Too expensive" signal:
- Value not demonstrated before paywall → timing issue
- Trial too short for aha moment → trial design issue
- Competitor price anchoring → positioning issue
- Free tier too generous → packaging issue
