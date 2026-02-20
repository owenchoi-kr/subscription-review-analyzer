#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const inputFile = args[0];

function getFlag(flag, defaultVal) {
  const idx = args.indexOf(flag);
  if (idx === -1) return defaultVal;
  return args[idx + 1];
}

function hasFlag(flag) {
  return args.includes(flag);
}

if (!inputFile) {
  console.log(`
Usage:
  node generate_report.js analysis.json [options]

Options:
  --output <file>      Output HTML filename (default: report.html)
  --lang <en|ko>       Language (default: en)
  --linkedin <url>     LinkedIn profile URL for footer CTA
  --waitlist            Enable waitlist box in CTA
`);
  process.exit(1);
}

const outputFile = getFlag('--output', 'report.html');
const lang = getFlag('--lang', 'en');
const linkedinUrl = getFlag('--linkedin', null);
const waitlistEnabled = hasFlag('--waitlist');

const analysis = JSON.parse(fs.readFileSync(path.resolve(inputFile), 'utf-8'));

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- Backwards compatibility: support both rootCause and hypothesis fields ---
function getCatHypothesis(cat) {
  return cat.hypothesis || cat.rootCause || '';
}

// --- Default marketer actions by category name ---
function getDefaultMarketerAction(catName) {
  const defaults = {
    'Paywall Friction': 'Adjust ad creative to set realistic expectations about free vs paid features',
    'Technical Issues': 'Pause campaigns targeting platforms with highest crash rates until fixed',
    'Value Perception Gap': 'Test new creative highlighting the specific value props users mention in positive reviews',
    'Cancellation Difficulty': 'Update landing pages to clearly explain cancellation process, reducing post-install distrust',
    'Feature Gap': 'Align ad messaging with actually available features to reduce expectation mismatch',
    'Pricing Objection': 'Test value-focused creative that frames price relative to outcomes, not features',
    'Trial Dissatisfaction': 'Set clear trial expectations in ad creative — duration, what happens after, how to cancel',
    'Onboarding Confusion': 'Ensure ad-to-app experience continuity — the first screen should match the ad promise',
  };
  // Fuzzy match: check if catName contains any key
  for (const [key, val] of Object.entries(defaults)) {
    if (catName.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
      return val;
    }
  }
  return 'Review acquisition channel performance for users who mention this issue in reviews';
}

// --- i18n ---
const i18n = {
  en: {
    introLine: (name, n) => `Your users left <span class="num" data-target="${n}">0</span> reviews of ${esc(name)}.`,
    signalLine: (rate, n) => `<span class="accent">${n}</span> of them contain churn signals — <span class="accent">${rate}%</span> of reviews where users said exactly why they're leaving.`,
    dotCaption: 'Each dot is one review. The red ones are churn signals.',
    patternLine: (n) => `They fall into <span class="accent">${n}</span> patterns.`,
    patternHint: 'Click a bar to read the actual reviews.',
    deepdiveIntro: "Here's what the top 3 reveal.",
    issueNum: (n) => `Issue #${n}`,
    mentions: 'mentions',
    severity: 'Severity',
    journeyStage: 'Journey Stage',
    hypothesis: 'Hypothesis',
    compounding: 'How it compounds',
    whatToDo: 'What to do about it',
    marketerActions: 'What you can do as a marketer',
    quickWin: 'Quick win',
    mediumTerm: 'Medium-term',
    longTerm: 'Long-term',
    testThis: 'Test this',
    experimentsTitle: 'Experiment Roadmap',
    experimentsIntro: 'Four experiments to validate the hypotheses above — ordered by priority.',
    expHypothesis: 'Hypothesis',
    expDesign: 'Test Design',
    expMetric: 'Primary Metric',
    expGuardrail: 'Guardrail',
    expDuration: 'Duration',
    expSample: 'Sample Size',
    expExpected: 'Expected Outcome',
    expPrereq: 'Prerequisite',
    severityNote: 'Severity weights are industry baselines from subscription app benchmarks. Actual severity varies by app.',
    limitationsTitle: 'What this report can\'t tell you',
    limitationsIntro: 'This analysis reads what your users wrote publicly. It surfaces patterns and generates hypotheses. But reviews don\'t contain:',
    limitationsItems: [
      { bold: 'Which channels bring users who churn most', detail: 'a user who churns from a Meta ad vs organic search may have completely different expectations' },
      { bold: 'Where in the funnel they actually drop off', detail: '"paywall friction" from a review doesn\'t tell you if it\'s day 1 or day 7' },
      { bold: 'Whether fixes are working', detail: 'you need before/after cohort data, not before/after reviews' },
    ],
    limitationsOutro: 'These hypotheses are starting points. Confirming them requires funnel data — trial-day retention curves, channel-by-cohort conversion rates, event-level behavior logs.',
    compoundingMapTitle: 'How these issues amplify each other',
    trendTitle: 'Churn Signal Trend',
    ctaTitle: 'Now you know why they leave. Next question: which ones are worth saving?',
    ctaLine1: 'A $3 Meta install who churns in week 1 is a different problem than an organic user who cancels after 6 months. The fix is different. The urgency is different. The ROI is different.',
    ctaLine2: 'But you can\'t tell them apart without connecting acquisition channels to subscription outcomes.',
    ctaLine3: 'That\'s the question Airbridge Core Plan answers — is your paid UA actually driving subscriptions?',
    ctaLink: 'See how teams answer this',
    waitlistTitle: 'Early access',
    waitlistLine1: 'Core Plan is launching soon. Join the waitlist to start with <strong>90,000 Attributed Installs free</strong> over your first 3 months.',
    waitlistLine2: 'The standard free tier covers 15,000 installs per year. This is <strong>6x that</strong>, concentrated into your first 90 days.',
    waitlistLine3: 'Available to early access signups only.',
    waitlistBtn: 'Join the waitlist',
    linkedinLine: 'Want to discuss this analysis further?',
    linkedinCta: "Let's connect on LinkedIn",
    platformTitle: 'iOS vs Android',
    platformSubtitle: 'User behavior differs by platform. Here\'s how.',
    platformReviews: 'Reviews',
    platformSignals: 'Churn signals',
    platformSignalRate: 'Signal rate',
    platformAvgRating: 'Avg rating',
    platformTopIssue: 'Top issue',
    methodologyTitle: 'How we analyzed the data',
    footer: 'Generated by Subscription Churn Diagnosis Skill · Powered by Claude Code',
    dd1Punch: (name) => `When the core feature fails, the app's reason to exist disappears.`,
    dd2Title: 'The user journey breaks here',
    dd2Steps: ['See ad', 'Download', 'Sign up', 'Paywall', '???'],
    dd3Expect: 'What users expected',
    dd3Got: 'What users experienced',
  },
  ko: {
    introLine: (name, n) => `${esc(name)}에 사용자들이 <span class="num" data-target="${n}">0</span>개의 리뷰를 남겼습니다.`,
    signalLine: (rate, n) => `그 중 <span class="accent">${n}</span>건에 이탈 신호가 있습니다 — 전체의 <span class="accent">${rate}%</span>.`,
    dotCaption: '각 점은 리뷰 1건입니다. 빨간 점이 이탈 신호입니다.',
    patternLine: (n) => `이탈 신호를 분류하면 <span class="accent">${n}</span>가지 패턴입니다.`,
    patternHint: '바를 클릭하면 실제 리뷰를 볼 수 있습니다.',
    deepdiveIntro: '상위 3개 이슈가 드러내는 것.',
    issueNum: (n) => `이슈 #${n}`,
    mentions: '건',
    severity: '심각도',
    journeyStage: '여정 단계',
    hypothesis: '가설',
    compounding: '어떻게 악화되는가',
    whatToDo: '무엇을 해야 하는가',
    marketerActions: '마케터로서 할 수 있는 것',
    quickWin: '빠른 개선',
    mediumTerm: '중기 과제',
    longTerm: '장기 과제',
    testThis: '이 가설을 테스트하세요',
    experimentsTitle: '실험 로드맵',
    experimentsIntro: '위 가설들을 검증하기 위한 실험입니다 — 우선순위 순으로 정렬.',
    expHypothesis: '가설',
    expDesign: '실험 설계',
    expMetric: '핵심 지표',
    expGuardrail: '가드레일',
    expDuration: '기간',
    expSample: '표본 크기',
    expExpected: '기대 결과',
    expPrereq: '선행 조건',
    severityNote: '심각도 가중치는 구독 앱 벤치마크 기준입니다. 실제 심각도는 앱마다 다릅니다.',
    limitationsTitle: '이 리포트가 알려주지 못하는 것',
    limitationsIntro: '이 분석은 사용자들이 공개적으로 쓴 내용을 읽습니다. 패턴을 발견하고 가설을 만듭니다. 하지만 리뷰에는 다음이 없습니다:',
    limitationsItems: [
      { bold: '어떤 채널의 사용자가 가장 많이 이탈하는지', detail: 'Meta 광고에서 온 사용자와 자연 검색에서 온 사용자의 기대치는 완전히 다를 수 있습니다' },
      { bold: '퍼널 어디서 실제로 이탈하는지', detail: '리뷰의 "페이월 마찰"이 1일차인지 7일차인지 알 수 없습니다' },
      { bold: '수정이 효과가 있는지', detail: '전후 리뷰가 아닌 전후 코호트 데이터가 필요합니다' },
    ],
    limitationsOutro: '이 가설들은 시작점입니다. 확인하려면 퍼널 데이터가 필요합니다 — 트라이얼일 리텐션 곡선, 채널별 코호트 전환율, 이벤트 수준 행동 로그.',
    compoundingMapTitle: '이슈들이 서로 어떻게 증폭하는가',
    trendTitle: '이탈 신호 추이',
    ctaTitle: '이제 왜 떠나는지 알았습니다. 다음 질문: 어떤 유저를 살릴 가치가 있는가?',
    ctaLine1: '1주차에 이탈하는 $3 Meta 유저와 6개월 후 해지하는 오가닉 유저는 완전히 다른 문제입니다. 해법도, 긴급성도, ROI도 다릅니다.',
    ctaLine2: '하지만 유입 채널과 구독 결과를 연결하지 않으면 이 둘을 구분할 수 없습니다.',
    ctaLine3: '내 Paid UA가 실제로 구독을 만들고 있는가 — Airbridge Core Plan이 답하는 질문입니다.',
    ctaLink: '다른 팀들은 어떻게 답하고 있는지 보기',
    waitlistTitle: '얼리 액세스',
    waitlistLine1: 'Core Plan이 곧 런칭됩니다. 웨이팅리스트에 등록하면 첫 3개월간 <strong>90,000 Attributed Installs를 무료</strong>로 제공합니다.',
    waitlistLine2: '일반 무료 티어는 연간 15,000건입니다. 이건 그 <strong>6배</strong>를 첫 90일에 집중 제공합니다.',
    waitlistLine3: '얼리 액세스 등록자에게만 제공됩니다.',
    waitlistBtn: '웨이팅리스트 등록하기',
    linkedinLine: '이 분석에 대해 더 이야기하고 싶으신가요?',
    linkedinCta: 'LinkedIn에서 대화해요',
    platformTitle: 'iOS vs Android',
    platformSubtitle: '플랫폼별로 사용자 행동이 다릅니다. 차이점은 다음과 같습니다.',
    platformReviews: '리뷰',
    platformSignals: '이탈 신호',
    platformSignalRate: '이탈 비율',
    platformAvgRating: '평균 평점',
    platformTopIssue: '주요 이슈',
    methodologyTitle: '분석 방법론',
    footer: 'Subscription Churn Diagnosis Skill로 생성 · Powered by Claude Code',
    dd1Punch: (name) => `핵심 기능이 작동하지 않으면, 앱의 존재 이유가 사라집니다.`,
    dd2Title: '사용자 여정이 여기서 끊깁니다',
    dd2Steps: ['광고 클릭', '다운로드', '이메일 입력', '페이월', '???'],
    dd3Expect: '사용자가 기대한 것',
    dd3Got: '사용자가 경험한 것',
  }
};
const t = i18n[lang] || i18n.en;

// --- Data Processing ---
const sorted = [...analysis.categories].sort((a, b) => b.score - a.score);
const top3 = sorted.slice(0, 3);
const maxScore = Math.max(...sorted.map(c => c.score));
const signalRate = analysis.totalReviews > 0 ? Math.round(analysis.subscriptionRelated / analysis.totalReviews * 100) : 0;
const barW = (score) => Math.max(8, Math.round((score / maxScore) * 100));

// Highlight churn-related keywords in quotes
function highlightQuote(text) {
  let h = esc(text);
  const patterns = [
    /\b(error|errors|crash|crashes|buggy|broken|doesn&#39;t work|never goes on|never|fail|failed|sketchy)\b/gi,
    /\b(pay|charged?|trial|subscribe|force|forced|commit|money|scam)\b/gi,
    /\b(not as good|doesn&#39;t help|no option|expected|can&#39;t|won&#39;t)\b/gi,
  ];
  patterns.forEach(p => { h = h.replace(p, '<mark>$&</mark>'); });
  return h;
}

// Deterministic dot positions for signal dots
function dotGrid() {
  const total = analysis.totalReviews;
  const signals = analysis.subscriptionRelated;
  if (total === 0) return '';
  const positions = new Set();
  for (let i = 0; i < signals; i++) {
    positions.add(Math.round((i + 0.5) * total / signals));
  }
  const dots = [];
  for (let i = 0; i < total; i++) {
    dots.push(`<span class="dot${positions.has(i) ? ' signal' : ''}"></span>`);
  }
  return dots.join('');
}

// --- Methodology (collapsible) ---
function methodologyHTML() {
  const m = analysis.methodology;
  if (!m) {
    // Generate default methodology
    return `
    <details class="methodology">
      <summary>${t.methodologyTitle}</summary>
      <div class="methodology-body">
        <ol>
          <li>Scraped reviews from App Store (iOS) and Google Play Store (US market).</li>
          <li>Collected ${analysis.totalReviews} reviews across both platforms.</li>
          <li>Classified each review into 8 predefined churn signal categories.</li>
          <li>Assigned severity scores (1-5) to each category.</li>
          <li>Calculated weighted score = mentions x severity.</li>
          <li>Performed hypothesis analysis on the top 3 categories by score.</li>
        </ol>
      </div>
    </details>`;
  }

  // Support both old format (array of strings) and new format (array of objects)
  const stepsHtml = Array.isArray(m.steps)
    ? m.steps.map(s => {
        if (typeof s === 'string') return `<li>${esc(s)}</li>`;
        return `<li><strong>${esc(s.label)}</strong> — ${esc(s.detail)}</li>`;
      }).join('\n        ')
    : '';

  return `
  <details class="methodology">
    <summary>${esc(m.title || t.methodologyTitle)}</summary>
    <div class="methodology-body">
      ${m.description ? `<p>${esc(m.description)}</p>` : ''}
      <ol>
        ${stepsHtml}
      </ol>
    </div>
  </details>`;
}

// --- Platform Comparison Section ---
function platformComparisonHTML() {
  const pb = analysis.platformBreakdown;
  if (!pb || (!pb.ios && !pb.android)) return '';

  const ios = pb.ios || {};
  const android = pb.android || {};

  const iosSignalRate = ios.totalReviews > 0 ? Math.round(ios.subscriptionRelated / ios.totalReviews * 100) : 0;
  const androidSignalRate = android.totalReviews > 0 ? Math.round(android.subscriptionRelated / android.totalReviews * 100) : 0;

  function statRow(label, iosVal, androidVal, highlight) {
    const iosHighlight = highlight === 'ios' ? ' class="highlight"' : '';
    const androidHighlight = highlight === 'android' ? ' class="highlight"' : '';
    return `
      <tr>
        <td class="plat-label">${label}</td>
        <td${iosHighlight}>${iosVal}</td>
        <td${androidHighlight}>${androidVal}</td>
      </tr>`;
  }

  // Determine which platform has higher signal rate for highlighting
  const rateHighlight = iosSignalRate > androidSignalRate ? 'ios' : androidSignalRate > iosSignalRate ? 'android' : null;

  return `
  <section class="section platform-section">
    <h2 class="section-title">${t.platformTitle}</h2>
    <p class="section-intro">${t.platformSubtitle}</p>
    <table class="plat-table">
      <thead>
        <tr>
          <th></th>
          <th><span class="plat-icon">🍎</span> iOS</th>
          <th><span class="plat-icon">🤖</span> Android</th>
        </tr>
      </thead>
      <tbody>
        ${statRow(t.platformReviews, ios.totalReviews || 0, android.totalReviews || 0)}
        ${statRow(t.platformSignals, ios.subscriptionRelated || 0, android.subscriptionRelated || 0)}
        ${statRow(t.platformSignalRate, iosSignalRate + '%', androidSignalRate + '%', rateHighlight)}
        ${statRow(t.platformAvgRating, (ios.avgRating || 0).toFixed(1) + ' ★', (android.avgRating || 0).toFixed(1) + ' ★')}
        ${statRow(t.platformTopIssue, esc(ios.topIssue || '—'), esc(android.topIssue || '—'))}
      </tbody>
    </table>
    ${pb.insight ? `<p class="plat-insight">${esc(pb.insight)}</p>` : ''}
  </section>`;
}

// --- Bar Chart ---
function barChart() {
  return sorted.map((cat, i) => {
    const isTop3 = i < 3;
    const quotesHtml = (cat.quotes || []).map(q =>
      `<div class="bar-quote">"${highlightQuote(q)}"</div>`
    ).join('');
    // Platform split indicator
    const ps = cat.platformSplit;
    const platformTag = ps && (ps.ios > 0 || ps.android > 0)
      ? `<span class="bar-platform-split">🍎${ps.ios || 0} · 🤖${ps.android || 0}</span>`
      : '';
    return `
    <div class="bar-row${isTop3 ? ' top3' : ''}" onclick="toggleQuotes(this)">
      <div class="bar-label-row">
        <span class="bar-name">${esc(cat.name)}</span>
        <span class="bar-meta">${cat.count} ${t.mentions} · ${t.severity} ${cat.severity}/5 ${platformTag}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${barW(cat.score)}%"><span class="bar-score">${cat.score}</span></div>
      </div>
    </div>
    <div class="bar-quotes-panel" style="display:none">${quotesHtml}</div>`;
  }).join('');
}

// --- Marketer Actions Block ---
function marketerActionsBlock(cat) {
  const actions = cat.marketerActions || [getDefaultMarketerAction(cat.name)];
  const actionsList = Array.isArray(actions) ? actions : [actions];
  return `
    <div class="dd-marketer-actions">
      <h3>${t.marketerActions}</h3>
      ${actionsList.map(a => `
      <div class="marketer-action-row">
        <span class="marketer-action-text">${esc(a)}</span>
      </div>`).join('')}
    </div>`;
}

// --- Deep Dive #1: Big Quotes Layout ---
function deepDive1(cat, idx) {
  const hypothesisText = getCatHypothesis(cat);
  return `
  <section class="section deepdive">
    <div class="dd-label">${t.issueNum(idx + 1)}</div>
    <h2 class="dd-title">${esc(cat.name)}</h2>
    <div class="dd-meta">${cat.count} ${t.mentions} · ${t.severity} ${cat.severity}/5 · ${t.journeyStage}: ${esc(cat.journeyStage)}</div>

    <div class="dd1-quotes">
      ${(cat.quotes || []).map(q => `
      <blockquote class="big-quote">"${highlightQuote(q)}"</blockquote>`).join('')}
    </div>

    <p class="dd-punchline">${t.dd1Punch(cat.name)}</p>

    <div class="dd-analysis">
      <h3>${t.hypothesis}</h3>
      <p>${esc(hypothesisText)}</p>
    </div>
    <div class="dd-analysis">
      <h3>${t.compounding}</h3>
      <p>${esc(cat.compounding)}</p>
    </div>

    ${actionsBlock(cat)}
    ${marketerActionsBlock(cat)}
  </section>`;
}

// --- Deep Dive #2: Journey Timeline Layout ---
function deepDive2(cat, idx) {
  const steps = t.dd2Steps;
  const hypothesisText = getCatHypothesis(cat);
  return `
  <section class="section deepdive">
    <div class="dd-label">${t.issueNum(idx + 1)}</div>
    <h2 class="dd-title">${esc(cat.name)}</h2>
    <div class="dd-meta">${cat.count} ${t.mentions} · ${t.severity} ${cat.severity}/5 · ${t.journeyStage}: ${esc(cat.journeyStage)}</div>

    <p class="dd-subtitle">${t.dd2Title}</p>
    <div class="journey">
      ${steps.map((s, i) => {
        const isBreak = i === steps.length - 2;
        const isFaded = i === steps.length - 1;
        return `<div class="journey-step${isBreak ? ' break' : ''}${isFaded ? ' faded' : ''}">
          <div class="journey-dot"></div>
          <span>${esc(s)}</span>
        </div>${i < steps.length - 1 ? '<div class="journey-line' + (isFaded ? ' faded' : '') + '"></div>' : ''}`;
      }).join('')}
    </div>

    <div class="dd2-quotes">
      ${(cat.quotes || []).map(q => `
      <div class="speech-bubble">"${highlightQuote(q)}"</div>`).join('')}
    </div>

    <div class="dd-analysis">
      <h3>${t.hypothesis}</h3>
      <p>${esc(hypothesisText)}</p>
    </div>
    <div class="dd-analysis">
      <h3>${t.compounding}</h3>
      <p>${esc(cat.compounding)}</p>
    </div>

    ${actionsBlock(cat)}
    ${marketerActionsBlock(cat)}
  </section>`;
}

// --- Deep Dive #3: Before/After Layout ---
function deepDive3(cat, idx) {
  const hypothesisText = getCatHypothesis(cat);
  return `
  <section class="section deepdive">
    <div class="dd-label">${t.issueNum(idx + 1)}</div>
    <h2 class="dd-title">${esc(cat.name)}</h2>
    <div class="dd-meta">${cat.count} ${t.mentions} · ${t.severity} ${cat.severity}/5 · ${t.journeyStage}: ${esc(cat.journeyStage)}</div>

    <div class="comparison">
      <div class="comp-col expect">
        <h4>${t.dd3Expect}</h4>
        <p>${esc(hypothesisText.split('\u2014')[0].split('\u2013')[0].trim())}</p>
      </div>
      <div class="comp-divider"></div>
      <div class="comp-col got">
        <h4>${t.dd3Got}</h4>
        ${(cat.quotes || []).map(q => `
        <blockquote>"${highlightQuote(q)}"</blockquote>`).join('')}
      </div>
    </div>

    <div class="dd-analysis">
      <h3>${t.hypothesis}</h3>
      <p>${esc(hypothesisText)}</p>
    </div>
    <div class="dd-analysis">
      <h3>${t.compounding}</h3>
      <p>${esc(cat.compounding)}</p>
    </div>

    ${actionsBlock(cat)}
    ${marketerActionsBlock(cat)}
  </section>`;
}

// --- Actions Block (shared) ---
function actionsBlock(cat) {
  if (!cat.actions) return '';
  const levels = [
    { key: 'quick', label: t.quickWin },
    { key: 'medium', label: t.mediumTerm },
    { key: 'major', label: t.longTerm },
  ];
  return `
    <div class="dd-actions">
      <h3>${t.whatToDo}</h3>
      ${levels.filter(l => cat.actions[l.key]).map(l => `
      <div class="action-row">
        <span class="action-level">${l.label}</span>
        <span class="action-text">${esc(cat.actions[l.key])}</span>
      </div>`).join('')}
    </div>
    ${cat.testHypothesis ? `
    <div class="dd-test">
      <strong>${t.testThis}:</strong> ${esc(cat.testHypothesis)}
    </div>` : ''}`;
}

// --- Compounding Map ---
function compoundingMapHTML() {
  if (top3.length < 2) return '';

  // Extract compounding relationships from each top-3 category
  const connections = [];
  top3.forEach((cat, i) => {
    if (!cat.compounding) return;
    const text = cat.compounding;
    // Try to find references to other top-3 categories
    top3.forEach((other, j) => {
      if (i === j) return;
      if (text.toLowerCase().includes(other.name.toLowerCase()) ||
          text.toLowerCase().includes(other.name.toLowerCase().split(' ')[0])) {
        // Extract a short description from the compounding text
        const sentences = text.split(/\.\s+/);
        const relevantSentence = sentences.find(s =>
          s.toLowerCase().includes(other.name.toLowerCase()) ||
          s.toLowerCase().includes(other.name.toLowerCase().split(' ')[0])
        );
        let label = relevantSentence
          ? relevantSentence.replace(/^[^a-zA-Z]*/, '').trim()
          : text.split('.')[0].trim();
        // Truncate to reasonable length
        if (label.length > 80) label = label.substring(0, 77) + '...';
        connections.push({ from: i, to: j, label });
      }
    });
  });

  // If no connections detected, generate generic ones from compounding text
  if (connections.length === 0 && top3.length >= 2) {
    top3.forEach((cat, i) => {
      if (!cat.compounding) return;
      const nextIdx = (i + 1) % top3.length;
      let label = cat.compounding.split('.')[0].trim();
      if (label.length > 80) label = label.substring(0, 77) + '...';
      connections.push({ from: i, to: nextIdx, label });
    });
  }

  if (connections.length === 0) return '';

  const nodeColors = ['var(--accent)', '#D97706', '#7C3AED'];

  return `
  <section class="section compounding-map">
    <h2 class="section-title">${t.compoundingMapTitle}</h2>
    <div class="compound-viz">
      <div class="compound-nodes">
        ${top3.map((cat, i) => `
        <div class="compound-node" style="--node-color: ${nodeColors[i]}">
          <div class="compound-node-dot" style="background: ${nodeColors[i]}"></div>
          <span class="compound-node-name">${esc(cat.name)}</span>
        </div>`).join('')}
      </div>
      <div class="compound-edges">
        ${connections.map(c => `
        <div class="compound-edge">
          <span class="compound-edge-from" style="color: ${nodeColors[c.from]}">${esc(top3[c.from].name)}</span>
          <span class="compound-arrow">&rarr;</span>
          <span class="compound-edge-to" style="color: ${nodeColors[c.to]}">${esc(top3[c.to].name)}</span>
          <p class="compound-edge-label">${esc(c.label)}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
}

// --- Rating Extremes Section ---
function ratingExtremesHTML() {
  const re = analysis.ratingExtremes;
  if (!re) return '';

  const low = re.low || {};
  const high = re.high || {};

  function themeList(themes) {
    if (!themes || !Array.isArray(themes) || themes.length === 0) return '';
    return themes.map(t => `
      <div class="re-theme">
        <div class="re-theme-header">
          <span class="re-theme-name">${esc(t.theme)}</span>
          ${t.count ? `<span class="re-theme-count">${t.count}x</span>` : ''}
        </div>
        ${t.quote ? `<div class="re-theme-quote">"${highlightQuote(t.quote)}"</div>` : ''}
      </div>`).join('');
  }

  return `
  <section class="section rating-extremes">
    <h2 class="section-title">${lang === 'ko' ? '평점 양극단 분석' : 'Rating Extremes: Lovers vs Haters'}</h2>
    <p class="section-intro">${lang === 'ko' ? '앱스토어 리뷰는 본질적으로 양극단입니다. 각 극단의 공통점을 분석합니다.' : 'App store reviews are inherently bimodal. Here\'s what each extreme has in common.'}</p>
    <div class="re-grid">
      <div class="re-col re-haters">
        <div class="re-col-header">
          <span class="re-col-title">${lang === 'ko' ? '1-2점 리뷰' : '1-2\u2605 Reviews'}</span>
          <span class="re-col-count">${low.count || 0}${lang === 'ko' ? '건' : ''}</span>
        </div>
        ${low.commonProfile ? `<p class="re-profile"><strong>${lang === 'ko' ? '공통 프로필' : 'Common profile'}:</strong> ${esc(low.commonProfile)}</p>` : ''}
        ${low.platformSkew && low.platformSkew !== 'balanced' ? `<p class="re-skew">${lang === 'ko' ? '플랫폼 편중' : 'Platform skew'}: ${low.platformSkew === 'ios' ? '🍎 iOS' : '🤖 Android'}</p>` : ''}
        <div class="re-themes">${themeList(low.themes)}</div>
      </div>
      <div class="re-divider"></div>
      <div class="re-col re-lovers">
        <div class="re-col-header">
          <span class="re-col-title">${lang === 'ko' ? '4-5점 리뷰' : '4-5\u2605 Reviews'}</span>
          <span class="re-col-count">${high.count || 0}${lang === 'ko' ? '건' : ''}</span>
        </div>
        ${high.commonProfile ? `<p class="re-profile"><strong>${lang === 'ko' ? '공통 프로필' : 'Common profile'}:</strong> ${esc(high.commonProfile)}</p>` : ''}
        ${high.topFeatures && high.topFeatures.length > 0 ? `<p class="re-features"><strong>${lang === 'ko' ? '가장 많이 칭찬한 기능' : 'Most praised features'}:</strong> ${high.topFeatures.map(f => esc(f)).join(', ')}</p>` : ''}
        <div class="re-themes">${themeList(high.themes)}</div>
      </div>
    </div>
    ${re.gapInsight ? `<div class="re-gap-insight"><strong>${lang === 'ko' ? '핵심 괴리' : 'The Gap'}:</strong> ${esc(re.gapInsight)}</div>` : ''}
  </section>`;
}

// --- Competitor Buying Points Section ---
function competitorBuyingPointsHTML() {
  const cbp = analysis.marketerLenses?.competitorBuyingPoints;
  if (!cbp || !cbp.competitorName) return '';

  function quoteCards(items, colorClass) {
    if (!items || items.length === 0) return '';
    return items.map(item => `
      <div class="cbp-card ${colorClass}">
        <div class="cbp-theme">${esc(item.theme)}</div>
        ${item.quote ? `<div class="cbp-quote">"${highlightQuote(item.quote)}"</div>` : ''}
      </div>`).join('');
  }

  return `
  <section class="section competitor-buying-points">
    <h2 class="section-title">${lang === 'ko' ? `${esc(cbp.competitorName)} 유저들의 Buying Points` : `What ${esc(cbp.competitorName)} Users Love (and Hate)`}</h2>
    <p class="section-intro">${lang === 'ko' ? '경쟁사 리뷰에서 발견한 구매 동기와 불만 — 당신의 기회입니다.' : 'Buying triggers and pain points from competitor reviews — your opportunities.'}</p>

    <div class="cbp-grid">
      <div class="cbp-col">
        <h3 class="cbp-col-title love">${lang === 'ko' ? '그들이 사랑하는 것' : 'What they love'}</h3>
        ${quoteCards(cbp.theyLove, 'love')}
      </div>
      <div class="cbp-divider"></div>
      <div class="cbp-col">
        <h3 class="cbp-col-title hate">${lang === 'ko' ? '그들이 싫어하는 것' : 'What they hate'}</h3>
        ${quoteCards(cbp.theyHate, 'hate')}
      </div>
    </div>

    ${cbp.opportunities && cbp.opportunities.length > 0 ? `
    <div class="cbp-opportunities">
      <h3>${lang === 'ko' ? '기회 포인트' : 'Opportunities'}</h3>
      <ul>${cbp.opportunities.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
    </div>` : ''}
  </section>`;
}

// --- Monthly Trend Chart ---
function monthlyTrendHTML() {
  let trendData = analysis.monthlyTrend;

  // Auto-calculate from reviews if available and no monthlyTrend
  if (!trendData && analysis.reviews && Array.isArray(analysis.reviews)) {
    const monthMap = {};
    analysis.reviews.forEach(r => {
      if (r.isChurnSignal || r.subscriptionRelated) {
        const d = new Date(r.date || r.createdAt);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthMap[key] = (monthMap[key] || 0) + 1;
        }
      }
    });
    const keys = Object.keys(monthMap).sort();
    if (keys.length > 1) {
      trendData = keys.map(k => ({ month: k, count: monthMap[k] }));
    }
  }

  if (!trendData || !Array.isArray(trendData) || trendData.length === 0) return '';

  const maxCount = Math.max(...trendData.map(d => d.count));
  const barHeight = (count) => Math.max(4, Math.round((count / maxCount) * 120));

  return `
  <section class="section trend-section">
    <h2 class="section-title">${t.trendTitle}</h2>
    <div class="trend-chart">
      ${trendData.map(d => `
      <div class="trend-bar-col">
        <div class="trend-bar-value">${d.count}</div>
        <div class="trend-bar" style="height:${barHeight(d.count)}px"></div>
        <div class="trend-bar-label">${esc(d.month)}</div>
      </div>`).join('')}
    </div>
  </section>`;
}

// --- Limitations Section ---
function limitationsHTML() {
  return `
  <section class="section limitations">
    <h2>${t.limitationsTitle}</h2>
    <p>${t.limitationsIntro}</p>
    <ul>
      ${t.limitationsItems.map(item => `
      <li><strong>${item.bold}</strong> — ${item.detail}</li>`).join('')}
    </ul>
    <p>${t.limitationsOutro}</p>
  </section>`;
}

// --- Experiments ---
function experimentsHTML() {
  if (!analysis.experiments?.length) return '';
  const hasDetail = analysis.experiments[0].design;

  if (hasDetail) {
    return `
    <section class="section">
      <h2 class="section-title">${t.experimentsTitle}</h2>
      <p class="section-intro">${t.experimentsIntro}</p>
      <div class="exp-cards">
        ${analysis.experiments.map(exp => `
        <div class="exp-card">
          <div class="exp-header">
            ${exp.priority ? `<span class="exp-priority">${esc(exp.priority)}</span>` : ''}
            <p class="exp-hypothesis">"${esc(exp.hypothesis)}"</p>
          </div>
          <div class="exp-body">
            <div class="exp-field">
              <span class="exp-label">${t.expDesign}</span>
              <p>${esc(exp.design)}</p>
            </div>
            <div class="exp-grid">
              <div class="exp-field">
                <span class="exp-label">${t.expMetric}</span>
                <p>${esc(exp.metric)}</p>
              </div>
              ${exp.guardrail ? `<div class="exp-field">
                <span class="exp-label">${t.expGuardrail}</span>
                <p>${esc(exp.guardrail)}</p>
              </div>` : ''}
              <div class="exp-field">
                <span class="exp-label">${t.expDuration}</span>
                <p>${esc(exp.duration || '')}</p>
              </div>
              ${exp.sampleSize ? `<div class="exp-field">
                <span class="exp-label">${t.expSample}</span>
                <p>${esc(exp.sampleSize)}</p>
              </div>` : ''}
            </div>
            <div class="exp-field expected">
              <span class="exp-label">${t.expExpected}</span>
              <p>${esc(exp.expected)}</p>
            </div>
            ${exp.prerequisite ? `<div class="exp-field prereq">
              <span class="exp-label">${t.expPrereq}</span>
              <p>${esc(exp.prerequisite)}</p>
            </div>` : ''}
          </div>
        </div>`).join('')}
      </div>
    </section>`;
  }

  // Fallback: simple table for old-format experiments
  return `
  <section class="section">
    <h2 class="section-title">${t.experimentsTitle}</h2>
    <table class="exp-table">
      <thead><tr><th>${t.expHypothesis}</th><th>${t.expDesign}</th><th>${t.expExpected}</th></tr></thead>
      <tbody>${analysis.experiments.map(exp => `
        <tr><td>${esc(exp.hypothesis)}</td><td>${esc(exp.test || exp.design || '')}</td><td>${esc(exp.expected)}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>`;
}

// --- CTA ---
function ctaHTML() {
  const waitlistBlock = waitlistEnabled ? `
    <div class="waitlist-box">
      <div class="waitlist-label">${t.waitlistTitle}</div>
      <p>${t.waitlistLine1}</p>
      <p>${t.waitlistLine2}</p>
      <p class="waitlist-fine">${t.waitlistLine3}</p>
      <a href="https://airbridge.io" target="_blank" class="waitlist-btn">${t.waitlistBtn} &rarr;</a>
    </div>` : '';

  return `
  <section class="section cta-section">
    <h2 class="cta-title">${t.ctaTitle}</h2>
    <p>${t.ctaLine1}</p>
    <p>${t.ctaLine2}</p>
    <p class="cta-closer">${t.ctaLine3}</p>
    <a href="https://airbridge.io" target="_blank" class="cta-link">${t.ctaLink} &rarr;</a>
    ${waitlistBlock}
  </section>`;
}

// --- LinkedIn ---
function linkedinHTML() {
  if (!linkedinUrl) return '';
  return `
  <section class="section connect-section">
    <p>${t.linkedinLine}</p>
    <a href="${esc(linkedinUrl)}" target="_blank" class="linkedin-link">${t.linkedinCta} &rarr;</a>
  </section>`;
}

// =====================
// === HTML Assembly ===
// =====================

const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Churn Diagnosis — ${esc(analysis.app.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #FAFAF9;
    --text: #1C1917;
    --text-2: #78716C;
    --text-3: #A8A29E;
    --border: #D6D3D1;
    --accent: #DC2626;
    --accent-light: #FEF2F2;
    --surface: #FFFFFF;
    --max-w: 680px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
  }

  /* ---- Sections ---- */
  .section { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }
  .section + .section { margin-top: 100px; }
  .section-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .section-intro {
    color: var(--text-2);
    font-size: 15px;
    margin-bottom: 32px;
  }

  /* ---- Intro ---- */
  .intro {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 120px 24px 0;
  }
  .intro h1 {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.03em;
  }
  .intro .num {
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
  .intro .app-meta {
    margin-top: 12px;
    font-size: 14px;
    color: var(--text-3);
  }
  .intro .summary {
    margin-top: 28px;
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-2);
    max-width: 600px;
  }

  /* ---- Methodology (collapsible) ---- */
  .methodology {
    margin-top: 32px;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }
  .methodology summary {
    padding: 14px 20px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .methodology summary::-webkit-details-marker { display: none; }
  .methodology summary::before {
    content: '+';
    font-size: 16px;
    font-weight: 400;
    color: var(--text-3);
    width: 20px;
    text-align: center;
    transition: transform 200ms;
  }
  .methodology[open] summary::before {
    content: '\u2212';
  }
  .methodology-body {
    padding: 0 20px 20px;
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.7;
  }
  .methodology-body p { margin-bottom: 12px; }
  .methodology-body ol {
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .methodology-body li { padding-left: 4px; }
  .methodology-body strong { color: var(--text); font-weight: 600; }

  /* ---- Dot Grid ---- */
  .dot-section {
    max-width: var(--max-w);
    margin: 100px auto 0;
    padding: 0 24px;
  }
  .dot-section .lead {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.5;
    margin-bottom: 28px;
  }
  .dot-section .lead .accent { color: var(--accent); font-weight: 700; }
  .dot-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 12px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--border);
    transition: transform 150ms;
  }
  .dot.signal { background: var(--accent); }
  .dot-caption {
    font-size: 12px;
    color: var(--text-3);
    margin-top: 8px;
  }

  /* ---- Platform Comparison ---- */
  .platform-section { margin-top: 100px; }
  .plat-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 24px;
  }
  .plat-table th {
    text-align: center;
    padding: 14px 16px;
    font-size: 14px;
    font-weight: 700;
    border-bottom: 2px solid var(--border);
  }
  .plat-table th:first-child { text-align: left; }
  .plat-icon { margin-right: 6px; }
  .plat-table td {
    text-align: center;
    padding: 12px 16px;
    font-size: 14px;
    border-bottom: 1px solid #EEECEB;
    line-height: 1.5;
  }
  .plat-table td:first-child {
    text-align: left;
    font-weight: 500;
    color: var(--text-2);
  }
  .plat-table td.highlight {
    color: var(--accent);
    font-weight: 700;
  }
  .plat-label { font-size: 13px; }
  .plat-insight {
    margin-top: 20px;
    padding: 16px 20px;
    background: #F5F5F4;
    border-radius: 8px;
    border-left: 3px solid var(--accent);
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
  }
  .bar-platform-split {
    display: inline-block;
    font-size: 11px;
    color: var(--text-3);
    margin-left: 8px;
    font-weight: 400;
  }

  /* ---- Bar Chart ---- */
  .bars-section {
    max-width: var(--max-w);
    margin: 100px auto 0;
    padding: 0 24px;
  }
  .bars-section .lead {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .bars-section .lead .accent { color: var(--accent); font-weight: 700; }
  .bars-section .hint {
    font-size: 13px;
    color: var(--text-3);
    margin-bottom: 32px;
  }
  .severity-note {
    font-size: 12px;
    color: var(--text-3);
    margin-top: 16px;
    font-style: italic;
  }
  .bar-row {
    cursor: pointer;
    padding: 10px 0;
    border-bottom: 1px solid #EEECEB;
    transition: background 150ms;
  }
  .bar-row:hover { background: #F5F5F4; margin: 0 -12px; padding: 10px 12px; border-radius: 6px; border-color: transparent; }
  .bar-row.top3 .bar-name { font-weight: 700; }
  .bar-label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }
  .bar-name { font-size: 14px; font-weight: 500; }
  .bar-meta { font-size: 12px; color: var(--text-3); }
  .bar-track {
    height: 20px;
    background: #F5F5F4;
    border-radius: 4px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 8px;
    min-width: 32px;
  }
  .bar-score {
    font-size: 11px;
    font-weight: 700;
    color: white;
  }
  .bar-quotes-panel {
    padding: 12px 0 12px 16px;
    border-left: 2px solid var(--accent);
    margin: 0 0 8px 0;
  }
  .bar-quote {
    font-size: 13px;
    color: var(--text-2);
    font-style: italic;
    line-height: 1.6;
    margin-bottom: 8px;
  }
  .bar-quote:last-child { margin-bottom: 0; }
  .bar-quote mark { background: var(--accent-light); color: var(--accent); font-style: normal; padding: 1px 3px; border-radius: 2px; }

  /* ---- Deep Dives ---- */
  .deepdive { margin-top: 100px; }
  .dd-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--accent);
    margin-bottom: 8px;
  }
  .dd-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.03em;
    margin-bottom: 8px;
  }
  .dd-meta {
    font-size: 13px;
    color: var(--text-3);
    margin-bottom: 36px;
  }
  .dd-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-2);
    margin-bottom: 24px;
  }
  .dd-analysis {
    margin-top: 32px;
  }
  .dd-analysis h3 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-2);
    margin-bottom: 8px;
  }
  .dd-analysis p {
    font-size: 15px;
    color: var(--text);
    line-height: 1.7;
  }
  .dd-punchline {
    font-size: 20px;
    font-weight: 600;
    font-style: italic;
    color: var(--accent);
    margin: 36px 0;
    padding-left: 20px;
    border-left: 3px solid var(--accent);
    line-height: 1.5;
  }

  /* DD1: Big Quotes */
  .dd1-quotes { display: flex; flex-direction: column; gap: 16px; }
  .big-quote {
    font-size: 18px;
    line-height: 1.6;
    color: var(--text);
    padding: 20px 24px;
    background: #F5F5F4;
    border-radius: 8px;
    border: none;
    font-style: italic;
  }
  .big-quote mark { background: var(--accent-light); color: var(--accent); font-style: normal; padding: 2px 4px; border-radius: 3px; }

  /* DD2: Journey Timeline */
  .journey {
    display: flex;
    align-items: center;
    gap: 0;
    overflow-x: auto;
    padding: 20px 0;
    margin-bottom: 24px;
  }
  .journey-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
  }
  .journey-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--text);
  }
  .journey-step.break { color: var(--accent); font-weight: 700; }
  .journey-step.break .journey-dot { background: var(--accent); width: 16px; height: 16px; box-shadow: 0 0 0 4px var(--accent-light); }
  .journey-step.faded { opacity: 0.25; }
  .journey-line {
    width: 40px;
    height: 2px;
    background: var(--border);
    flex-shrink: 0;
  }
  .journey-line.faded { background: var(--border); opacity: 0.3; stroke-dasharray: 4 4; }
  .speech-bubble {
    font-size: 14px;
    font-style: italic;
    color: var(--text-2);
    padding: 12px 16px;
    background: #F5F5F4;
    border-radius: 8px;
    margin-bottom: 10px;
    position: relative;
  }
  .speech-bubble mark { background: var(--accent-light); color: var(--accent); font-style: normal; padding: 1px 3px; border-radius: 2px; }

  /* DD3: Before/After */
  .comparison {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    gap: 32px;
    margin-bottom: 20px;
  }
  .comp-divider { background: var(--border); }
  .comp-col h4 {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-3);
    margin-bottom: 16px;
  }
  .comp-col.expect p { font-size: 15px; line-height: 1.7; color: var(--text); }
  .comp-col.got blockquote {
    font-size: 14px;
    font-style: italic;
    color: var(--text-2);
    line-height: 1.6;
    padding: 10px 14px;
    background: var(--accent-light);
    border-radius: 6px;
    border: none;
    margin-bottom: 10px;
  }
  .comp-col.got blockquote mark { background: transparent; color: var(--accent); font-weight: 600; }

  /* ---- Actions ---- */
  .dd-actions { margin-top: 32px; }
  .dd-actions h3 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-2);
    margin-bottom: 16px;
  }
  .action-row {
    display: flex;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid #EEECEB;
    font-size: 14px;
    line-height: 1.6;
  }
  .action-row:last-child { border-bottom: none; }
  .action-level {
    flex-shrink: 0;
    width: 80px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-3);
    padding-top: 2px;
  }
  .action-text { color: var(--text); }

  .dd-test {
    margin-top: 24px;
    padding: 16px 20px;
    background: var(--accent-light);
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
  }
  .dd-test strong { color: var(--accent); }

  /* ---- Marketer Actions ---- */
  .dd-marketer-actions {
    margin-top: 28px;
    padding-left: 16px;
    border-left: 3px solid #D97706;
  }
  .dd-marketer-actions h3 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #D97706;
    margin-bottom: 12px;
  }
  .marketer-action-row {
    padding: 8px 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    border-bottom: 1px solid #EEECEB;
  }
  .marketer-action-row:last-child { border-bottom: none; }

  /* ---- Rating Extremes ---- */
  .rating-extremes { margin-top: 100px; }
  .re-grid {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    gap: 32px;
    margin-top: 24px;
  }
  .re-divider { background: var(--border); }
  .re-col-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border);
  }
  .re-haters .re-col-header { border-color: var(--accent); }
  .re-lovers .re-col-header { border-color: #D97706; }
  .re-col-title { font-size: 14px; font-weight: 700; }
  .re-col-count { font-size: 13px; color: var(--text-3); }
  .re-profile, .re-features, .re-skew {
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .re-skew { color: var(--accent); font-weight: 500; }
  .re-themes { display: flex; flex-direction: column; gap: 10px; }
  .re-theme {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13px;
  }
  .re-haters .re-theme { background: var(--accent-light); }
  .re-lovers .re-theme { background: #F5F5F4; }
  .re-theme-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .re-theme-name { font-weight: 600; color: var(--text); }
  .re-theme-count { font-size: 11px; color: var(--text-3); font-weight: 700; }
  .re-theme-quote {
    font-style: italic;
    color: var(--text-2);
    line-height: 1.5;
    margin-top: 4px;
  }
  .re-theme-quote mark { background: var(--accent-light); color: var(--accent); font-style: normal; padding: 1px 3px; border-radius: 2px; }
  .re-gap-insight {
    margin-top: 24px;
    padding: 16px 20px;
    background: #F5F5F4;
    border-radius: 8px;
    border-left: 3px solid var(--accent);
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
  }

  /* ---- Competitor Buying Points ---- */
  .competitor-buying-points { margin-top: 100px; }
  .cbp-grid {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    gap: 32px;
    margin-top: 24px;
  }
  .cbp-divider { background: var(--border); }
  .cbp-col-title {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border);
  }
  .cbp-col-title.love { border-color: #D97706; }
  .cbp-col-title.hate { border-color: var(--accent); }
  .cbp-card {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 10px;
    font-size: 13px;
  }
  .cbp-card.love { background: #F5F5F4; }
  .cbp-card.hate { background: var(--accent-light); }
  .cbp-theme { font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .cbp-quote { font-style: italic; color: var(--text-2); line-height: 1.5; }
  .cbp-quote mark { background: var(--accent-light); color: var(--accent); font-style: normal; padding: 1px 3px; border-radius: 2px; }
  .cbp-opportunities {
    margin-top: 24px;
    padding: 16px 20px;
    background: #F5F5F4;
    border-radius: 8px;
    border-left: 3px solid #D97706;
  }
  .cbp-opportunities h3 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #D97706;
    margin-bottom: 12px;
  }
  .cbp-opportunities ul {
    list-style: none;
    padding: 0;
  }
  .cbp-opportunities li {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    padding: 6px 0;
    border-bottom: 1px solid #EEECEB;
  }
  .cbp-opportunities li:last-child { border-bottom: none; }
  .cbp-opportunities li::before { content: '\\2192  '; color: #D97706; font-weight: 600; }

  /* ---- Compounding Map ---- */
  .compounding-map { margin-top: 100px; }
  .compound-viz {
    margin-top: 24px;
  }
  .compound-nodes {
    display: flex;
    justify-content: space-around;
    gap: 16px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }
  .compound-node {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
  }
  .compound-node-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .compound-edges {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .compound-edge {
    padding: 14px 20px;
    background: #F5F5F4;
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .compound-edge-from, .compound-edge-to {
    font-size: 13px;
    font-weight: 700;
  }
  .compound-arrow {
    font-size: 16px;
    color: var(--text-3);
  }
  .compound-edge-label {
    width: 100%;
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.6;
    margin-top: 4px;
  }

  /* ---- Monthly Trend ---- */
  .trend-section { margin-top: 100px; }
  .trend-chart {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding: 20px 0;
    min-height: 180px;
  }
  .trend-bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
  }
  .trend-bar-value {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-2);
  }
  .trend-bar {
    width: 100%;
    max-width: 48px;
    background: var(--accent);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
  }
  .trend-bar-label {
    font-size: 11px;
    color: var(--text-3);
    text-align: center;
    white-space: nowrap;
  }

  /* ---- Limitations ---- */
  .limitations {
    border-left: 3px solid var(--border);
    padding-left: 24px !important;
  }
  .limitations h2 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }
  .limitations p {
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-2);
    margin-bottom: 16px;
  }
  .limitations ul {
    list-style: none;
    padding: 0;
    margin-bottom: 16px;
  }
  .limitations li {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-2);
    padding: 8px 0;
    border-bottom: 1px solid #EEECEB;
  }
  .limitations li:last-child { border-bottom: none; }
  .limitations li strong {
    color: var(--text);
    font-weight: 600;
  }

  /* ---- Experiments (detailed cards) ---- */
  .exp-cards { display: flex; flex-direction: column; gap: 24px; }
  .exp-card {
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface);
  }
  .exp-header {
    padding: 20px 24px;
    border-bottom: 1px solid #EEECEB;
  }
  .exp-priority {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--accent);
    background: var(--accent-light);
    padding: 3px 10px;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  .exp-hypothesis {
    font-size: 16px;
    font-weight: 600;
    font-style: italic;
    line-height: 1.5;
    color: var(--text);
  }
  .exp-body { padding: 20px 24px; }
  .exp-field { margin-bottom: 16px; }
  .exp-field:last-child { margin-bottom: 0; }
  .exp-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-3);
    margin-bottom: 4px;
  }
  .exp-field p { font-size: 14px; line-height: 1.6; color: var(--text); }
  .exp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .exp-field.expected {
    padding: 14px 18px;
    background: #F5F5F4;
    border-radius: 8px;
  }
  .exp-field.prereq {
    padding: 14px 18px;
    background: #FFFBEB;
    border-radius: 8px;
    border: 1px solid #FDE68A;
  }

  /* Fallback table */
  .exp-table { width: 100%; border-collapse: collapse; }
  .exp-table th { text-align: left; padding: 10px 0; font-size: 12px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border); }
  .exp-table td { padding: 14px 14px 14px 0; font-size: 14px; border-bottom: 1px solid #EEECEB; line-height: 1.5; }

  /* ---- CTA ---- */
  .cta-section { border-top: 1px solid var(--border); padding-top: 48px; }
  .cta-title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 20px;
  }
  .cta-section p {
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-2);
    margin-bottom: 12px;
  }
  .cta-section em { font-style: normal; font-weight: 600; color: var(--text); }
  .cta-section strong { color: var(--text); }
  .cta-closer {
    padding: 16px 20px;
    background: #F5F5F4;
    border-radius: 8px;
    border-left: 3px solid var(--accent);
    margin-top: 8px;
  }
  .cta-link {
    display: inline-block;
    margin-top: 16px;
    font-size: 15px;
    font-weight: 600;
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid var(--accent);
    padding-bottom: 2px;
    transition: opacity 150ms;
  }
  .cta-link:hover { opacity: 0.7; }

  /* Waitlist offer */
  .waitlist-box {
    margin-top: 28px;
    padding: 28px 28px 24px;
    background: var(--surface);
    border: 1.5px solid var(--text);
    border-radius: 10px;
  }
  .waitlist-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-3);
    margin-bottom: 14px;
  }
  .waitlist-box p {
    font-size: 15px;
    line-height: 1.7;
    color: var(--text);
    margin-bottom: 10px;
  }
  .waitlist-box strong { color: var(--text); }
  .waitlist-fine {
    font-size: 13px !important;
    color: var(--text-3) !important;
    margin-bottom: 18px !important;
  }
  .waitlist-btn {
    display: inline-block;
    padding: 12px 32px;
    background: var(--text);
    color: var(--bg);
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 6px;
    transition: opacity 150ms;
  }
  .waitlist-btn:hover { opacity: 0.85; }

  /* ---- Connect (LinkedIn) ---- */
  .connect-section {
    text-align: center;
    padding-top: 48px;
    padding-bottom: 48px;
    border-top: 1px solid var(--border);
  }
  .connect-section p {
    font-size: 15px;
    color: var(--text-2);
    margin-bottom: 12px;
  }
  .linkedin-link {
    display: inline-block;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    text-decoration: none;
    padding: 10px 28px;
    border: 1.5px solid var(--text);
    border-radius: 6px;
    transition: background 150ms, color 150ms;
  }
  .linkedin-link:hover {
    background: var(--text);
    color: var(--bg);
  }

  /* ---- Footer ---- */
  .footer {
    max-width: var(--max-w);
    margin: 80px auto 0;
    padding: 24px;
    text-align: center;
    font-size: 12px;
    color: var(--text-3);
    border-top: 1px solid var(--border);
  }

  /* ---- Responsive ---- */
  @media (max-width: 680px) {
    .intro { padding-top: 80px; }
    .intro h1 { font-size: 28px; }
    .dd-title { font-size: 22px; }
    .comparison { grid-template-columns: 1fr; gap: 24px; }
    .comp-divider { display: none; }
    .comp-col.got { border-top: 1px solid var(--border); padding-top: 20px; }
    .journey { flex-wrap: wrap; gap: 8px; }
    .journey-line { width: 20px; }
    .exp-grid { grid-template-columns: 1fr; }
    .section + .section { margin-top: 72px; }
    .compound-nodes { flex-direction: column; }
    .trend-chart { gap: 6px; }
    .re-grid { grid-template-columns: 1fr; gap: 24px; }
    .re-divider { display: none; }
    .re-lovers { border-top: 1px solid var(--border); padding-top: 20px; }
    .cbp-grid { grid-template-columns: 1fr; gap: 24px; }
    .cbp-divider { display: none; }
  }

  @media print {
    .methodology, .cta-section, .connect-section { display: none; }
    .section + .section { margin-top: 40px; }
    body { background: white; }
  }
</style>
</head>
<body>

  <!-- Intro -->
  <div class="intro">
    <h1>${t.introLine(analysis.app.name, analysis.totalReviews)}</h1>
    <div class="app-meta">${esc(analysis.app.category)} · ${esc(analysis.app.model)} · ${new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    <p class="summary">${esc(analysis.executiveSummary)}</p>
    ${methodologyHTML()}
  </div>

  <!-- Dot Visualization -->
  <div class="dot-section">
    <p class="lead">${t.signalLine(signalRate, analysis.subscriptionRelated)}</p>
    <div class="dot-grid">${dotGrid()}</div>
    <p class="dot-caption">${t.dotCaption}</p>
  </div>

  <!-- Platform Comparison -->
  ${platformComparisonHTML()}

  <!-- Bar Chart -->
  <div class="bars-section">
    <p class="lead">${t.patternLine(sorted.length)}</p>
    <p class="hint">${t.patternHint}</p>
    ${barChart()}
    <p class="severity-note">${t.severityNote}</p>
  </div>

  <!-- Monthly Trend -->
  ${monthlyTrendHTML()}

  <!-- Deep Dive Intro -->
  <div class="section" style="margin-top:100px">
    <p class="lead" style="font-size:20px;font-weight:600;letter-spacing:-0.02em">${t.deepdiveIntro}</p>
  </div>

  <!-- Deep Dives (3 different layouts) -->
  ${top3[0] ? deepDive1(top3[0], 0) : ''}
  ${top3[1] ? deepDive2(top3[1], 1) : ''}
  ${top3[2] ? deepDive3(top3[2], 2) : ''}

  <!-- Compounding Map -->
  ${compoundingMapHTML()}

  <!-- Rating Extremes -->
  ${ratingExtremesHTML()}

  <!-- Competitor Buying Points -->
  ${competitorBuyingPointsHTML()}

  <!-- Experiments -->
  ${experimentsHTML()}

  <!-- Limitations -->
  ${limitationsHTML()}

  <!-- CTA -->
  ${ctaHTML()}

  <!-- LinkedIn -->
  ${linkedinHTML()}

  <!-- Footer -->
  <div class="footer">${t.footer}</div>

<script>
// Count-up animation for intro number
function countUp(el, target, duration) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Observe intro number
const numEl = document.querySelector('.num');
if (numEl) {
  const target = parseInt(numEl.dataset.target, 10);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        countUp(numEl, target, 800);
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  observer.observe(numEl);
}

// Bar chart toggle
function toggleQuotes(barRow) {
  const panel = barRow.nextElementSibling;
  if (panel && panel.classList.contains('bar-quotes-panel')) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
}
</script>

</body>
</html>`;

fs.writeFileSync(path.resolve(outputFile), html);
console.log(`Report generated: ${path.resolve(outputFile)}`);
