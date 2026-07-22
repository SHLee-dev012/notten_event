# notten

오프라인 축제 참석자를 위한 이벤트 서비스. 축제 이벤트를 **조회**하고, **안내**받고, **참여**할 수 있습니다.

## 기능

- **계정** — 회원가입 / 로그인 / 로그아웃 (내장 crypto scrypt 해시 + DB 세션 쿠키)
- **이벤트 조회** — 카테고리 필터가 있는 목록, 이벤트 상세 페이지
- **안내** — 시간순 타임테이블 뷰 (`/schedule`)
- **참여** — 로그인 후 이벤트 참여/취소, 정원(capacity) 초과 방지
- **내 참여** — 내가 신청한 이벤트 모아보기 (`/my`)

## 기술 스택

- Next.js 16 (App Router) / React 19
- Prisma 7 + better-sqlite3 (SQLite, `dev.db`)
- Tailwind CSS 4 / TypeScript

## 실행 방법

**요구 사항**: Node.js 20 이상, npm.

```bash
# 1) 저장소 클론
git clone git@github.com:SHLee-dev012/notten_event.git
cd notten_event

# 2) 의존성 설치 (postinstall이 Prisma 클라이언트도 생성)
npm install

# 3) 환경변수 파일 생성 (.env는 커밋되지 않음)
echo 'DATABASE_URL="file:./dev.db"' > .env

# 4) 데이터베이스 준비
npm run db:migrate   # 마이그레이션 적용 + Prisma 클라이언트 생성
npm run db:seed      # 데모 축제 이벤트 + 계정 시드

# 5) 개발 서버 실행 (참여자 3000 + 주최자 3001 동시)
npm run dev:all
```

실행 후 브라우저에서 접속합니다:

- 참여자 서비스 → http://localhost:3000
- 주최자 서비스 → http://localhost:3001 (관리자 `tenadmin` / `admin1234`)

> `dev:seed`로 만든 계정과 데모 이벤트로 바로 로그인·참여를 확인할 수 있습니다.
> 데이터를 초기화하려면 `npm run db:seed`를 다시 실행하세요 (기존 데이터를 비우고 다시 채웁니다).

### 프로덕션 빌드 / 실행

역할별로 각각 빌드한 뒤 실행합니다 (서로 다른 `distDir` 사용).

```bash
npm run build:participant && npm run start:participant   # → http://localhost:3000
npm run build:organizer   && npm run start:organizer     # → http://localhost:3001
```

## 개발

### 서비스 분리 (포트별 역할)

참여자 서비스와 주최자 서비스는 **같은 코드베이스**를 다른 포트로 실행해 분리합니다.
DB·인증·세션은 공유합니다 (쿠키는 포트가 아닌 호스트 기준).

```bash
npm run dev:all           # 두 서비스 동시 실행 (아래를 한 번에)
npm run dev:participant   # 참여자 서비스 → http://localhost:3000
npm run dev:organizer     # 주최자 서비스 → http://localhost:3001
```

`dev:all`은 `concurrently`로 두 서버를 함께 띄우며(라벨 `[participant]`/`[organizer]`),
한쪽이 종료되거나 Ctrl+C 시 둘 다 함께 종료됩니다.

- 역할은 **요청 포트**로 판별합니다 (`src/lib/role.ts`): 3001 → organizer, 그 외 → participant.
- `src/proxy.ts`가 각 포트에서 해당 역할의 라우트만 허용하고, 반대 도메인 라우트는 리다이렉트/404 처리합니다.
- 두 `next dev`를 동시에 띄우기 위해 역할별 `distDir`(`.next-participant` / `.next-organizer`)를 사용합니다.

| 서비스 | 포트 | 라우트 |
|--------|------|--------|
| 참여자 | 3000 | `/` 목록, `/events/[id]` 상세·참여, `/schedule`, `/my`, `/signup`(회원가입) |
| 주최자 | 3001 | `/organizing`, `/dashboard`, `/events/new`, `/events/[id]/participants` · `/edit` |
| 공용 | 양쪽 | `/login`, `/api/auth/*`, `/api/events` (GET) |

### 계정

- **참여자**: 이메일로 자유롭게 **회원가입** 후 로그인 (참여하려면 로그인 필요).
- **주최자**: 고정 관리자 계정 하나만 존재하며 **회원가입이 없습니다**.
  - ID `tenadmin` / PW `admin1234` (시드로 생성, 모든 데모 이벤트의 주최자).
  - 주최자 서비스(3001)는 이 관리자 계정으로만 로그인·접근할 수 있습니다.

## 데이터 모델

- **User** — 계정 (email, name, passwordHash)
- **Session** — httpOnly 쿠키에 저장되는 DB 세션
- **Event** — 축제 이벤트 (title, description, category, location, startAt/endAt, capacity)
- **Participation** — 사용자 × 이벤트 참여 (unique)

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 + 세션 시작 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/events` | 이벤트 목록 (`?category=` 필터) |
| POST | `/api/events` | 이벤트 생성 (로그인 필요) |
| GET | `/api/events/:id` | 이벤트 상세 |
| POST/DELETE | `/api/events/:id/participate` | 참여 / 취소 |