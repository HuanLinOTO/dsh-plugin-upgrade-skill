# Beyond Migration Docs: Evaluating Skills for Small Language Models under Limited Budgets

[中文说明](README.zh.md) · [Revision record](audit/REVISION-2026-09-12.zh.md)

The primary question is whether migration skills improve small-model migration correctness over documents containing the same task-relevant facts under equal resource limits. The main contrast is D−C: document-only skill versus source-matched documents. No-material and generic-guidance conditions provide supporting comparisons. Functional acceptance is primary; static diagnosis, citation compliance, and resource usage are reported separately.

The scope is a retrospective, single-ecosystem study with two affordable model configurations. Independent incident transfer, clean/trap mechanisms, and cross-ecosystem evaluation are optional extensions. Task quality control is described as contributor self-check followed by maintainer review, not independent double-blind annotation or official endorsement; per-task coverage still needs a documented audit.

The existing 56-task annotation inventory is a candidate pool. Final N, model identities, budgets, and repetitions remain unfrozen; the full design requires `8NR` solver trials. The old 448-run plan is historical, not the current registered protocol. Generated tables retain the **23-task historical snapshot**, and no completed D−C result is claimed. The current manuscript supersedes the scope and mandatory experiment list in the [older plan](../docs/superpowers/plans/2026-09-08-paper-56-task-rerun.md).

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

## Writing status

- [x] Rewrite abstract, introduction and contributions around one primary question and supporting analyses.
- [x] Replace unsupported positive findings with explicit evidence status and planned analyses.
- [x] Use generated frozen task counts; distinguish prefixes from interaction modes.
- [x] Create report and development-exposure ledgers (initial audit, not a certified split).
- [x] Replace five active bibliography stubs with checked records; preserve old leads in `audit/`.
- [ ] Archive available historical artifacts; complete new protocol hashes, incident grouping and provenance.
- [ ] Validate graders independently and regrade both conditions consistently.
- [ ] Freeze the admitted task set, two model configurations, budgets and repetitions; run all four conditions. Holdout and clean/trap remain extensions.
- [ ] Complete remaining figures, measured results, appendices, and full related-work review.

## Related resources

- Benchmark tasks and graders: `../benchmark/`
- Skill corpus: `../skills/`
- Official style source: [acl-org/acl-style-files](https://github.com/acl-org/acl-style-files)
