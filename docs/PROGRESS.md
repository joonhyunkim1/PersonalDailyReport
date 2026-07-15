# 진행 상황 (Progress Log)

> 마지막 업데이트: 2026-07-15
> 목적: 다음 세션에서 컨텍스트 없이도 바로 이어서 작업할 수 있도록 현재 상태를 기록한다.
> 설계 배경/원 설계는 `docs/DESIGN.md` 참고 (단, 아래 §2 변경사항 이후로는 이 문서가 더 최신 상태다).

---

## 1. 완료된 작업 (Phase 0~4, 그리고 Phase 3 진행 중)

| Phase | 내용 | 커밋 |
|---|---|---|
| 0 | Next.js 16 + Prisma 스키마 + Neon DB 연결 + cron/health 라우트 스켈레톤 | `090db1e` |
| 0 | 초기 마이그레이션 | `acb39a6` |
| 1 | 7개 섹션 더미 콘텐츠 → Composer → React Email → Resend 실제 발송 확인 | `b0583fa` |
| 2 | TECH_CONCEPT/INTERVIEW 실제 OpenAI 생성 전환 | `e772c30` |
| 2 | CODING_TEST 실제 OpenAI 생성 전환 | `b867f28` |
| 2 | AI_NEWS/JOB_MARKET/SEMICONDUCTOR/STOCK_MARKET 실제 생성 (2-pass web_search) | `04ab52f` |
| 2.5 | 사용자 피드백 반영: 섹션 통합·축소 (아래 §2 참고) | `2306022` |
| 4 | 중복방지 + 전공지식 수준별(BASIC→INTERMEDIATE→ADVANCED) 진행 로직 | `dd9aabf` |
| 3 | 이메일 디자인 도구(fixture/프리뷰서버/PDF 추출) + 다크모드 대응 | 이번 세션 |

현재 `main` 브랜치는 로컬/원격(`origin/main`) 완전히 동기화된 상태, working tree clean.

---

## 2. Phase 2 이후 사용자 피드백으로 변경된 사항

토큰 비용이 예상보다 훨씬 높게 나와서(§4 참고), 사용자 요청으로 아래와 같이 섹션을 조정했다:

- **"AI/Computer Vision 뉴스" + "반도체/임베디드 뉴스" → "AI / 임베디드 뉴스" 하나로 통합.** AI가 CV의 상위 분류이고, 사용자 전공(Embedded)에 더 맞는 임베디드 쪽에 무게를 둠. 검색 1회로 축소, 평균 4건(min 3/max 5).
  - `SEMICONDUCTOR` SectionType enum 값 자체를 제거 (마이그레이션 `20260708071639_remove_semiconductor_section_type` 적용 완료).
  - `src/lib/modules/semiconductor/`, `src/lib/openai/schemas/semiconductor.schema.ts`, `src/lib/email/templates/sections/SemiconductorSection.tsx` 삭제.
- **"취업 정보"(JOB_MARKET)는 일시 중단.** 파이프라인 호출/이메일 렌더링 모두 제외했지만, `src/lib/modules/jobMarket/`, `src/lib/openai/schemas/jobMarket.schema.ts`, `src/lib/email/templates/sections/JobMarketSection.tsx` 파일은 나중에 재사용할 수 있도록 그대로 보존.
- **코딩테스트는 프로그래머스로 한정.** LeetCode/백준 제외 (`CodingTestSchema.platform`을 `z.literal("프로그래머스")`로 하드 제약).

**현재 실제 활성 섹션은 5개**: CODING_TEST, TECH_CONCEPT, INTERVIEW, AI_NEWS(통합), STOCK_MARKET.

---

## 3. Phase 4에서 구현한 중복방지/진행 로직

- `src/lib/dedup/techTopic.ts` — `pickNextTopic()` / `recordTechTopicUsage()`: 신규 주제는 BASIC부터, 기존 주제는 다음 레벨로 승급(ADVANCED 상한), 주제당 14일 쿨다운, 카탈로그 미도입 주제가 있으면 신규 70%/기존 30%, 다 도입되면 신규 30%/기존 70%로 가중치 전환.
- `TechConceptSchema`에서 모델이 topic/category/level을 자유롭게 쓰게 두지 않고, **선택은 우리 알고리즘이 하고 모델은 그 주제로 내용만 작성** — 모델이 echo한 topic/category/level은 항상 우리가 계산한 값으로 override해서 DB 드리프트를 원천 차단.
- `InterviewQuestionHistory`는 `TechTopicHistory`와 연결(FK) — `ModuleResult.meta`라는 새 채널(이메일에는 안 들어가는 orchestrator 내부용)로 `techTopicHistoryId`를 TECH_CONCEPT → INTERVIEW로 전달.
- `CodingProblemHistory`: 최근 30일간 낸 문제 제외 목록을 프롬프트에 주입, 생성 후 기록.
- AI_NEWS: `NewsArticleSeen`(URL 해시 기반) 대신 **과거 `BriefingSection` JSON에서 제목을 직접 조회**하는 방식으로 단순화 — 현재 구조화 출력에 실제 URL이 없어서 URL 해시 테이블을 쓸 수 없었음. 나중에 실제 URL을 캡처하게 되면 `NewsArticleSeen`으로 전환 고려.
- `TechTopicCatalog`은 `prisma/seed.ts`로 27개 주제 시드 완료 (`npx prisma db seed`, `prisma.config.ts`의 `migrations.seed`에 연결됨 — package.json이 아니라 **prisma.config.ts**에 seed 설정하는 게 Prisma 7 방식임에 주의).

**검증 방법**: 실제 파이프라인 1회 실행(비용 발생) + OpenAI 호출 없이 실제 `pickNextTopic`/`recordTechTopicUsage` 함수만 반복 호출하는 격리 스크립트로 BASIC→INTERMEDIATE→ADVANCED→ADVANCED 유지를 확인. 이 검증 스크립트는 임시 파일(`_tmp_verify.ts`)로 실행 후 삭제했고, 실제 사용자 데이터(Fine-Tuning 진행 상황)는 건드리지 않도록 격리해서 실행함 — 저장소에는 남아있지 않음.

---

## 4. 이번 세션에서 발견한 기술적 함정 (다음에 또 헤매지 않도록)

이 프로젝트는 최신 버전들(Next.js 16, Prisma 7, OpenAI SDK 6.x)을 쓰고 있어서 학습 지식과 다른 부분이 많았다. `AGENTS.md`가 이미 "node_modules/next/dist/docs 확인하고 작업하라"고 경고해둔 이유.

- **Next.js 16.2.10**: Cache Components를 켜지 않은 기본 상태에서는 기존 App Router 관례(Route Handler, `export const dynamic` 등)가 그대로 동작. 굳이 안 건드려도 됨.
- **Prisma 7**: `PrismaClient`가 더 이상 단순 `DATABASE_URL` 문자열로 생성되지 않는다. **Driver Adapter 필수** (`@prisma/adapter-pg` + `pg`). `schema.prisma`의 `datasource` 블록엔 `url`을 안 쓰고, 런타임에 `new PrismaPg(env.DATABASE_URL)` → `new PrismaClient({ adapter })`.
- **Prisma 7 seed 설정 위치**: `package.json`의 `"prisma": { "seed": ... }`가 아니라 **`prisma.config.ts`의 `migrations.seed`**에 설정해야 `npx prisma db seed`가 인식함.
- **비대화형 환경에서 `prisma migrate dev` 불가**: "non-interactive" 에러 발생. enum 값 제거처럼 위험한 변경은 마이그레이션 SQL을 직접 작성(`prisma/migrations/<timestamp>_name/migration.sql`)하고 `prisma migrate deploy`로 적용해야 함.
- **OpenAI SDK 6.x Responses API**: `client.responses.create()`는 구조화 출력을 자동으로 파싱해주지 않는다(`response.output_parsed`가 채워지지 않음). `openai/helpers/zod`의 `zodTextFormat(schema, name)`으로 포맷을 만들고, `openai/lib/ResponsesParser`의 `parseResponse(response, sameParams)`를 직접 호출해야 `output_parsed`가 채워짐.
- **web_search 도구**: `{ type: "web_search", search_context_size: "low" }`로 지정하지 않으면 입력 토큰이 25,000+까지 치솟는다 (검색 결과 전체가 컨텍스트로 들어감). "low"로 낮춰도 여전히 비중 있는 비용 항목.
- **실측 OpenAI 가격** (2026-07-08 기준, `platform.openai.com/docs/pricing` 확인): gpt-5.4 입력 $2.50/출력 $15.00 (1M 토큰당), gpt-5.4-mini 입력 $0.75/출력 $4.50, web_search $10/1,000회. `src/lib/config/pricing.ts`에 반영해둠 — 가격은 계속 바뀌므로 주기적 재확인 필요.
- **KST 날짜 계산**: Vercel Cron은 UTC 기준이라 23:00 UTC = 08:00 KST(다음날)로 스케줄 걸어둠(`vercel.json`). `BriefingRun.runDate`는 반드시 KST 캘린더 날짜 기준으로 계산해야 하루 밀리는 버그가 안 생김 (`src/lib/date.ts`의 `getKstDateLabel`/`getKstDateAsUtcMidnight`).

---

## 5. 현재 비용 (실측)

- 5개 섹션(통합 후) 기준 1회 발송 실측: **$0.34~0.37**
- 매일 발송 가정 시 월 예상: **약 $10~11** (Phase 2 완료 직후 7개 섹션 기준이던 ~$15~17보다 더 낮아짐 — JOB_MARKET 제외 + SEMICONDUCTOR 통합 효과)
- 섹션별 대략적 비중: AI_NEWS(검색) > STOCK_MARKET(검색) > INTERVIEW > TECH_CONCEPT ≈ CODING_TEST

---

## 6. 현재 DB 상태 (Neon, 2026-07-08 기준)

- `TechTopicCatalog`: 27개 주제 시드 완료 (머신러닝/딥러닝/CV/LLM/MLOps/Embedded AI, 6개 카테고리)
- `TechTopicProgress`: `Fine-Tuning` 1개 항목, `currentLevel = BASIC`, `timesCovered = 1`
- 오늘(2026-07-08) `BriefingRun`: `status = SUCCESS`이지만 **DRY_RUN 테스트였고 실제 이메일은 발송 안 됨**. 오늘 다시 실제 발송 테스트를 하려면 이 run(및 연결된 `BriefingSection`/`EmailDeliveryLog`)을 지우고 재실행해야 함 — 지금까지 세션 중엔 `node -e` + `pg` Client로 직접 삭제하는 방식을 반복 사용함(스크립트 없음, 매번 즉석으로 실행).

---

## 7. 환경 상태

- `.env`는 계속 git에 커밋되지 않도록 유지됨 (`.gitignore` 확인됨, 세션 내내 안전하게 관리).
- `.env`의 `DRY_RUN`은 현재 **`true`**로 되돌려둔 안전 상태 (실수로 반복 발송 방지). 실제 발송 테스트하려면 `false`로 바꾸고 테스트 후 다시 `true`로 되돌리는 패턴을 계속 써왔음.
- `OPENAI_API_KEY`, `RESEND_API_KEY`, `DATABASE_URL`(Neon), `CRON_SECRET`, `RECIPIENT_EMAIL` 모두 설정 완료.
- Resend는 기본 `onboarding@resend.dev` 발신 주소 사용 중 (계정 소유자 본인 이메일로만 발송 가능한 제약 — 지금 단일 사용자 MVP엔 문제 없음).

---

## 8. 다음 단계 후보 (로드맵상 남은 것)

`docs/DESIGN.md` §12 로드맵 기준:

- **Phase 5: 신뢰성 강화** — 모듈 실패 시 재시도/fallback, Watchdog(크론이 조용히 실패하는 것 감지), 구조화 로깅, `DRY_RUN` 모드는 이미 있음.
- **Phase 3: 이메일 디자인 완성도** — **진행 중.** 아래 §10 참고.
- **Phase 6: 실사용 검증** — 2주 이상 실제 매일 수신 후 톤/분량 튜닝.

---

## 10. Phase 3: 이메일 디자인 (API 비용 없이 반복 작업하는 방법)

OpenAI를 매번 호출하지 않고 이메일 디자인만 반복 수정할 수 있도록 도구를 만들어뒀다.

- **Fixture**: `src/lib/email/fixtures/sample-briefing.json` — 실제 DB에 이미 저장돼 있던 완성된 5섹션 결과(2026-07-08, "Fine-Tuning" 주제)를 `composeBriefing()`으로 재조립해서 만든 진짜 데이터. 새 API 호출 없이 만들었음. 콘텐츠 스키마(타입)가 바뀌지 않는 한 계속 재사용 가능.
- **라이브 프리뷰**: `npm run email:dev` → `http://localhost:3001` (Next dev 서버와 포트 충돌 피하려고 3001 사용). `emails/DailyBriefing.tsx`가 `DailyBriefingEmail` 컴포넌트에 위 fixture를 먹여서 프리뷰한다. 코드 수정하면 핫리로드됨. 최초 실행 시 `@react-email/ui`를 설치할지 물어보는데(대화형 프롬프트), 이미 devDependency로 설치해둬서 다음부터는 안 물어봄.
- **PDF 추출**: `npm run email:pdf` → `exports/daily-briefing-preview.pdf` (Puppeteer로 실제 이메일 HTML을 그대로 렌더링해서 PDF화, 실제 발송되는 것과 동일한 템플릿/데이터 사용). `exports/`는 gitignore 처리됨 — 로컬 산출물이라 커밋 안 함. Puppeteer는 devDependency, 프로덕션(Vercel)에는 안 들어감.
- **다크모드**: `DailyBriefingEmail.tsx`에 `color-scheme`/`supported-color-schemes` 메타 + `@media (prefers-color-scheme: dark)` 스타일 블록 추가. `db-body`/`db-heading`/`db-card`/`db-card-title`/`db-field-text`/`db-muted` className을 각 컴포넌트에 훅으로 심어뒀다 (인라인 스타일만으로는 다크모드 오버라이드가 안 되기 때문 — 이메일 클라이언트는 미디어쿼리 기반 `<style>` 블록만 다크모드 대응이 가능).

**다음에 디자인을 더 손보려면**: `npm run email:dev` 켜놓고 `src/lib/email/templates/` 아래 파일들 수정하면서 브라우저에서 바로 확인하면 된다. 다크모드 실물 확인은 브라우저 프리뷰로는 안 되니(실제 이메일 클라이언트 다크모드 필요), 필요하면 실제 발송 1번으로 검증.

---

## 11. 재개 시 체크리스트

1. `git pull` 불필요 (이미 최신), `git log --oneline -5`로 상태 확인만.
2. `.env`의 `DRY_RUN=true` 확인(안전 상태 유지 중인지).
3. 오늘 날짜 기준 `BriefingRun`이 이미 있는지 확인 후 필요시 정리(§6 참고).
4. 이메일 디자인 계속하려면 `npm run email:dev`, 아니면 Phase 5나 사용자가 원하는 다른 작업 확인.
