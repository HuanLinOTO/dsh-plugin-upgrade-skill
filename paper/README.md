# Beyond Migration Docs: Evaluating Skills for Small Language Models under Limited Budgets

[中文说明](README.zh.md) · [Revision record](audit/REVISION-2026-09-12.zh.md)

**Mainline switched on 2026-09-15.** The primary question is now how the benefit of injecting a migration skill varies with model capability and budget. Completed paired skill-vs-no-skill runs across three capability tiers give the headline result: mid-tier glm-5.3-flash improves significantly (77.8→87.0 points, mean task Δ +9.27pp, 95% CI [+3.95, +16.09], Wilcoxon p=0.0056), the stronger glm-5.2 is ceiling-limited (+3.05pp, p=0.138), and the weak local qwen3.8-27b shows a negative trend (−3.07pp, p=0.177) at +20.6% input tokens and +22 timeouts. A model upgrade dominates the skill effect. The four-condition source-matched design (A/B/C/D, primary contrast D−C) is registered in the repository but was not executed at submission time; it is presented as a design contribution and future work.

The scope is a retrospective, single-ecosystem study. Independent incident transfer, clean/trap mechanisms, and cross-ecosystem evaluation are optional extensions. Task quality control is described as contributor self-check followed by maintainer review, not independent double-blind annotation or official endorsement; per-task coverage still needs a documented audit.

The existing 56-task annotation inventory is a candidate pool. The four-condition design's final N, model identities, budgets, and repetitions remain a registration-stage decision; the full design requires `8NR` solver trials. The old 448-run plan is historical, not the current registered protocol. Generated tables retain the **23-task historical snapshot**, while the living benchmark has 63 tasks. The current manuscript supersedes the scope and mandatory experiment list in the [older plan](../docs/superpowers/plans/2026-09-08-paper-56-task-rerun.md).

## Directory structure

- `latex/` — LaTeX source of the report
  - `acl_latex.tex` — main file (title, authors, abstract, full section skeleton; based on the latest official template)
  - `acl.sty` / `acl_natbib.bst` — official ACL style (acl-org/acl-style-files master, 2026-06)
  - `custom.bib` — bibliography (seven versioned arXiv records; two new entries checked at metadata/abstract level; broader review remains pending)
  - `formatting.md` — official formatting guidelines
  - `acl_lualatex.tex` — XeLaTeX / LuaLaTeX template (unused)
- `word/`, `archive/` — official Word template and legacy templates (unused, kept as shipped with the style package)

## Build

```bash
cd latex
pdflatex acl_latex && bibtex acl_latex && pdflatex acl_latex && pdflatex acl_latex
```

For [Overleaf](https://www.overleaf.com/), upload `latex/` and `generated/` together, preserve their relative paths, and select `latex/acl_latex.tex` as the main document. The document currently uses `review` mode (with line numbers).

## Historical generated benchmark metadata

The existing historical task metadata is **generated, never hand-written**. Switching the main table to the future controlled-study snapshot is a freeze-stage task; the old snapshot stays immutable:

- **Source of truth**: one frozen evaluation snapshot, `benchmark/snapshots/2026-09-01-main-23.json` (currently 23 tasks, 3 runs per task, `per-task-median` aggregation, 2 conditions).
- The generator (`paper/scripts/generate-benchmark-table.mjs`) reads every task row, registry Type (`Static` / `Hands-on`), and description from **git objects at the snapshot's pinned benchmark commit** — never from the current checkout. Tasks added to the living benchmark after the pinned commit do not change the paper metadata of this experiment.
- The living benchmark is **not** the paper's evaluation set. Paper experiments are always pinned to an explicit snapshot; there is no "latest snapshot" behavior.

Generated files (committed, do not edit by hand):

- `paper/generated/benchmark-metadata.tex` — deterministic macros (`\BenchmarkTaskCount`, `\BenchmarkStaticCount` / `\BenchmarkHandsOnCount`, ID-prefix counts `\BenchmarkPrefixSCount` / `\BenchmarkPrefixMCount` / `\BenchmarkPrefixHCount`, pinned benchmark/skill commits, runs-per-task, aggregation, condition count). Prefix counts and registry interaction Type are kept as **two separate dimensions** (H4/H6 are registry-Static despite the H prefix).
- `paper/generated/task-pool-table.tex` — the `Task | Type | What it tests` table (`\input` into the appendix).

Regenerate (from the repo root):

```bash
npm run generate:paper-benchmark
npm run check:paper-benchmark   # CI gate: fails if the committed files drift
```

`check:paper-benchmark` and the generator unit tests run as part of `npm test`, so a snapshot/metadata drift turns CI red. The generator is deterministic: the same snapshot plus the same local git objects always produces byte-identical files (no timestamps, no host paths), and a snapshot whose pinned commit is missing locally is a hard error rather than a fallback to current `main`.

## Generated results table (main result)

The paper's main result table is **generated, never hand-written**:

- **Source of truth**: `benchmark/results/paired-effect-stats.json`, produced by `benchmark/scripts/measure-paired-effect.mjs` (task-level paired deltas, mulberry32 seed 20260907, 10000 bootstrap replicates, two-sided Wilcoxon; input-file SHA-256s embedded).
- `paper/generated/paired-effect-table.tex` is rendered from that JSON by `paper/scripts/generate-paired-effect-table.mjs` and `\input` into the Results section.

Regenerate / verify (from the repo root):

```bash
npm run measure:benchmark-paired   # recompute stats + write the JSON
npm run generate:paper-paired      # render the .tex from the JSON
npm run check:paper-paired         # CI gate: byte-exact drift check for both
npm run test:benchmark-paired      # unit + golden tests for the statistics
```

## Writing status

- [x] Rewrite abstract, introduction and contributions around one primary question and supporting analyses.
- [x] Replace unsupported positive findings with explicit evidence status and planned analyses.
- [x] Use generated frozen task counts; distinguish prefixes from interaction modes.
- [x] Create report and development-exposure ledgers (initial audit, not a certified split).
- [x] Replace five active bibliography stubs with checked records; preserve old leads in `audit/`.
- [x] Switch the mainline to capability/budget-moderated paired empirics (2026-09-15): Results section carries the three-tier paired table from `npm run generate:paper-paired`; the four-condition design is presented as registered, not executed.
- [ ] Archive available historical artifacts; complete new protocol hashes, incident grouping and provenance.
- [ ] Validate graders independently and regrade both conditions consistently.
- [ ] Execute the registered four-condition design and the preregistered temporal holdout (future work).
- [ ] Complete remaining figures, measured results, appendices, and full related-work review.

## Related resources

- Benchmark tasks and graders: `../benchmark/`
- Skill corpus: `../skills/`
- Official style source: [acl-org/acl-style-files](https://github.com/acl-org/acl-style-files)
