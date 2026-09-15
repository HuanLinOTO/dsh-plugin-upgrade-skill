// paper/scripts/generate-paired-effect-table.mjs
//
// Deterministic paired-effect statistics → LaTeX pipeline for the paper's
// main result table. Source of truth: benchmark/results/paired-effect-stats.json
// (produced by benchmark/scripts/measure-paired-effect.mjs — run
// `npm run measure:benchmark-paired` first). Pure string templates, no
// timestamps, no host paths: the same input JSON always produces a
// byte-identical table.
//
// Usage (from the repo root):
//   node paper/scripts/generate-paired-effect-table.mjs
//   node paper/scripts/generate-paired-effect-table.mjs --check
//
// Output (committed to the repo):
//   paper/generated/paired-effect-table.tex — booktabs three-line table,
//   label tab:paired-effect.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { escapeLatex } from './generate-benchmark-table.mjs'

export const INPUT_PATH = 'benchmark/results/paired-effect-stats.json'
export const OUTPUT_PATH = 'paper/generated/paired-effect-table.tex'

function fmt2(value) {
  return value.toFixed(2)
}

function fmtSigned2(value) {
  if (value === 0) return '0.00'
  return value > 0 ? `+${fmt2(value)}` : `$-$${fmt2(Math.abs(value))}`
}

function fmtP(value) {
  if (value < 0.0001) return '$<$0.0001'
  return value.toFixed(4)
}

export function loadStats(repoRoot) {
  const file = join(repoRoot, INPUT_PATH)
  if (!existsSync(file)) {
    throw new Error(`missing ${INPUT_PATH}; run \`npm run measure:benchmark-paired\` first`)
  }
  let parsed
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`${INPUT_PATH}: not valid JSON (${error.message})`)
  }
  if (parsed === null || typeof parsed !== 'object' || parsed.schemaVersion !== 1 || parsed.id !== 'paired-effect-stats-v1') {
    throw new Error(`${INPUT_PATH}: not a paired-effect-stats-v1 report`)
  }
  if (!Array.isArray(parsed.groups) || parsed.groups.length === 0) {
    throw new Error(`${INPUT_PATH}: no groups`)
  }
  for (const group of parsed.groups) {
    for (const field of ['label', 'tasks', 'meanNoskill', 'meanSkill', 'meanDelta']) {
      if (group[field] === undefined) throw new Error(`${INPUT_PATH}: group is missing "${field}"`)
    }
    if (!Array.isArray(group.bootstrap?.ci95) || group.bootstrap.ci95.length !== 2) {
      throw new Error(`${INPUT_PATH}: group "${group.label}" has no bootstrap ci95`)
    }
    if (typeof group.wilcoxon?.pTwoSided !== 'number') {
      throw new Error(`${INPUT_PATH}: group "${group.label}" has no numeric Wilcoxon pTwoSided`)
    }
  }
  return parsed
}

export function renderPairedEffectTableTex(stats) {
  const esc = escapeLatex
  const rows = stats.groups
    .map((group) => {
      const label = `${esc(group.label)} ($n = ${group.tasks}$)`
      const pair = `${fmt2(group.meanNoskill)} $\\rightarrow$ ${fmt2(group.meanSkill)}`
      const delta = fmtSigned2(group.meanDelta)
      const ci = `[${fmtSigned2(group.bootstrap.ci95[0])}, ${fmtSigned2(group.bootstrap.ci95[1])}]`
      return `  ${label} & ${pair} & ${delta} & ${ci} & ${fmtP(group.wilcoxon.pTwoSided)} \\\\`
    })
    .join('\n')
  const replicates = stats.bootstrapReplicates.toLocaleString('en-US')
  return [
    '% AUTO-GENERATED. DO NOT EDIT.',
    `% Source: ${INPUT_PATH}`,
    '% Regenerate with: npm run generate:paper-paired',
    '',
    '\\begin{table*}[t]',
    '\\centering',
    '\\small',
    '\\begin{tabular}{lcccc}',
    '\\toprule',
    'Model ($n$ tasks) & noskill $\\rightarrow$ skill & Mean paired $\\Delta$ & 95\\% CI & Wilcoxon $p$ \\\\',
    '\\midrule',
    rows,
    '\\bottomrule',
    '\\end{tabular}',
    `\\caption{Task-level paired effect of the plugin-upgrade skill across three completed skill-vs-noskill experiments. Each cell compares the two conditions on a 0--100 scale: for the glm groups, per-task medians of three rounds; for qwen3.8-27b, per-task means of three scored attempts (reward means rescaled by 100). Mean paired $\\Delta$ is the mean of per-task skill-minus-noskill deltas; 95\\% CIs are percentile intervals from ${replicates} task-level paired bootstrap replicates (${esc(stats.prng)}, seed ${stats.seed}); $p$ is the two-sided Wilcoxon signed-rank test (zero deltas excluded, tie-corrected normal approximation with continuity correction).}`,
    '\\label{tab:paired-effect}',
    '\\end{table*}',
    '',
  ].join('\n')
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const args = process.argv.slice(2)
  const check = args.includes('--check')
  if (args.some((arg) => arg !== '--check')) {
    console.error('usage: node paper/scripts/generate-paired-effect-table.mjs [--check]')
    process.exit(2)
  }
  const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
  let tex
  try {
    tex = renderPairedEffectTableTex(loadStats(repoRoot))
  } catch (error) {
    console.error(`error: ${error.message}`)
    process.exit(1)
  }
  const target = join(repoRoot, OUTPUT_PATH)
  if (check) {
    if (!existsSync(target)) {
      console.error(`missing generated file: ${OUTPUT_PATH}`)
      console.error('Run: npm run generate:paper-paired')
      process.exit(1)
    }
    if (readFileSync(target, 'utf8') !== tex) {
      console.error(`out of date: ${OUTPUT_PATH}`)
      console.error('Run: npm run generate:paper-paired')
      process.exit(1)
    }
    console.log(`${OUTPUT_PATH} is up to date`)
    process.exit(0)
  }
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, tex)
  console.log(`wrote ${OUTPUT_PATH}`)
}
