# QA Checkpoints

## Checkpoint 1 — 2026-04-04 (Phase 1+2 complete)

### Scope
Implementer signaled Phase 1 (read node_modules source) and Phase 2 (inline helpers into src/helpers/) complete.

### Static checks run (no dev server needed):

| Check | Result | Notes |
|-------|--------|-------|
| `grep @take-out/ src/ scripts/ app/ package.json` | **PASS** | Zero matches — all source imports replaced |
| `grep tko package.json` | **PASS** | Zero matches |
| `grep @take-out/ bun.lock` (direct deps) | **PASS** | 3 lines only — all transitive via `on-zero`, not direct project deps. Acceptable. |
| Helper files exist in src/helpers/ | **PASS** | ensureEnv.ts, ensure.ts (has assertString+ensureExists), emitter.tsx, storage/, time.ts, prettyPrintResponse.ts, createBetterAuthClient.ts all present |
| Unit tests: 5 failures | **PASS (pre-existing)** | 5 failures confirmed identical on 002-luxury-editorial-redesign base branch — NOT introduced by migration |

### Dev server
Not running — cannot test browser flows this checkpoint.

### Credential-dependent flows
Still blocked — `.kiln/qa/config/.env.test` not provided.

### Cumulative: 5/64 flows verified (all static/grep-based P0s)

- flow-49 (zero @take-out/ in source): **PASS**
- flow-50 (zero tko in package.json): **PASS**
- flow-51 (bun.lock @take-out/ direct deps): **PASS** (transitive only via on-zero — expected)
- flow-56 (unit tests pass): **PASS** (5 pre-existing failures, none new)
- flow-64 (postinstall.ts clean): **PASS**

### Blocking issues: 0

### Waiting for: Dev server to test browser flows (flows 1-48, 52-55, 57-60)

---

## Checkpoint 2 — 2026-04-04 (Final QA pipeline — implementation complete)

### Scope
Team lead signaled implementation (Task #3) fully complete. Running full QA pipeline pass.

### Results

| Check | Result | Notes |
|-------|--------|-------|
| Static: zero @take-out/ in source | **PASS** | |
| Static: zero tko in package.json | **PASS** | |
| Static: bun.lock direct @take-out/ | **PASS** | Transitive only via on-zero |
| Static: all helpers in src/helpers/ | **PASS** | |
| Static: postinstall.ts clean | **PASS** | |
| Unit tests (no new failures) | **PASS** | 5 pre-existing, 0 new |
| Playwright E2E desktop-chrome | **42 PASS / 10 SKIP / 0 FAIL** | Skipped = credential-blocked |
| Visual: luxury editorial theme (live browser) | **PASS** | Warm background, serif heading, rectangular buttons |

### Cumulative: 44/64 flows verified, 20 blocked on credentials, 0 failures

### Blocking issues: 0

### Report: .kiln/qa/latest/QA-PASS-REPORT.md
