# 📬 Daily Briefing — AI 데일리 브리핑 이메일 서비스

AI/CV/Embedded 엔지니어 취업을 준비하는 사용자를 위해, 매일 아침 **코딩테스트 문제·전공지식·예상 면접
질문·AI/임베디드 뉴스**를 LLM으로 생성해 이메일로 자동 발송하는 개인용 브리핑 서비스입니다.
AI 뉴스는 별도 서비스(DR_to_Insta)가 읽어가 한국어 인스타그램 카드뉴스로도 발행합니다.

단순히 뉴스를 모아 보내는 것이 아니라, 사용자의 커리어 목표에 맞춰 콘텐츠를 재해석·가공하고, 전공지식은
**BASIC → INTERMEDIATE → ADVANCED**로 난이도가 점진적으로 심화되도록 설계되어 있습니다.

> 설계 배경과 상세 아키텍처는 [`docs/DESIGN.md`](docs/DESIGN.md), 개발 진행 기록은
> [`docs/PROGRESS.md`](docs/PROGRESS.md), 기능·기술 요약은 [`docs/PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md)에
> 정리되어 있습니다.

---

## ✨ 주요 기능

- **매일 자동 발송**: Vercel Cron이 매일 08:00 KST에 파이프라인을 트리거합니다.
- **4개 개인화 섹션**
  - 🧩 코딩테스트 — 프로그래머스 문제 추천 (최근 30일 내 중복 없음)
  - 📚 전공지식 — ML/DL/CV/LLM/MLOps/Embedded 주제를 3단계 난이도로 점진 학습
  - 🎤 면접대비 — 전공지식 주제와 연계된 예상 면접 Q&A
  - 📰 AI/임베디드 뉴스 — 최근 24~48시간 내 업계 뉴스 6건, 출처·핵심 수치 포함 (웹 검색 기반)
  - ~~📈 미국 증시~~ — 일시 중지. 코드는 보존되어 있고 `src/lib/config/sections.ts`의
    `SECTION_ENABLED.STOCK_MARKET`을 `true`로 바꾸면 다시 켜집니다.
- **PDF 첨부**: 이메일과 동일한 내용을 PDF로도 함께 받아볼 수 있습니다.
- **실패해도 발송은 보장 (Fail-soft)**: 특정 섹션 생성이 실패해도 나머지 섹션은 정상 발송되고,
  실패한 섹션은 플레이스홀더로 대체됩니다.
- **중복 방지 + 학습 이력 관리**: 코딩테스트 문제/전공 주제/면접 질문이 최근 발송 이력과 겹치지 않도록
  PostgreSQL에 이력을 기록하고 조회합니다.
- **크론 모니터링(Watchdog)**: GitHub Actions가 매일 발송 여부를 확인하고, 발송에 실패하면 저장소
  소유자에게 자동으로 알림 메일을 보냅니다.

---

## 🛠 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| DB / ORM | PostgreSQL, Prisma 7 |
| LLM | OpenAI Responses API (`web_search` 도구 포함), Zod 구조화 출력 검증 |
| 이메일 | React Email, Resend |
| PDF | Puppeteer (로컬) / puppeteer-core + @sparticuz/chromium (서버리스) |
| 배포 | Vercel (Cron + 서버리스 함수) |
| 모니터링 | GitHub Actions Watchdog |

---

## 🚀 시작하기

### 1. 준비물

아래 서비스들의 계정과 키가 필요합니다. 전부 무료 티어로 시작할 수 있습니다.

| 항목 | 용도 | 발급처 |
|---|---|---|
| PostgreSQL 데이터베이스 | 실행 이력/중복 방지 데이터 저장 | [Neon](https://neon.tech) 등 |
| OpenAI API 키 | 브리핑 콘텐츠 생성 | [platform.openai.com](https://platform.openai.com) |
| Resend API 키 | 이메일 발송 | [resend.com](https://resend.com) |

### 2. 저장소 클론 및 설치

```bash
git clone <이 저장소 URL>
cd <클론된 폴더>
npm install
```

### 3. 환경변수 설정

`.env.example`을 복사해 `.env` 파일을 만들고 실제 값을 채워 넣습니다. **`.env`는 절대 커밋하지 마세요.**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
CRON_SECRET="generate-a-long-random-string-here"   # 32자 이상의 임의 문자열 권장
RECIPIENT_EMAIL="you@example.com"                  # 브리핑을 받을 이메일 주소
DRY_RUN="true"                                     # true면 실제 발송 없이 생성만 테스트
```

> `CRON_SECRET`은 아래처럼 생성할 수 있습니다.
> ```bash
> openssl rand -hex 32
> ```

### 4. 데이터베이스 준비

```bash
npx prisma migrate deploy   # 스키마 적용
npx prisma db seed          # 전공지식 주제 카탈로그(27개) 시딩
```

### 5. 로컬에서 실행

```bash
npm run dev
```

브라우저에서 아래 엔드포인트를 직접 호출해 파이프라인을 테스트할 수 있습니다(`CRON_SECRET` 필요).

```bash
curl -X POST http://localhost:3000/api/cron/daily-briefing \
  -H "Authorization: Bearer <CRON_SECRET 값>"
```

`DRY_RUN="true"`이면 콘텐츠 생성과 DB 기록까지만 수행하고 실제 메일은 보내지 않습니다. 정상 동작을
확인했다면 `DRY_RUN="false"`로 바꾸고 다시 호출해 실제 발송을 테스트하세요.

### 6. 이메일 디자인 미리보기 (OpenAI 비용 없이)

실제 API를 호출하지 않고, 저장된 샘플 데이터로 이메일 템플릿만 반복 수정/확인할 수 있습니다.

```bash
npm run email:dev   # http://localhost:3001 에서 실시간 미리보기 (핫리로드)
npm run email:pdf   # exports/daily-briefing-preview.pdf 로 PDF 생성
```

---

## ☁️ Vercel 배포

1. 이 저장소를 GitHub에 올리고 [Vercel](https://vercel.com)에서 Import 합니다.
2. Vercel 프로젝트의 **Environment Variables**에 `.env`와 동일한 키(`DATABASE_URL`,
   `OPENAI_API_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, `RECIPIENT_EMAIL`, `DRY_RUN`)를 등록합니다.
   - 로컬에서 쓰던 값을 그대로 쓰지 말고, 프로덕션용 `CRON_SECRET`은 새로 생성하는 것을 권장합니다.
   - 처음 배포할 때는 안전하게 `DRY_RUN="true"`로 시작해, `/api/health`와 크론 엔드포인트가
     정상 동작하는지 먼저 확인한 뒤 `false`로 전환하세요.
3. 배포가 완료되면 `vercel.json`에 정의된 크론(`0 23 * * *`, UTC 기준 = 매일 08:00 KST)이 자동으로
   등록됩니다.
4. `/api/health`로 배포 상태와 마지막 성공 발송일을 확인할 수 있습니다.

```bash
curl https://<배포된 도메인>/api/health
```

### 크론 모니터링(Watchdog) 활성화

저장소의 **Settings → Secrets and variables → Actions**에 `SITE_URL` 시크릿을 배포된 도메인으로
등록하면, `.github/workflows/watchdog.yml`이 매일 발송 30분 뒤 자동으로 발송 여부를 확인합니다.
발송에 실패하면 워크플로우가 실패 처리되고, GitHub이 저장소 소유자에게 자동으로 알림 메일을 보냅니다.

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/cron/daily-briefing/  # 크론이 호출하는 메인 파이프라인 엔드포인트
│   └── api/health/                # 상태 확인용 엔드포인트 (Watchdog이 폴링)
├── lib/
│   ├── modules/                   # 섹션별 콘텐츠 생성 모듈 (코딩테스트/전공지식/면접/뉴스/증시)
│   ├── orchestrator/               # 모듈 실행 순서/재시도/조립(Composer)
│   ├── openai/                     # OpenAI 호출 래퍼 + 섹션별 Zod 스키마
│   ├── email/                      # React Email 템플릿 + 발송(Resend)
│   ├── pdf/                        # 이메일과 동일한 내용을 PDF로 렌더링
│   ├── dedup/                      # 중복 방지 / 학습 진도 조회 로직
│   └── config/                     # 사용자 프로필(Persona), 전공지식 카탈로그
├── types/                          # 공용 타입 (BriefingJSON 등)
prisma/
├── schema.prisma                   # DB 스키마
└── seed.ts                         # 전공지식 카탈로그 초기 데이터
docs/
├── DESIGN.md                       # 설계 문서 (PRD, 아키텍처, DB 설계 등)
├── PROGRESS.md                     # 개발 진행 기록
└── PROJECT_SUMMARY.md              # 기능/기술 요약
```

---

## 💸 예상 비용

- OpenAI: 1회 발송(5개 섹션 기준) 실측 약 $0.34~0.37, 매일 발송 시 월 약 $10~11
- Resend / Vercel / PostgreSQL(Neon): 개인 사용 트래픽 기준 무료 티어로 충분

실제 비용은 `BriefingSection` 테이블의 `costUsd` 컬럼에 실행마다 기록되므로, DB를 조회해 직접
확인할 수 있습니다.

---

## ⚠️ 주의사항

- 이 프로젝트는 **단일 사용자(개인용) MVP**로 설계되었습니다. 로그인/회원가입, 다중 사용자 지원은
  포함되어 있지 않습니다.
- `RECIPIENT_EMAIL`에 지정한 주소로만 발송되며, Resend 기본 발신 도메인(`onboarding@resend.dev`)
  사용 시에는 계정 소유자 본인 이메일로만 발송 가능한 제약이 있습니다(도메인 인증 시 해제 가능).
- `.env` 파일과 API 키는 절대 커밋하지 마세요. 이 저장소를 포크/클론해 사용할 경우 반드시 본인의
  키로 교체해야 합니다.

---

## 📄 라이선스

개인 프로젝트로 별도 명시가 없는 한 자유롭게 참고/포크하여 사용하셔도 됩니다.
