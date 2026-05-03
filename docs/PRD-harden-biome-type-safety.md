# PRD: Harden Biome Rules & Enforce Type Safety

**Status:** Approved
**Created:** 2026-05-03
**Last Updated:** 2026-05-03
**Author:** AI Agent
**Version:** 2.0

---

## Executive Summary

Harden the biome linter configuration and TypeScript compiler settings to enforce strict type safety, catch correctness bugs, and eliminate the "anything goes" culture the current config enables. This turns biome from a glorified formatter into an actual quality gate. The scope includes fixing all pre-existing lint violations and TypeScript errors (including missing DOM/Chrome type definitions) across all packages.

---

## Problem Statement

**Current biome.jsonc state (audited 2026-05-03):**

Most correctness rules are **already enabled** as `"error"`: `noUnusedVariables`, `noUnusedImports`, `noUnusedFunctionParameters`, `noExplicitAny`, `noNonNullAssertion`, `noConfusingVoidType`, `noAssignInExpressions`, `noImplicitAnyLet`, `noConsole`. However, **six rules are still missing**:

| Category | Missing Rule | Impact |
|----------|-------------|--------|
| correctness | `noUnusedPrivateClassMembers` | Dead private class members go undetected |
| suspicious | `noRedeclare` | Redeclared identifiers silently overwrite |
| suspicious | `noEmptyInterface` | Empty interfaces provide no value |
| suspicious | `noUnsafeDeclarationMerging` | Unsafe declaration merging causes runtime bugs |
| style | `noVar` | `var` leaks scope, `let`/`const` preferred |
| style | `useUnknownInCatchVariables` | Catch blocks default to `any`, defeating type safety |

**Current tsconfig.json state:**

`noUnusedLocals: false` and `noUnusedParameters: false` allow dead code to accumulate silently.

**Pre-existing TypeScript errors (200+):**

The root `tsconfig.json` lacks `"DOM"` in `lib`, causing 150+ errors in `chrome-extension` domain/infrastructure/popup code that uses `document`, `Element`, `HTMLElement`, etc. The `pi-extension` tests also reference DOM globals despite having `types: ["node"]` only. Additionally, `chrome` namespace errors appear when type-checking from the root config.

**Violation counts (before fixes):**

- **Biome lint**: 29 errors (mostly unused vars/imports in `__tests__/`, 1 unused param in production `background-service.ts`, 1 unused type param in `protocol/protocol.ts`)
- **TypeScript (root)**: 200+ errors (DOM types, `chrome` namespace, `possibly undefined` in tests, implicit `any` in callbacks)

The quality gateway is a placebo — it catches nothing until these gaps are closed.

---

## Goals

- **Goal 1:** All biome correctness rules must be ON by default — no exceptions
- **Goal 2:** Enforce strict type safety in production code (no `any`, no `!`, no implicit any)
- **Goal 3:** TypeScript `noUnusedLocals` and `noUnusedParameters` must be `true`
- **Goal 4:** CI fails on any violation — no warnings allowed
- **Goal 5:** Fix all pre-existing TypeScript errors (DOM types, Chrome types, implicit any)
- **Goal 6:** Zero lint errors, zero type errors, all tests passing — one-shot fix

---

## Non-Goals

- **Non-Goal 1:** Refactoring application logic — only lint/type fixes to satisfy rules
- **Non-Goal 2:** Adding new features or changing behavior
- **Non-Goal 3:** Renaming files or restructuring directories
- **Non-Goal 4:** Hardening test files beyond what's reasonable (tests keep targeted relaxations)
- **Non-Goal 5:** Enabling `noFloatingPromises` (nursery/unstable in Biome v2)
- **Non-Goal 6:** Adding mutation testing thresholds to CI

---

## User Stories

### Must Have (P0)

- As a developer, I want biome to catch `any` usage in production code so that type safety is guaranteed
- As a reviewer, I want CI to fail on unused imports/variables so that dead code doesn't accumulate
- As a maintainer, I want biome to flag `!` non-null assertions so that we use proper type narrowing instead
- As a developer, I want each package to type-check independently so that type errors are caught per-package

### Should Have (P1)

- As a developer, I want biome to enforce `useUnknownInCatchVariables` so that catch blocks are type-safe
- As a reviewer, I want biome to catch confusing `void` usage so that API contracts are clear

---

## Functional Requirements

### FR-1: Enable Missing Correctness Rules

- ~~`noUnusedVariables` must be `"error"`~~ — **Already enabled** ✅
- ~~`noUnusedImports` must be `"error"`~~ — **Already enabled** ✅
- ~~`noUnusedFunctionParameters` must be `"error"`~~ — **Already enabled** ✅
- `noUnusedPrivateClassMembers` must be `"error"` (new)

### FR-2: Enable Missing Type-Safety Rules

- ~~`noExplicitAny` must be `"error"`~~ — **Already enabled** ✅
- ~~`noNonNullAssertion` must be `"error"`~~ — **Already enabled** ✅
- ~~`noImplicitAnyLet` must be `"error"`~~ — **Already enabled** ✅
- `useUnknownInCatchVariables` must be `"error"` (new)

### FR-3: Enable Missing Suspicious Rules

- ~~`noConfusingVoidType` must be `"error"`~~ — **Already enabled** ✅
- ~~`noAssignInExpressions` must be `"error"`~~ — **Already enabled** ✅
- `noRedeclare` must be `"error"` (new)
- `noEmptyInterface` must be `"error"` (new)
- `noUnsafeDeclarationMerging` must be `"error"` (new)

### FR-4: Enable Missing Style Rules

- `noVar` must be `"error"` (enforce `let`/`const`)
- ~~`noBannedTypes` must be `"error"`~~ — **Already enabled** ✅

### FR-5: TypeScript Config Alignment

- `noUnusedLocals` must be `true` in root `tsconfig.json` (currently `false`)
- `noUnusedParameters` must be `true` in root `tsconfig.json` (currently `false`)

### FR-6: Fix Pre-existing TypeScript Errors

- Add `"DOM"` to `lib` in root `tsconfig.json` so non-chrome packages can reference DOM types
- Ensure `pi-extension/tsconfig.json` includes DOM lib for test files that use DOM globals
- Fix all implicit `any` errors (callback parameters without types)
- Fix all `possibly undefined` errors (add null checks, optional chaining, or non-null assertions where justified)
- Fix all `Cannot find name 'chrome'` errors (ensure `@types/chrome` is included in relevant package configs)
- Fix `el is of type 'unknown'` errors in `domain/dom.ts` (add type narrowing)

### FR-7: Test File Exemptions (Targeted)

- Test files (`**/__tests__/**`) may keep `noExplicitAny`, `noNonNullAssertion`, `noConfusingVoidType`, `noAssignInExpressions`, and `noBannedTypes` relaxed
- Test files must still obey `noUnusedVariables`, `noUnusedImports`, `noUnusedFunctionParameters` — dead test code is still dead code
- Mock files may keep `noNonNullAssertion` relaxed
- `pi-extension/tsconfig.json` excludes `src/__tests__` — this exclusion is preserved

### FR-8: Existing Overrides Preserved

- Logger package (`logger/src/index.ts`): `noConsole` stays `off` (it's the logger itself)
- Domain layer import restrictions: untouched
- Application layer import restrictions: untouched
- `handle-exec.ts`: `noGlobalEval` stays `off` (intentional for JS execution tool)

### FR-9: Open Questions — Resolved

| Question | Decision |
|----------|----------|
| Should `noFloatingPromises` be enabled? | **No** — nursery/unstable in Biome v2, may have false positives |
| Should we add a mutation testing threshold to CI? | **No** — out of scope, separate concern |
| Should `noConsole` allow `console.error` in production? | **No** — zero allows; use the logger package instead |

---

## Non-Functional Requirements

| Category    | Requirement                             | Target        |
| ----------- | --------------------------------------- | ------------- |
| Performance | Lint check runtime                      | < 500ms total |
| Type Safety | Zero `any` in production source files   | 0 occurrences |
| Correctness | Zero unused imports/vars in production  | 0 occurrences |
| CI          | `bun run lint` exits 0 with no warnings | No warnings   |
| CI          | Per-package `tsc --noEmit` exits 0      | All packages  |
| CI          | `bun run test` + `bun run test:vitest`  | 100% pass     |

---

## Constraints

- **Technical:** Must use Biome v2.4.14 (current lock). No rule names that don't exist in this version.
- **Scope:** Full scope — biome config changes, tsconfig changes, source file fixes to satisfy all rules, AND all pre-existing TypeScript errors (DOM/Chrome types, implicit any, possibly undefined).
- **Type checking:** Run per-package (e.g., `cd chrome-extension && bun tsc --noEmit`), not from root. Each package's own `tsconfig.json` must pass.
- **Timeline:** One-shot fix. All rules enabled, all violations fixed in the same change.

---

## Dependencies

- **Internal:** None
- **External:** Biome v2.4.14 rule catalog (must verify rule names exist)
- **External:** `@types/chrome` v0.1.40 (already installed in root `package.json`)

---

## Success Metrics

- **Metric 1:** `bun run lint` passes with zero warnings and zero errors
- **Metric 2:** Per-package `tsc --noEmit` passes (all 4 packages: `logger/`, `protocol/`, `chrome-extension/`, `pi-extension/`)
- **Metric 3:** `bun run test` + `bun run test:vitest` pass 100%
- **Metric 4:** Zero `any` annotations in production source files (excluding `__tests__/` and `mocks/`)
- **Metric 5:** Zero unused imports or variables in production source files
- **Metric 6:** All 6 missing biome rules enabled and enforced

---

## Risks & Mitigations

| Risk                                            | Impact | Likelihood | Mitigation                                             |
| ----------------------------------------------- | ------ | ---------- | ------------------------------------------------------ |
| Enabling rules breaks many files                | Medium | High       | Fix all violations in same commit; batch fixes by rule |
| Biome v2 rule names differ from docs            | Low    | Medium     | Validate rules with `biome lint` before committing     |
| `noUnusedParameters` breaks callback signatures | Low    | Medium     | Prefix unused params with `_` convention               |
| Tests need `any` for mock flexibility           | Low    | Low        | Keep `noExplicitAny: off` in test override             |
| Per-package tsconfig changes break other pkgs   | Low    | Low        | Test each package independently after changes          |
| `useUnknownInCatchVariables` requires catch refactors | Medium | High   | Use `unknown` type + type narrowing in catch blocks    |

---

## Appendix

### Current Biome Config Audit (2026-05-03)

Rules already enabled as `"error"` (no change needed):

```jsonc
// CORRECTNESS (already ON):
"correctness": {
  "noUnusedVariables": "error",       // ✅
  "noUnusedImports": "error",         // ✅
  "noUnusedFunctionParameters": "error" // ✅
},
// SUSPICIOUS (already ON):
"suspicious": {
  "noExplicitAny": "error",           // ✅
  "noConfusingVoidType": "error",     // ✅
  "noAssignInExpressions": "error",   // ✅
  "noImplicitAnyLet": "error",        // ✅
  "noConsole": { "level": "error", "fix": "none", "options": { "allow": [] } } // ✅
},
// STYLE (already ON):
"style": {
  "noNonNullAssertion": "error",      // ✅
  "useConst": "error"                 // ✅
},
// COMPLEXITY (already ON):
"complexity": {
  "noBannedTypes": "error"            // ✅
}
```

Rules to add:

```jsonc
// CORRECTNESS (add):
"noUnusedPrivateClassMembers": "error",

// SUSPICIOUS (add):
"noRedeclare": "error",
"noEmptyInterface": "error",
"noUnsafeDeclarationMerging": "error",

// STYLE (add):
"noVar": "error",
"useUnknownInCatchVariables": "error",
```

### Target Biome Config Structure

```jsonc
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error",
        "noUnusedFunctionParameters": "error",
        "noUnusedPrivateClassMembers": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noConfusingVoidType": "error",
        "noAssignInExpressions": "error",
        "noImplicitAnyLet": "error",
        "noRedeclare": "error",
        "noEmptyInterface": "error",
        "noUnsafeDeclarationMerging": "error",
        "noConsole": {
          "level": "error",
          "fix": "none",
          "options": { "allow": [] }
        }
      },
      "style": {
        "noVar": "error",
        "noNonNullAssertion": "error",
        "useUnknownInCatchVariables": "error",
        "useConst": "error"
      },
      "complexity": {
        "noBannedTypes": "error"
      }
    }
  }
}
```

### Package Type-Check Matrix

| Package | Extends | lib | types | Excludes |
|---------|---------|-----|-------|----------|
| Root | — | `ESNext` | `bun` | — |
| `logger/` | Root | `ESNext` (inherited) | `bun` | — |
| `protocol/` | Root | `ESNext` | `bun` (inherited) | — |
| `chrome-extension/` | Root | `ESNext`, `DOM`, `DOM.Iterable` | `chrome` | — |
| `pi-extension/` | Root | `ESNext` | `node` | `src/__tests__` |

### Implementation Plan

1. **Config changes** — Edit `biome.jsonc` (add 6 rules) and root `tsconfig.json` (flip unused flags)
2. **Auto-fix** — Run `biome check --write .` to auto-fix what biome can
3. **Manual lint fixes** — Fix remaining lint violations (unused vars/imports in tests, catch variables, etc.)
4. **Per-package typecheck** — Run `tsc --noEmit` inside each package, fix errors incrementally
5. **Verification** — `bun run lint`, per-package `tsc --noEmit`, `bun run test`, `bun run test:vitest`

### References

- Biome v2 lint rules: https://biomejs.dev/linter/rules/
- Current config: `biome.jsonc`
- Root TS config: `tsconfig.json`
- Per-package configs: `logger/tsconfig.json`, `protocol/tsconfig.json`, `chrome-extension/tsconfig.json`, `pi-extension/tsconfig.json`
