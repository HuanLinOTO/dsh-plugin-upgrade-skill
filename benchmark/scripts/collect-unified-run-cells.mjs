// Collects finished unified-run cells from the trials tree into the repo
// artifact layout: scores/<task>__<arm>__r<repeat>.json and
// reports/<arm>/r<repeat>/<task>/report.md. Idempotent; prints a coverage table.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const RUN_DIR = join(repoRoot, 'benchmark/results/artifacts', process.env.UNIFIED_RUN_DIR ?? '2026-09-15-glm-5.3-flash-unified-s16')
const TRIALS = join(RUN_DIR, 'trials')

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
        cpSync(record, join(RUN_DIR, 'scores', `${task}__${arm}__${repeat}.json`))
      }
      const report = findReport(join(cell, 'workspace')) ?? findReport(cell)
      if (report && !existsSync(join(RUN_DIR, 'reports', arm, repeat, task, 'report.md'))) {
        mkdirSync(join(RUN_DIR, 'reports', arm, repeat, task), { recursive: true })
        cpSync(report, join(RUN_DIR, 'reports', arm, repeat, task, 'report.md'))
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
