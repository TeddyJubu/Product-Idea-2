# Rules of the Road

## Product Rules
1) **Calm by default** — capture in seconds, never overwhelm.
2) **Evidence moves Confidence** — validation tasks must inform score changes.
3) **Kill fast, celebrate archives** — validated “no” is a win.
4) **One source of truth** — ideas, tasks, evidence in one place.
5) **Accessible & fast** — mobile-usable, keyboard-first, WCAG AA.

## Engineering Rules
1) **Type everything** (TS strict, zod at API boundary).
2) **Pure server logic** — ICE computed on server (Prisma middleware or API).
3) **Secure by workspace** — every query filters by `workspaceId`.
4) **No hidden complexity** — prefer simple REST handlers; small functions.
5) **Observability** — log key activities; errors go to Sentry (later).
6) **Tests first where logic exists** — scoring, transitions, validators.
7) **Performance budgets** — TTFB < 200ms (p95), LCP < 2.5s.
8) **Migrations are immutable** — never edit old SQL; add new.

## Code Style
- Feature folders, small components, no god files.
- `lib/validators.ts` for inputs; keep route handlers skinny.
- UI via shadcn; use `cn()` utility; avoid bespoke CSS.
