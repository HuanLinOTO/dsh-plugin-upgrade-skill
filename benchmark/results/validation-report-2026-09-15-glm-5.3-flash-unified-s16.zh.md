# GLM-5.3-Flash 统一两臂 64-trial 跑：结果报告（2026-09-16）

对应 [workplan §5](../../paper/INVERTED-U-WORKPLAN.zh.md) 中间组行：GLM-5.3-Flash（历史中间组），
**检查统一评分后较高增益是否保留**；no-skill / with-skill，16 题 × 2 臂 × 2 次 = 64 trials。
冻结套件、抽样与排程见 [PROVENANCE](artifacts/2026-09-15-glm-5.3-flash-unified-s16/PROVENANCE.md)；
逐格配对数值见 [paired-analysis](artifacts/2026-09-15-glm-5.3-flash-unified-s16/paired-analysis.md)。

## 结论（先说答案）

**方向保留、幅度同量级、构成不稳定：统一评分下 GLM-5.3-Flash 的 skill 增益仍然为正，均值 Δ = +4.92 分
（no-skill 93.83 → with-skill 98.75），95% bootstrap CI [0.31, 10.86] 不含 0；但 16 题中 8 题双臂满分
（天花板），Wilcoxon p = 0.080（n=8），且逐题增益构成与历史明显不同。** 这支持"所测配置在该池上有正增益"
的弱主张，不支持逐题增益模式的稳定性主张；按 workplan 决策点 2/3 的口径，应报告天花板压缩与任务构成漂移，
不应宣称逐题规律复现。

## 主要数字

| 指标 | 统一评分新跑 | 历史第一轮参考（不可混合） |
| --- | ---: | ---: |
| 任务数 | 16（S1–S22 分层抽取） | 22（全池） |
| no-skill 均分 | 93.83 | 78.0%（1716/2200） |
| with-skill 均分 | 98.75 | 84.3%（1855/2200） |
| 均值 Δ | **+4.92** | **+6.3pp** |
| Δ 的 95% CI | [0.31, 10.86] | 未计算 |
| 双臂满分题对 | 8/16（50%） | 7/22 |
| Wilcoxon（双侧） | p = 0.080 | — |

历史参考列来自 2026-09-11 跑（commit f32175d、旧 rubric、12 个语义题 GLM 自评）；
与本跑的统一 report-judge-v2 评分不同代际，只作描述性对照，不做推断。

## 逐题结果（两次重复均值）

| 任务 | no-skill | with-skill | Δ（统一） | Δ（历史参考） |
| --- | ---: | ---: | ---: | ---: |
| S1-static-scan | 57.5 | 100 | **+42.5** | −25 |
| S17-external-ui-plugin-onboarding | 80 | 95 | +15 | +20 |
| S6-corridor-net-state | 87.5 | 100 | +12.5 | +25 |
| S2-negative-scan | 90 | 100 | +10 | 0 |
| S5-negative-naming | 93.75 | 100 | +6.25 | +12 |
| S20-msvc-flock-trap | 97.5 | 100 | +2.5 | +5 |
| S12/S13/S14/S15/S19/S21/S22/S9 | 100 | 100 | 0 | 0～+20 |
| S11-mermaid-lazyload-trap | 95 | 90 | −5 | +20 |
| S18-terminal-sprite-render-trap | 100 | 95 | −5 | −40 |

正增益题对 6、负增益题对 2、零增益（饱和）8。**均值 Δ 由 S1 一题主导（+42.5）**；
去掉 S1 后均值 Δ 仅 +1.0，说明"中间组增益"在统一评分下主要集中到个别低基线题。

## 三个值得注意的构成变化

1. **S1 反转**：历史上有 skill 反而 −25（卡片误映射），本次 with-skill 两次均 100 分，
   with-skill 会话明确按 skill 的 corridor folding 规则处理了 A1-02↔A2-01；no-skill 均分仅 57.5
   （无材料时折叠规则答错/缺失）。这直接挑战历史"S1 是 skill 退步题"的个案叙事。
2. **天花板压缩**：8/16 题对双臂满分（S9/S13 等历史 +20 的增益消失），当前模型在该池的 no-skill
   基线已远高于历史轮（93.8 vs 78.0）。增益萎缩主要是天花板效应，不是 skill 失效。
3. **小幅负增益出现**（S11 −5、S18 −5，各为一次重复 90 vs 100）：两次重复内部方差的量级，
   与历史 S18 −40 的深度退步不可同日而语；在 n=2 下不构成稳定退步证据。

## 协议摘要

- 冻结：selection.json / schedule.json / execution-order.json（种子 20260915，确定性 `--check` 通过）。
- 两臂：no-skill = 空目录挂载 + 与 with-skill 完全相同的提示词；with-skill 仅多 `skills/plugin-upgrade/`
  （63 文件，树哈希 2b2d5b36…）作为工作区目录技能。提示词逐字相同，均未提及技能。
- 执行：每格一个全新 GLM-5.3-Flash 求解器会话（干净工作区 = instruction + fixture + agent-output），
  批内 2+2 双臂交错，每格 1 次尝试不重试；64/64 格全部产出报告，0 缺失、0 求解器基础设施失败。
- 评分：密封 report-judge-v2（同一 SYSTEM、judgeInput、fixture 完整性门、prompt-echo 检测、
  确定性 scoreDecisions 聚合），LLM 调用换成 GLM-5.3-Flash 子代理（盲臂，judge 每次只见一份报告）。
  64 格全部 scored，无 judge_error。
- 时长：求解格 128–1040 秒（with-skill 显著更长、token 约 2–4 倍，与历史 ~2.2× 一致）；
  评分格 43–294 秒。逐格记录见 [execution-log](artifacts/2026-09-15-glm-5.3-flash-unified-s16/execution-log.jsonl)。

## 局限（全部如实披露）

1. **judge 与 solver 同族**（均为 GLM-5.3-Flash，用户指定全 GLM 方案）。workplan 明确不建议
   GLM 自评关键结果；本报告的逐格 judge 只能视为同一评分体系下的相对比较，绝对分值有同族偏置风险。
2. **模型身份仅到 harness 声明级**：solver/judge 均为 ZCode 会话报告的
   `builtin:bigmodel-coding-plan/GLM-5.3-Flash`（bigmodel 网关），无法独立探测服务端模型标识
   （OAuth 网关不暴露 /models；本机无独立 API key）。不符合 workplan"端点身份核验"的理想标准。
3. **无 Docker 隔离**：求解器为宿主上的子代理（指示只读工作区），隔离弱于 Harbor 容器；
   污染审计（64 份报告）未发现密封材料引用或判分语言泄漏。
4. **回顾性探索**：非预注册确认性检验；历史列为不同评分代际，不可混合；单配置两臂，
   不支持任何能力梯度结论。
5. 抽样盲选（只读元数据）但排除集含历史高增益题 S4/S16；抽样种子先于全部求解存在（见 git 历史），
   不存在按结果调样本的可能。

## 产物清单

| 产物 | 路径 |
| --- | --- |
| 冻结抽样 | `selection.json`（脚本 `benchmark/scripts/select-unified-sixteen.mjs`） |
| 排程/执行序 | `schedule.json` / `execution-order.json` |
| Harbor 配置（未使用，保留） | `harbor/*.config.json` |
| 原始报告（64） | `reports/<arm>/r<repeat>/<task>/report.md` |
| 逐格评分（64） | `scores/<task>__<arm>__r<repeat>.json` |
| 聚合/配对分析 | `aggregate.json` / `paired-analysis.json` / `paired-analysis.md` |
| 执行日志 | `execution-log.jsonl` |
| 预演（不进统计） | 本机 `~/.cache/dsh-unified-run-evidence/2026-09-15-glm-5.3-flash-unified-s16-trials/pilot/`（不进仓库；S4 87.5→100、S10 100/100） |
| 分析脚本 | `benchmark/scripts/analyze-unified-paired.mjs` 等 `*unified*` 系列 |
