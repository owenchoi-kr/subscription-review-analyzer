# Subscription Churn Diagnosis Skill — 사용 가이드

> 앱 스토어 리뷰를 분석해서 구독 이탈 원인을 진단하고, 공유 가능한 HTML 리포트를 생성하는 Claude Code 스킬입니다.

---

## 준비물

| 항목 | 설명 |
|------|------|
| **Claude Code** | [claude.ai/claude-code](https://claude.ai/claude-code) 에서 설치 |
| **Node.js** | v18 이상 (`node -v`로 확인) |
| **분석할 앱** | App Store 또는 Play Store에 올라와 있는 구독 앱 이름 |

---

## 설치 (1분)

### 1. 프로젝트 클론

```bash
git clone https://github.com/owenchoi-kr/subscription-review-analyzer.git
cd subscription-review-analyzer
```

### 2. 의존성 설치

```bash
npm install
```

> `google-play-scraper`와 `app-store-scraper`가 자동으로 설치됩니다.

### 3. 스킬 등록

스킬 파일이 `.claude/commands/diagnosing-subscription-churn.md`에 이미 있습니다.
`subscription-review-analyzer` 디렉토리 안에서 Claude Code를 실행하면 자동으로 인식됩니다.

---

## 사용법

### 방법 1: 슬래시 커맨드

```bash
cd subscription-review-analyzer
claude
```

Claude Code가 열리면:

```
/diagnosing-subscription-churn
```

### 방법 2: 자연어

Claude Code에서 그냥 말하면 됩니다:

```
"Calm 앱 리뷰 분석해줘. 왜 유저들이 구독 이탈하는지 진단해줘."
```

```
"Headspace vs Calm 비교 분석해줘."
```

```
"Nightly 앱 구독 전환율이 왜 낮은지 리뷰로 진단해줘."
```

---

## 진행 플로우

스킬이 실행되면 아래 순서대로 자동 진행됩니다:

```
Step 0  질문 4개로 분석 범위 확인
   ↓
Step 1  앱 스토어 리뷰 자동 수집 (최근 6개월, 전체 별점)
   ↓
Step 2  8가지 이탈 카테고리로 리뷰 분류
   ↓
Step 3  가중 점수 기반 우선순위 산정 (Top 3)
   ↓
Step 4  Top 3 이슈 근본원인 분석 + 실험 설계
   ↓
Step 5  인터랙티브 HTML 리포트 생성
   ↓
Step 6  리포트 열기 & 공유 옵션 제공
   ↓
Step 7  다음 액션 제안
```

---

## 리포트 공유하기

### 옵션 A: HTML 파일 그대로 공유 (가장 쉬움)

생성된 `.html` 파일을 Slack, 이메일, 노션에 첨부하면 됩니다.
단일 파일이라 의존성 없이 아무 브라우저에서 열립니다.

### 옵션 B: URL로 배포 (링크드인 공유용)

Claude Code가 surge.sh 배포를 안내합니다:

```bash
npx surge ./report --domain my-app-churn-report.surge.sh
```

처음 한 번만 이메일로 가입하면 이후 자동 배포됩니다.
배포 후 `https://my-app-churn-report.surge.sh` 링크를 LinkedIn 포스트에 바로 사용하세요.

---

## 리포트 구성

| 섹션 | 설명 |
|------|------|
| **인트로** | 분석한 리뷰 수와 이탈 신호 비율 |
| **Dot Grid** | 전체 리뷰를 점으로 시각화, 이탈 신호는 빨간색 |
| **Bar Chart** | 8가지 이탈 카테고리별 가중 점수 (클릭하면 원문 펼쳐짐) |
| **Deep Dive ×3** | 상위 3개 이슈 각각 다른 레이아웃으로 분석 |
| **Experiments** | A/B 테스트 설계 로드맵 |
| **CTA** | Airbridge Core Plan 소개 + 얼리 액세스 |

---

## 자주 묻는 질문

### Q: 리뷰가 너무 적으면?

최소 30개 이상 확보를 추천합니다. 리뷰가 적은 앱은 `--months 12`로 기간을 늘리거나, 경쟁사 리뷰를 같이 분석하세요.

### Q: 한국어 리포트도 되나요?

네. `--lang ko` 플래그로 한국어 리포트를 생성할 수 있습니다. 분석 JSON에 한국어 번역을 넣으면 됩니다.

### Q: 경쟁사 비교는 어떻게?

Step 0에서 "Compare vs competitor"를 선택하면 두 앱의 리뷰를 나란히 분석합니다.

### Q: 리포트를 수정하고 싶으면?

`analysis.json` 파일을 수정한 뒤 리포트를 다시 생성하면 됩니다:
```bash
node scripts/generate_report.js analysis.json --output report.html
```

---

## 문의

- **GitHub**: [github.com/owenchoi-kr/subscription-review-analyzer](https://github.com/owenchoi-kr/subscription-review-analyzer)
- **LinkedIn**: [linkedin.com/in/owenchoi-kr](https://www.linkedin.com/in/owenchoi-kr/)
