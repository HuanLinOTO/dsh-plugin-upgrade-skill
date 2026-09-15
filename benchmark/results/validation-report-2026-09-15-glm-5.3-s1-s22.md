# GLM-5.3 S1–S22 validation run · round 1 (zero-skill vs with-skill) · 2026-09-15

> Round 1 for GLM-5.3, complementing the glm-5.3-flash three-round record ([#213](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/pull/213), 3-round medians) and the glm-5.2 three-round record ([#219](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/pull/219)/[#220](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/pull/220)/[#222](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/pull/222)). Claimed via [#218](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/issues/218).

## Setup

- **Solver**: `zai/glm-5.3` in the dsh web harness (in-session subagents, concurrency 2, one attempt per task per condition, no retries).
- **Base commit**: `e0a9ff5` (at this base #216 is merged, so **all 22 tasks use packet-based LLM report judging** — S13/S14/S20 are no longer keyword-judged).
- **Judges**: `zai/glm-5.3-flash` subagents scoring each report against the sealed `packet.json` rubric and caps, with official deterministic aggregation (pass = 1, partial = 0.5, fail/missing = 0; triggered caps clamp).
- **Execution**: no API-quota interruption and no relaunch during solving (per the solving session's record). 44/44 reports verified on disk; the benchmark repository stayed clean (fixture read-only discipline held).

## Results

| Arm | Total | Mean |
|---|---:|---:|
| zero-skill | **2118 / 2200** | 96.3% |
| with-skill | **2160 / 2200** | 98.2% |
| skill lift | **+42 (+1.9 pp)** | |

Per-task scores and notes: `artifacts/2026-09-15-glm-5.3-s1-s22/aggregate.json`. Raw reports under `noskill/`, `skill/`; judge verdicts under `judge/{noskill,skill}/`.

## Three-model capability ladder (paired, same task pool and protocol where noted)

| Model | Protocol | zero-skill | with-skill | lift |
|---|---|---:|---:|---:|
| glm-5.3-flash | 3-round median ×22 | 1711 / 2200 (77.8%) | 1915 / 2200 (87.0%) | **+204 (+9.3 pp)** |
| glm-5.2 | 3-round median ×22 | 2053 / 2200 (93.3%) | 2120 / 2200 (96.4%) | **+67 (+3.0 pp)** |
| glm-5.3 (this run, n=1) | single round ×22 | 2118 / 2200 (96.3%) | 2160 / 2200 (98.2%) | **+42 (+1.9 pp)** |

**The skill benefit decreases monotonically as model capability rises** (+9.3 pp → +3.0 pp → +1.9 pp), while zero-skill capability rises (77.8% → 93.3% → 96.3%). This is the predicted ceiling pattern for the paper's capability-contingent main line: the skill mostly substitutes for capability the stronger model already provides.

- With glm-5.3, 15 of 22 tasks are already at 100/100 zero-skill; the remaining zero-skill shortfalls are S8 (80), S4 (75), S6 (88), S15/S16 (90), S1 (95).
- S8 is the one task where the skill does **not** help in any model record: reports present the absent mirror tag v0.9.3 as immediately installable (same miss in glm-5.2 rounds 2–3).
- S4 remains the largest skill win (75 → 100); S6, S15, S16 also repaired to 100 by the skill.
- Two skill-arm regressions: S17 (node --check instead of vm.Script parse) and S18 (teardown disposal instead of `timer.unref`) at 90 each.

## Disclosures / limitations

- Single round (n=1) for glm-5.3; the glm-5.2 and glm-5.3-flash rows are 3-round medians, so cross-row comparison mixes aggregation protocols (the ladder direction is stable under either reading, but the glm-5.3 lift has wider uncertainty than the medians).
- Judge model (glm-5.3-flash) differs from the solver (glm-5.3) — same family, so same-family correlation bias is possible but reduced relative to the glm-5.3-flash record where solver and judge were the same model.
- **S15-noskill report truncation**: the solver report ends mid code block at the model output-length limit (159 lines). It was judged as-is (90/100) per the single-attempt protocol; this is an output-limit truncation, not an API-quota or concurrency failure, so no re-run was performed.
- Judge verdicts live in per-arm subdirectories because verdict filenames do not carry the arm (the flat layout caused cross-arm overwrites in earlier rounds).
