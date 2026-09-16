// Collects finished unified-run cells from the trials tree into the repo
// artifact layout: scores/<task>__<arm>__r<repeat>.json and
// reports/<arm>/r<repeat>/<task>/report.md. Idempotent; prints a coverage table.
//
// Committed report copies get one disclosed transformation: workspace-relative
// skill links (../../skills/plugin-upgrade/...) are re-pointed at the repo's
// byte-identical, hash-pinned skill tree so repository link validation passes.
// The pristine originals stay under trials/ (uncommitted).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const RUN_DIR = join(repoRoot, 'benchmark/results/artifacts', process.env.UNIFIED_RUN_DIR ?? '2026-09-15-glm-5.3-flash-unified-s16')
const TRIALS = process.env.UNIFIED_TRIALS_DIR
  ? resolve(process.env.UNIFIED_TRIALS_DIR)
  : join(RUN_DIR, 'trials')

function findReport(dir) {
  const agentOutput = join(dir, 'agent-output')
  if (!existsSync(agentOutput)) return null
  const walk = (base, prefix = '') => {
    for (const name of readdirSync(base).sort()) {
      const path = join(base, name)
      if (statSync(path).isDirectory()) {
        const hit = walk(path, `${prefix}${name}/`)
        if (hit) return hit
      } else if (/\.(md|txt)$/.test(name) && name !== 'instruction.md') {
        return join(agentOutput, `${prefix}${name}`)
      }
    }
    return null
  }
  return walk(agentOutput)
}

function rewriteSkillLinks(text, reportDest) {
  // path segments below repoRoot include the report file itself; links need one '..' per directory
  const dirsBelowRoot = reportDest.slice(repoRoot.length).split('/').length - 2
  const ups = '../'.repeat(dirsBelowRoot)
  return text.replace(/\]\(((?:\.\.\/)+)skills\/plugin-upgrade\//g, `](${ups}skills/plugin-upgrade/`)
}

function collectArm(arm) {
  const armDir = join(TRIALS, arm)
  if (!existsSync(armDir)) return
  for (const repeat of readdirSync(armDir).sort()) {
    if (!/^r\d$/.test(repeat)) continue
    for (const task of readdirSync(join(armDir, repeat)).sort()) {
      const cell = join(armDir, repeat, task)
      const record = join(cell, 'score-record.json')
      if (existsSync(record)) {
        mkdirSync(join(RUN_DIR, 'scores'), { recursive: true })
        // The driver's flag parser recorded 'apply' (argv[0]) as judgeModel; the
        // transport identity is documented and restored here (see PROVENANCE).
        const scored = JSON.parse(readFileSync(record, 'utf8'))
        scored.judgeModel = 'GLM-5.3-Flash'
        scored.judgeModelNote = "restored: driver bug wrote argv[0] ('apply'); every judge call was a GLM-5.3-Flash subagent per execution-log/PROVENANCE"
        writeFileSync(join(RUN_DIR, 'scores', `${task}__${arm}__${repeat}.json`), JSON.stringify(scored, null, 2) + '\n')
      }
      const judgeDir = join(RUN_DIR, 'judge', arm, repeat, task)
      for (const [srcName, dstName] of [['verdict.json', 'verdict.json'], [join('grade-logs', 'details.json'), 'details.json']]) {
        const src = join(cell, srcName)
        if (existsSync(src) && !existsSync(join(judgeDir, dstName))) {
          mkdirSync(judgeDir, { recursive: true })
          cpSync(src, join(judgeDir, dstName))
        }
      }
      const dest = join(RUN_DIR, 'reports', arm, repeat, task, 'report.md')
      if (existsSync(dest)) continue
      const report = findReport(join(cell, 'workspace')) ?? findReport(cell)
      if (report) {
        mkdirSync(join(dest, '..'), { recursive: true })
        writeFileSync(dest, rewriteSkillLinks(readFileSync(report, 'utf8'), dest))
      }
    }
  }
}

collectArm('no-skill')
collectArm('with-skill')

const schedule = JSON.parse(readFileSync(join(RUN_DIR, 'schedule.json'), 'utf8'))
let graded = 0
const missing = []
for (const cell of schedule.cells) {
  const scorePath = join(RUN_DIR, 'scores', `${cell.task}__${cell.arm}__r${cell.repeat}.json`)
  if (existsSync(scorePath)) graded += 1
  else missing.push(`${cell.task} ${cell.arm} r${cell.repeat}`)
}
console.log(`collected: ${graded}/${schedule.cells.length} cells scored`)
if (missing.length) console.log(`missing:\n${missing.join('\n')}`)
