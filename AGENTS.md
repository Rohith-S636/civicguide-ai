# CivicGuide AI — Production Engineering Instructions

## Project Goal

CivicGuide AI is a civic-information application. The goal is to make this repository genuinely production-ready, reliable, secure, testable, maintainable, and safe for real users.

Do not optimize for merely making CI green. Fix the underlying architecture and runtime behavior.

## Critical rules

1. NEVER invent civic, election, government, legal, or public-service information.
2. NEVER silently return mock/demo data in production.
3. NEVER trust a user_id supplied by the frontend when authenticated identity is available.
4. NEVER expose Supabase service-role credentials to the frontend.
5. NEVER commit real secrets.
6. NEVER weaken security checks just to make tests pass.
7. NEVER use `|| true` to suppress mandatory CI failures.
8. NEVER delete functionality simply because it is difficult to fix.
9. Preserve existing working functionality unless it conflicts with production requirements.
10. Prefer small, testable changes over large rewrites.
11. Before modifying an API, inspect both frontend callers and backend routes.
12. After changing an API contract, add or update integration/contract tests.
13. Do not claim a feature is production-ready unless it has a corresponding test or verification.
14. Do not mark a task complete if only the documentation was changed.
15. Do not introduce duplicate implementations such as *_new.py.

## Production requirements

The final system must have:

- consistent frontend/backend API contracts
- verified authentication
- secure user identity handling
- Supabase integration that fails explicitly
- no production mock fallback
- proper Supabase RLS
- real leaderboard implementation
- authoritative civic/election data
- data freshness/provenance
- comprehensive backend tests
- frontend/backend integration tests
- enforced lint/type/security checks
- deterministic deployment
- meaningful health checks
- structured logging
- production error handling
- no placeholder example.com assets
- no stale deployment-readiness claims
- consistent AI provider architecture
- no unnecessary duplicate application implementations

## Development methodology

For every task:

1. Inspect the relevant files.
2. Explain the root cause internally before changing code.
3. Make the smallest robust implementation.
4. Add/update tests.
5. Run relevant tests.
6. Run lint/type/security checks where applicable.
7. Check for regressions.
8. Review the git diff.
9. Only then mark the task complete.

## Never do this

Do not:
- hardcode production secrets
- hardcode current election results/dates without authoritative provenance
- use fake civic information
- bypass authentication
- disable RLS
- suppress failing tests
- remove security tooling
- blindly upgrade every dependency
- rewrite the whole project unnecessarily
- change API routes without checking frontend callers

## Definition of done

A task is DONE only when:

- implementation is complete
- tests exist
- tests pass
- affected callers work
- no obvious security regression exists
- no stale duplicate implementation remains
- documentation/configuration is updated when necessary
