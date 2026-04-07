# Researcher Friction Notes

## What was confusing or unclear

- The task description says "find equivalents for @take-out/* packages" in kit, implying kit publishes runtime packages. In reality, kit is a scaffolding CLI only — it has no runtime library packages. This made the "mapping" exercise more of a "gap analysis" since every @take-out/* function maps to "inline it yourself."
- The task was blocked by Task #1 (specifier), but the specifier had not produced `spec.md` or `plan.md` when I started. I proceeded anyway since my research (analyzing the kit repo) doesn't depend on the spec content.

## Where I got stuck

- Nowhere significantly. The kit repo is small and well-structured. The chore-cue @take-out/* usage was straightforward to audit via grep.

## What could be improved

- The task description should clarify upfront that kit is a scaffolding tool, not a runtime library replacement. This would save time on the "find equivalents" step.
- The blocker on Task #1 was unnecessary for this research task — analyzing the kit repo and documenting mappings is independent of the spec/plan content.
