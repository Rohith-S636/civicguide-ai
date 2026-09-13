# PRODUCTION_BASELINE

## Scope
Inspection-only baseline across:
- `/backend`
- `/frontend`
- root `/app`
- `/database/schema.sql`
- `/.github/workflows`
- deployment/env/docs

No application code fixes were made in this phase.

## Architecture (as implemented)
- **Frontend runtime**: Next.js app in `/frontend`.
- **Frontend API client**: `/frontend/lib/api.ts` and direct axios/fetch calls in pages/components.
- **Backend API**: FastAPI app in `/backend/main.py`, routers under `/backend/routers`.
- **Services/agents**: `/backend/agents/*` and `/backend/utils/*`.
- **Database layer**: Supabase via `/backend/utils/supabase.py`; schema in `/database/schema.sql`.
- **External providers**: Google Gemini (`utils/gemini.py`), Tavily (`routers/news.py`), Anthropic wrapper (`utils/claude.py`).

## Dependency map

### Implemented flow (actual)
1. `frontend/app/[locale]/community/news/page.tsx`
   -> `frontend/lib/api.ts` (`api.news.getLatest`)
   -> `GET /api/news/latest`
   -> `backend/routers/news.py:get_latest_news_alias`
   -> `fetch_and_summarize_eci_news()`
   -> Tavily + Anthropic wrapper OR fallback mock payload.

2. `frontend/app/[locale]/quiz/page.tsx` (direct axios)
   -> `GET /api/quiz/generate?difficulty&category&language&count`
   -> `backend/routers/quiz.py:generate_quiz_endpoint`
   -> `QuizAgent.generate_questions(...)`
   -> Gemini or fallback static bank.

3. `frontend/components/GeminiCreditStatus.tsx`
   -> `GET /api/credit-status`
   -> `backend/main.py:api_credit_status`
   -> `utils/gemini.get_credit_status()` (local file-based counter in `/tmp`).

4. User/profile and gamification calls are mostly not wired from active frontend pages; backend expects direct `user_id` input.

## Frontend/backend contract mismatches

| # | Frontend caller | Expected API contract | Backend implementation | Severity |
|---|---|---|---|---|
| C1 | `frontend/lib/api.ts:134` | `POST /api/chat/message` | No such route. Only `POST /api/chat/` (`backend/routers/chat.py:16`) | P0 |
| C2 | `frontend/lib/api.ts:135` | `GET /api/chat/history` | No such route | P0 |
| C3 | `frontend/lib/api.ts:141` | `POST /api/quiz/generate` JSON body | Backend uses `GET /api/quiz/generate` query params (`backend/routers/quiz.py:12`) | P0 |
| C4 | `frontend/lib/api.ts:143` | `POST /api/quiz/answer` | No such route; backend has `POST /api/quiz/submit` with query params (`backend/routers/quiz.py:52`) | P0 |
| C5 | `frontend/lib/api.ts:150` | `GET /api/news/search` | No such route in `backend/routers/news.py` | P0 |
| C6 | `frontend/lib/api.ts:155` | `GET /api/users/profile` without query | Backend requires `user_id` query (`backend/routers/users.py:59`) | P0 |
| C7 | `frontend/lib/api.ts:156` | `PUT /api/users/profile` body only | Backend requires `user_id` query (`backend/routers/users.py:93`) | P0 |
| C8 | `frontend/lib/api.ts:162` | `GET /api/forms/forms` | Backend provides `GET /api/forms/` (`backend/routers/forms.py:532`) | P1 |
| C9 | `frontend/lib/api.ts:163` | `GET /api/forms/process/{id}` | Backend provides `GET /api/forms/{form_id}` (`backend/routers/forms.py:553`) | P1 |
| C10 | `frontend/app/[locale]/quiz/page.tsx:233-235` | sends `category` | Backend expects `topic`; category ignored | P1 |
| C11 | `frontend/app/[locale]/community/news/page.tsx:59` | expects `{articles}` or `{data}` | Backend returns raw list (`news.py:627`) | P1 |

## Findings (issues)

| ID | File | Line / function | Root cause | Severity | Recommended fix | Test required |
|---|---|---|---|---|---|---|
| F1 | `backend/routers/users.py` | `get_profile`, `update_profile` (`59, 93`) | Auth identity not enforced; API trusts `user_id` query string. | P0 | Add authenticated dependency, derive user id from token/session, remove user_id query for self endpoints. | Backend auth integration tests: user cannot read/update another user profile. |
| F2 | `backend/routers/quiz.py` | `submit_quiz_score` (`52-60`) | User identity accepted from query param; no auth checks. | P0 | Require auth and server-derived user id. | Contract + auth tests for quiz submission ownership. |
| F3 | `backend/routers/gamification.py` | request models include `user_id` (`24, 43`) and public routes (`225+`) | Gamification state is client-asserted identity with no auth enforcement. | P0 | Add auth dependency, remove client-controlled identity fields for self actions. | API authorization tests for each gamification route. |
| F4 | `backend/utils/supabase.py` | `_init_client` (`16-18`) | Uses `SUPABASE_KEY`, but env/docs use `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_KEY`; client fails and silently falls back to mock. | P0 | Align env names, fail fast when DB config invalid, remove silent mock path in production. | Unit tests for env handling + integration test with real Supabase client init. |
| F5 | `backend/utils/supabase.py` | `get_user_progress` (`29-37`), `upsert_user_progress` (`54-55`) | Silent mock fallback returns fake progress data in production path. | P0 | Replace with explicit failure; gate any fallback to dev/test only and visible. | Tests asserting production mode throws on missing DB config. |
| F6 | `backend/utils/gemini.py` vs `backend/main.py` | key lookup `GOOGLE_GEMINI_API_KEY` (`168`) vs required `GOOGLE_API_KEY` (`main.py:24`) | Provider env contract mismatch; runtime degrades unexpectedly. | P0 | Standardize one key name and validate at startup for all Gemini call paths. | Startup config tests + e2e chat/quiz provider smoke tests. |
| F7 | `backend/main.py` | `/api/elections` (`136-173`) | Hardcoded election schedule values presented as authoritative data. | P0 | Replace with authoritative data pipeline + provenance metadata + freshness checks. | Data contract tests verifying source/provenance fields and staleness behavior. |
| F8 | `backend/routers/news.py` | fallback block (`391-495`, `550`) | Generates mock news when provider unavailable; no explicit failure mode. | P0 | Return explicit degraded/error state instead of synthetic news in production. | Tests for provider outage behavior (no fabricated content). |
| F9 | `backend/routers/gamification.py` | in-memory stores (`80-84`) | Leaderboard/profile uses process-local mock state, not durable DB. | P0 | Move gamification persistence to Supabase with RLS-aware queries. | Integration tests for leaderboard persistence across process restart. |
| F10 | `frontend/lib/api.ts` + backend routers | multiple routes (`134-163`) | Frontend API map diverges from backend route set and schemas. | P0 | Define single OpenAPI contract and generate/validate frontend client from it. | Contract tests (consumer-driven) covering each route. |
| F11 | `backend/routers/forms.py` | route order (`553` before `566/600/...`) | Dynamic route `/{form_id}` declared before static subpaths can shadow expected static endpoints. | P1 | Reorder routes so static paths are declared before dynamic path. | Router tests for `/search`, `/categories/*`, `/guide/*`. |
| F12 | `frontend/app/[locale]/chat/page.tsx` | `handleSendMessage` (`53-63`) | Chat UI is simulated and not connected to backend; production feature gap. | P1 | Wire chat UI to backend streaming/non-stream API with robust error states. | Frontend integration tests with mocked backend and e2e chat flow tests. |
| F13 | `frontend/app/[locale]/dashboard/page.tsx` | `mockElections/mockNews/mockNotifications` (`31-88`) | Dashboard renders hardcoded civic/news data. | P1 | Replace with live backend-driven data with provenance + stale indicators. | UI integration tests for loading/error/real-data states. |
| F14 | `frontend/app/[locale]/profile/page.tsx` | hardcoded stats (`54-88`) | Profile and achievements are static values, not user data. | P1 | Bind to authenticated user profile and progress APIs. | Frontend integration tests for authenticated profile rendering. |
| F15 | `frontend/lib/api.ts` | token storage (`25-42`) | Auth token persisted in localStorage/sessionStorage; no verified backend JWT validation path. | P1 | Move to secure cookie-based auth with backend verification and rotation. | Security tests for token theft/XSS impact and auth middleware tests. |
| F16 | `.github/workflows/backend.yml` | lint/type/security steps (`44,49,86,89`) | Mandatory checks are bypassed via `|| true`; CI cannot enforce quality/security. | P1 | Remove suppression and enforce failing checks; tune rules instead of bypassing. | CI policy tests (required checks must fail pipeline on violations). |
| F17 | `.github/workflows/frontend.yml` | security steps (`81,87,88`) | `npm audit` and `snyk` failures are ignored. | P1 | Enforce vulnerability thresholds and fail on high/critical findings. | CI security gate tests using known vulnerable fixture. |
| F18 | `.github/workflows/backend.yml` | `pytest backend/tests/` (`53`) | References test directory that does not exist in repo. | P1 | Add backend test suite and align workflow path. | Unit + integration tests for routers/services. |
| F19 | repository-wide | no backend/frontend test files found | Missing comprehensive automated tests and no frontend/backend integration tests. | P1 | Add backend unit/integration tests and frontend integration/e2e contract tests. | Full test matrix by domain (auth, API contracts, civic data integrity). |
| F20 | `backend/models/schemas.py` | duplicate class definitions (`46` vs `131`, `96` vs `159`, `110` vs `169`) | Re-declared models in same file cause ambiguity and schema drift risk. | P1 | Deduplicate schema models and keep single source of truth. | Unit tests validating schema serialization/deserialization contracts. |
| F21 | `backend/routers/chat.py` | endpoint returns `StreamingResponse` with `response_model=ChatResponse` (`16,41`) | Declared response schema mismatches actual SSE stream payload type. | P1 | Separate streaming and JSON endpoints with correct response models/content-types. | API tests validating headers and payload format for each endpoint type. |
| F22 | `backend/agents/*_new.py`, `backend/routers/chat_new.py`, root `/app` | duplicate implementations not wired (`main.py` imports `chat`, not `chat_new`) | Multiple parallel implementations increase drift/dead-code risk. | P1 | Consolidate to one active implementation per capability and remove/archived unused paths. | Build + static analysis checks ensuring no orphaned route modules. |
| F23 | `frontend/.env.example` | includes concrete Supabase project URL (`3`) | Environment example includes project-specific endpoint; configuration hygiene risk. | P2 | Replace with neutral placeholders only. | Config lint check for non-placeholder env examples. |
| F24 | `backend/routers/news.py` | blog images use `example.com` (`139,160,...,370`) | Placeholder assets in production content path. | P2 | Replace with valid, owned assets or omit image until available. | Content integrity test verifying no placeholder URLs in API payloads. |
| F25 | `DEPLOYMENT_STATUS.md`, `DEPLOYMENT_CHECKLIST.md`, docs deployment files | production-ready claims conflict with actual code/workflows/tests | Documentation is stale/incorrect against implementation reality. | P2 | Regenerate deployment-readiness docs from verified checks only. | Docs verification checklist tied to executable repo checks. |

## P0 blockers (must resolve before production)
- Identity/auth not enforced; user_id is client-controlled (F1-F3).
- Supabase and Gemini configuration mismatches cause silent fallback or degraded behavior (F4-F6).
- Mock/fabricated civic/news/election data served from production paths (F7-F9).
- Core frontend/backend contract mismatch across chat/quiz/news/users/forms (F10).

## P1 high-priority risks
- Route ordering and schema inconsistencies (F11, F20, F21).
- Major features still static/mocked in frontend (F12-F14).
- Security and CI quality gates not enforceable due `|| true` and missing tests (F15-F19).
- Duplicate implementations/dead code paths increasing maintenance and release risk (F22).

## P2 medium-priority issues
- Configuration and content hygiene issues (F23-F24).
- Stale deployment/readiness documentation (F25).

## Test gaps
1. **Authentication/authorization tests**: No tests proving ownership checks on user/profile/quiz/gamification APIs.
2. **API contract tests**: No automated validation between frontend client contracts and backend OpenAPI.
3. **Data integrity tests**: No tests for authoritative civic data source, freshness, or provenance.
4. **Supabase integration tests**: No tests ensuring DB configuration failure is explicit and no mock fallback leaks to prod.
5. **Frontend integration/e2e tests**: No tests covering chat/quiz/news/profile with real backend contracts.
6. **Security tests**: No automated checks for token handling, CSRF behavior, or RLS policy expectations.
7. **CI self-tests**: No protections ensuring workflow checks cannot be bypassed.

## Deployment risks
- CI/CD currently allows lint/type/security failures to pass, so unsafe code can deploy.
- Backend test job points to non-existent tests, reducing confidence in runtime behavior.
- Health checks are configuration-presence checks, not true dependency checks.
- Production docs claim readiness that is not supported by current implementation.
- Duplicate codepaths (`*_new.py`, root `/app`) increase risk of deploying/maintaining the wrong implementation.

