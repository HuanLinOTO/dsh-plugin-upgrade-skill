# GLM-5.3 S1–S22 validation run · round 3 (zero-skill vs with-skill) · 2026-09-17

> Round 3 (final) for GLM-5.3, closing the 3-round median protocol. R1: [#235](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/pull/235); R2: [#239](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/pull/239). Claimed via [#218](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/issues/218).

## Setup

- **Solver**: `zai/glm-5.3` in the dsh web harness (in-session subagents, one attempt per task per condition, no score-driven retries). Concurrency 1 (serial) for most of the run, raised to 4 after the second quota window opened; base `e0a9ff5`.
- **Judges**: 44 subagents scoring each report against the sealed `packet.json` rubric and caps with the official `benchmark/report-judge/judge.mjs` SYSTEM contract and deterministic aggregation (pass = 1, partial = 0.5, triggered caps clamp).
- **⚠ Judge-model deviation (important)**: R3 was judged by **`zai/glm-5.3` — the same model as the solver** — because the judging session did not switch models, unlike R1/R2 (and all earlier GLM rounds) which used `glm-5.3-flash` judges. Same-family/same-model correlation bias risk is **higher** than in R1/R2, and the judge is not held constant across the three rounds. Cross-round comparisons and the 3-round median inherit this inconsistency; an independent re-judge of R3 with glm-5.3-flash would restore comparability.
- **Execution**: 44/44 reports verified on disk; the benchmark repository stayed clean. One 5-hour API-quota interruption hit during skill S6 — the subagent failed silently and was relaunched exactly once per protocol (no other relaunches).

## Results

| Arm | Total | Mean |
|---|---:|---:|
| zero-skill | **2013 / 2200** | 91.5% |
| with-skill | **2158 / 2200** | 98.1% |
| skill lift | **+145 (+6.6 pp)** | |

Per-task scores: `artifacts/2026-09-17-glm-5.3-s1-s22-r3/aggregate.json`. Raw reports under `noskill/`, `skill/`; judge verdicts under `judge/{noskill,skill}/`.

- **S17 zero-skill = 0 via triggered cap** (`contradictory-operational-advice`: the judge found the final advice favoring immediate cross-entry registration over `slots.inject` deferral). The cap clamp is the rubric working as designed, but a 0-from-100 single-cell swing dominates the round totals; treat the R3 aggregate with that in mind.
- Other zero-skill shortfalls: S4 (63 — located touchpoints without migration directions), S6 (75), S1/S8/S21 (90–95).
- With-skill shortfalls: S3/S11/S18 (90), S5 (88).

## GLM-5.3 three-round record

| Round | zero-skill | with-skill | lift |
|---|---:|---:|---:|
| R1 ([#235](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/pull/235)) | 2117.5 / 2200 (96.3%) | 2160 / 2200 (98.2%) | +42.5 (+1.9 pp) |
| R2 ([#239](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/pull/239)) | 2076 / 2200 (94.4%) | 2145 / 2200 (97.5%) | +69 (+3.1 pp) |
| R3 (this run) | 2013 / 2200 (91.5%) | 2158 / 2200 (98.1%) | +145 (+6.6 pp) |
| **3-round per-task median** | **2135.5 / 2200 (97.1%)** | **2170 / 2200 (98.6%)** | **+34.5 (+1.6 pp)** |

The median lift for glm-5.3 lands at **+1.6 pp**, completing the GLM family ladder on the same task pool: glm-5.3-flash **+9.3 pp** → glm-5.2 **+3.0 pp** → glm-5.3 **+1.6 pp** (each a 3-round median; protocols differ in judge model for the glm-5.3 rows as disclosed above). The round-to-round lift swing (+1.9 → +3.1 → +6.6 pp) again illustrates single-round variability and the S17 cap effect; the median protocol absorbs exactly this.

## Disclosures / limitations

- Judge model = solver model this round (see ⚠ above); an independent re-judge is recommended before citing the R3/median numbers as final.
- Round 3 of 3 (n=1 per round); between-round totals moved in both arms (zero-skill 2117.5 → 2076 → 2013, with-skill 2160 → 2145 → 2158).
- The skill S6 relaunch after the quota interruption followed the pre-registered silent-failure protocol (one relaunch, no selection on score).
- Verdicts live in per-arm subdirectories (flat layout caused cross-arm overwrites in earlier rounds).
