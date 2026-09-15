# Provenance: 2026-09-13 glm-5.2 S1–S22 round 3 artifacts

**This directory was reconstructed on 2026-09-15; the original round-3 artifacts are missing.**

- `aggregate.json` (22 records) was rebuilt from the per-task paired-median table in
  `benchmark/results/validation-report-2026-09-13-glm-5.2-s1-s22-round3.md` (R3 zero / R3 skill columns).
  Verification: three-round paired medians recomputed from the three round aggregates equal the report's
  published values (zero-skill 2053, with-skill 2120, +67).
- The original round-3 artifacts named in the report (44 solver reports, 38 judge verdicts) never entered
  any git ref — checked local branches, `origin`, and the author's fork (`lhh010/dsh-plugin-upgrade-skill`,
  branch `benchmark/glm-5.2-s1-s22-r3` = commit `24b0eca`). PR #222 contained only the report markdown.
  **Raw solver reports and judge verdicts need to be re-obtained from the run author (lhh010).**
- Known discrepancy: the report's "Round 3 results" totals line claims 1895/2005, but the report's own
  per-task R3 columns sum to 1995/2105 (both arms differ by exactly 100, i.e. one task at 0/0 vs 100/100).
  Without the raw artifacts this cannot be resolved. The reconstructed aggregate follows the per-task table.
  The paper-cited paired-median figures (2053/2120, +67) are internally consistent and unaffected as long as
  the disputed task scored 100 in rounds 1–2 (single-round 100→0 changes do not move a three-round median).
- Round 1/2 `aggregate.json` files were also repaired on 2026-09-15: S13/S14/S20 keyword-judge rows were
  restored from each round's sibling `keyword-scores.json`; repaired totals match the reports (2086/2120,
  2084/2120).
