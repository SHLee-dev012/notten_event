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

## 개발

```bash
npm install
npm run db:migrate   # 마이그레이션 적용 + 클라이언트 생성
npm run db:seed      # 데모 축제 이벤트 시드
```

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
| 참여자 | 3000 | `/` 목록, `/events/[id]` 상세·참여, `/schedule`, `/my` |
| 주최자 | 3001 | `/organizing`, `/events/new`, `/events/[id]/participants` |
| 공용 | 양쪽 | `/login`, `/signup`, `/api/auth/*`, `/api/events` (GET) |

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