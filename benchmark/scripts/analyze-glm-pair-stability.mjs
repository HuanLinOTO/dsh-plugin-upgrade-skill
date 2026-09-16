// Retrospective exploratory analysis (workplan paper/INVERTED-U-WORKPLAN.zh.md section 2, A1/A2):
//   A1 - per-task skill-lift difference between the two GLM groups (flash vs strong), from
//        the three-round per-task medians already published in paired-effect-stats.json.
//   A2 - stability checks: per-round mean deltas, leave-one-task-out, mean vs median
//        aggregation, baseline-vs-gain Spearman, zero handling.
// Zero new solver calls. Statistics reuse the helpers from measure-paired-effect.mjs
// (mulberry32 seed 20260907, 10000 task-level paired bootstrap replications).
//
// CLI:  node benchmark/scripts/analyze-glm-pair-stability.mjs [repoRoot]
//       writes benchmark/results/glm-pair-stability.json and glm-pair-stability-table.md.
// Importable: analyze(repoRoot) returns the result object without writing files.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { pairedBootstrap, wilcoxonSignedRank, mean, median, BOOTSTRAP_SEED, BOOTSTRAP_REPLICATES } from './measure-paired-effect.mjs'

export const STATS_PATH = 'benchmark/results/paired-effect-stats.json'
export const OUTPUT_PATH = 'benchmark/results/glm-pair-stability.json'
export const TABLE_PATH = 'benchmark/results/glm-pair-stability-table.md'

const ROUND_DIRS = {
  'glm-5.3-flash': [
    'benchmark/results/artifacts/2026-09-11-glm-5.3-flash-s1-s22',
    'benchmark/results/artifacts/2026-09-11-glm-5.3-flash-s1-s22-round2',
    'benchmark/results/artifacts/2026-09-11-glm-5.3-flash-s1-s22-round3'
  ],
  'glm-5.2': [
    'benchmark/results/artifacts/2026-09-13-glm-5.2-s1-s22',
    'benchmark/results/artifacts/2026-09-13-glm-5.2-s1-s22-round2',
    'benchmark/results/artifacts/2026-09-13-glm-5.2-s1-s22-round3'
  ]
}

const sha256 = p => createHash('sha256').update(readFileSync(p)).digest('hex')
const loadJson = p => JSON.parse(readFileSync(p, 'utf8'))
const round4 = v => Math.round(v * 10000) / 10000

export function spearman(xs, ys) {
  const rank = v => {
    const order = [...v].map((x, i) => [x, i]).sort((a, b) => a[0] - b[0])
    return order.map(([, i]) => i + 1)
  }
  const rx = rank(xs)
  const ry = rank(ys)
  const mx = mean(rx)
  const my = mean(ry)
  const num = rx.reduce((acc, x, i) => acc + (x - mx) * (ry[i] - my), 0)
  const den = Math.sqrt(rx.reduce((acc, x) => acc + (x - mx) ** 2, 0)) * Math.sqrt(ry.reduce((acc, y) => acc + (y - my) ** 2, 0))
  return den === 0 ? 0 : num / den
}

export function analyze(repoRoot) {
  const stats = loadJson(repoRoot + '/' + STATS_PATH)
  const byLabel = Object.fromEntries(stats.groups.map(g => [g.label, g]))
  const flash = byLabel['glm-5.3-flash']
  const strong = byLabel['glm-5.2']
  if (!flash || !strong) throw new Error('missing GLM groups in paired-effect-stats.json')

  const flashByTask = new Map(flash.perTask.map(e => [e.task, e]))
  const strongByTask = new Map(strong.perTask.map(e => [e.task, e]))
  const tasks = flash.perTask.map(e => e.task).filter(t => strongByTask.has(t)).sort()

  const a1Deltas = tasks.map(t => flashByTask.get(t).delta - strongByTask.get(t).delta)
  const a1Mean = mean(a1Deltas)
  const a1Median = median(a1Deltas)
  const a1Bootstrap = pairedBootstrap(a1Deltas)
  const a1Wilcoxon = wilcoxonSignedRank(a1Deltas)
  const a1PerTask = tasks.map((t, i) => ({
    task: t,
    liftFlash: flashByTask.get(t).delta,
    liftStrong: strongByTask.get(t).delta,
    d: a1Deltas[i]
  }))
  const loo = a1PerTask.map(e => ({
    task: e.task,
    meanDLiftOut: mean(a1Deltas.filter((_, i) => a1PerTask[i].task !== e.task))
  }))
  const looMin = loo.reduce((a, b) => (b.meanDLiftOut < a.meanDLiftOut ? b : a))
  const looMax = loo.reduce((a, b) => (b.meanDLiftOut > a.meanDLiftOut ? b : a))

  const perRound = {}
  for (const [model, dirs] of Object.entries(ROUND_DIRS)) {
    perRound[model] = dirs.map(dir => {
      const agg = loadJson(repoRoot + '/' + dir + '/aggregate.json')
      const byTask = new Map(agg.map(e => [e.task, e]))
      const deltas = tasks.filter(t => byTask.has(t)).map(t => byTask.get(t).skill - byTask.get(t).noskill)
      const round = /round\d+$/.test(dir) ? dir.match(/round\d+$/)[0] : 'r1'
      return { round, meanDelta: round4(mean(deltas)), n: deltas.length }
    })
  }

  const baselineGain = {}
  for (const [label, g] of [['glm-5.3-flash', flash], ['glm-5.2', strong]]) {
    const baselines = g.perTask.map(e => e.noskill)
    const gains = g.perTask.map(e => e.delta)
    baselineGain[label] = { spearmanBaselineVsGain: round4(spearman(baselines, gains)) }
  }
  const meanVsMedian = {
    'glm-5.3-flash': { mean: flash.meanDelta, median: flash.medianDelta },
    'glm-5.2': { mean: strong.meanDelta, median: strong.medianDelta }
  }
  const zeroHandling = {
    flashNZero: flash.nZero ?? flash.wilcoxon.n,
    strongNZero: strong.nZero ?? strong.wilcoxon.n,
    note: 'wilcoxon n excludes zero deltas; zeros reported as nZero'
  }

  const inputPaths = [STATS_PATH, ...Object.values(ROUND_DIRS).flat().map(dir => dir + '/aggregate.json')]
  const inputs = inputPaths.map(p => ({ path: p, sha256: sha256(repoRoot + '/' + p) }))

  return {
    schemaVersion: 1,
    id: 'glm-pair-stability',
    retrospectiveExploratory: true,
    method: { prng: 'mulberry32', seed: BOOTSTRAP_SEED, bootstrapReplicates: BOOTSTRAP_REPLICATES, note: 'same helpers as measure-paired-effect.mjs' },
    inputs,
    a1: {
      definition: 'd_t = (flash skill − flash no-skill) − (strong skill − strong no-skill), per task, from 3-round medians',
      tasks: tasks.length,
      meanD: round4(a1Mean),
      medianD: a1Median,
      bootstrapCi95: a1Bootstrap.ci95.map(v => round4(v)),
      wilcoxon: a1Wilcoxon,
      leaveOneOut: {
        min: { task: looMin.task, meanD: round4(looMin.meanDLiftOut) },
        max: { task: looMax.task, meanD: round4(looMax.meanDLiftOut) }
      },
      perTask: a1PerTask
    },
    a2: {
      perRoundMeanDelta: perRound,
      meanVsMedianAggregation: meanVsMedian,
      baselineVsGainSpearman: baselineGain,
      zeroHandling
    }
  }
}

export function renderMarkdown(result) {
  const md = []
  md.push('## A1 per-task lift difference (d_t = lift_flash − lift_strong, 3-round medians)')
  md.push('')
  md.push('| task | 5.3-flash lift | 5.2 lift | d_t |')
  md.push('|---|---:|---:|---:|')
  for (const e of result.a1.perTask) md.push('| ' + e.task + ' | ' + e.liftFlash + ' | ' + e.liftStrong + ' | ' + e.d + ' |')
  md.push('| **mean** | | | **' + result.a1.meanD + '** |')
  md.push('| **95% CI (task bootstrap)** | | | **[' + result.a1.bootstrapCi95[0] + ', ' + result.a1.bootstrapCi95[1] + ']** |')
  md.push('| **Wilcoxon** | | | **p=' + result.a1.wilcoxon.pTwoSided + ', n=' + result.a1.wilcoxon.n + '** |')
  md.push('')
  md.push('## A2 per-round mean delta')
  md.push('')
  for (const [model, rounds] of Object.entries(result.a2.perRoundMeanDelta)) {
    md.push('- **' + model + '**: ' + rounds.map(r => r.round + '=' + r.meanDelta).join(', '))
  }
  md.push('')
  md.push('## leave-one-task-out (A1 mean d_t)')
  md.push('')
  md.push('- full-sample mean d_t = ' + result.a1.meanD)
  md.push('- leave-one-out range: ' + result.a1.leaveOneOut.min.meanD + ' (without ' + result.a1.leaveOneOut.min.task + ') to ' + result.a1.leaveOneOut.max.meanD + ' (without ' + result.a1.leaveOneOut.max.task + ')')
  md.push('')
  md.push('## baseline vs gain (Spearman rho)')
  md.push('')
  for (const [model, v] of Object.entries(result.a2.baselineVsGainSpearman)) md.push('- ' + model + ': rho = ' + v)
  md.push('')
  md.push('> Retrospective exploratory analysis; mean bootstrap and Wilcoxon are not independent confirmations; task-bootstrap correlation limits per workplan section 2.')
  return md.join('\n') + '\n'
}

export function runCli(repoRoot) {
  const result = analyze(repoRoot)
  writeFileSync(repoRoot + '/' + OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n')
  writeFileSync(repoRoot + '/' + TABLE_PATH, renderMarkdown(result))
  process.stdout.write(renderMarkdown(result))
  process.stdout.write('\nwrote ' + OUTPUT_PATH + ' and ' + TABLE_PATH + '\n')
}

const isMain = process.argv[1] && (() => {
  try { return fileURLToPath(import.meta.url) === realpathSync(process.argv[1]) } catch { return false }
})()
if (isMain) runCli(process.cwd())