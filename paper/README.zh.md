# Beyond Migration Docs: Evaluating Skills for Small Language Models under Limited Budgets

[English README](README.md) · [本轮修改记录](audit/REVISION-2026-09-12.zh.md) · [最新复审](REVIEW-2026-09-12.zh.md)

准备继续实验：先看[后续工作清单](NEXT-STEPS.zh.md)，包含当前完成情况、真实模型预演阻塞、执行顺序与验收标准。

**主线已于 2026-09-15 切换。** 当前主问题是：**迁移 skill 注入的收益如何随模型能力与预算变化？** 三个能力层级的成对 skill-vs-noskill 实验给出主结果：中档 glm-5.3-flash 显著提升（77.8→87.0 分，任务级 mean Δ +9.27pp，95% CI [+3.95, +16.09]，Wilcoxon p=0.0056）；更强的 glm-5.2 触顶、收益不显著（+3.05pp，p=0.138）；本地弱模型 qwen3.8-27b 呈负收益趋势（−3.07pp，p=0.177）且输入 token +20.6%、超时多 22 次。模型跃迁主导 skill 效应（glm-5.2 零 skill 93.3 已超 glm-5.3-flash 注入 skill 的 87.0）。四条件源匹配对照（A/B/C/D，主对比 D−C）已在仓库注册、投稿时未执行，作为设计贡献与 future work 呈现；静态诊断、引用合规和资源开销仍分别报告。

范围收敛为 DSH 单生态、固定任务池的回顾性 open-book 研究。独立事件泛化、clean/trap 机制和跨生态移至扩展，不作为当前必须完成的主张。任务审核按维护者确认的实际流程描述为“提交者自检＋维护者复核”，不称独立双盲标注或官方认证；逐题覆盖待记录核对。

现有 56 题是候选池，不按历史成绩筛选；四条件设计的最终 N、模型身份、预算和重复次数属注册阶段决策，核心规模为 `8NR`，不能继续把旧 448 次计划作为已定协议。生成表仍保留 **23 题历史快照**（living benchmark 当前 63 题），不是新研究主表。[旧计划](../docs/superpowers/plans/2026-09-08-paper-56-task-rerun.md)与[旧 TODO](GAP-ANALYSIS.zh.md)保留供追溯，其范围和强制实验项以本轮主稿为准。四条件 D−C 尚无执行结果。

## 目录结构

- `latex/` — 报告 LaTeX 源码
  - `acl_latex.tex` — 主文件（标题、作者、摘要、全文骨架；基于官方最新模板）
  - `acl.sty` / `acl_natbib.bst` — ACL 官方样式（acl-org/acl-style-files master，2026-06 版）
  - `custom.bib` — 参考文献（正文使用七项版本化 arXiv 记录；新补两项核对了元数据和摘要，完整综述仍待补充）
  - `formatting.md` — 官方格式说明
  - `acl_lualatex.tex` — XeLaTeX / LuaLaTeX 模板（未使用）
- `word/`、`archive/` — 官方 Word 模板与历史模板（本文未使用，随官方样式包保留）

## 编译

```bash
cd latex
pdflatex acl_latex && bibtex acl_latex && pdflatex acl_latex && pdflatex acl_latex
```

使用 [Overleaf](https://www.overleaf.com/) 时，同时上传 `latex/` 和 `generated/` 并保留相对路径，选择 `latex/acl_latex.tex` 为主文件。当前使用 `review` 模式（带行号）。

## 主结果表（生成，勿手改）

论文主结果表来自确定性管线：**勿手改**。

- 数据源：`benchmark/results/paired-effect-stats.json`，由 `benchmark/scripts/measure-paired-effect.mjs` 生成（任务级配对差值，mulberry32 seed 20260907，10000 次 bootstrap，双侧 Wilcoxon；内嵌输入文件 SHA-256）。
- `paper/generated/paired-effect-table.tex` 由 `paper/scripts/generate-paired-effect-table.mjs` 从该 JSON 渲染，`\input` 进 Results 章。

在仓库根目录重新生成 / 校验：

```bash
npm run measure:benchmark-paired   # 重算统计并写 JSON
npm run generate:paper-paired      # 从 JSON 渲染 .tex
npm run check:paper-paired         # CI 门禁：两者字节级漂移检查
npm run test:benchmark-paired      # 统计脚本单元测试 + golden 校验
```

## 写作状态

- [x] 重写摘要、Introduction 与贡献，明确一个核心研究问题与辅助分析。
- [x] 将未验证的正向结论改为证据状态和待检验分析。
- [x] 正文接入固定快照宏，区分题号前缀与交互类型。
- [x] 建立实验账本与开发暴露账本（初步审计，未认证独立 split）。
- [x] 替换五项正文引用的 stub，旧线索保存于 `audit/`。
- [x] 主线切换为能力/预算调节的成对实证（2026-09-15）：Results 章接入三层级配对结果表（`npm run generate:paper-paired` 生成，输入 paired-effect-stats.json，勿手改）；四条件设计改为已注册、未执行的表述。
- [ ] 归档可获得的历史产物；为新主实验补齐配置哈希、事件分组与 provenance。
- [ ] 完成独立 grader 校验与双臂统一重评。
- [ ] 执行已注册的四条件设计与已预注册的 temporal holdout（future work）。
- [ ] 补完图表、实测结果、附录与完整相关工作综述。

## 相关资源

- Benchmark 任务与判分：`../benchmark/`
- Skill 语料：`../skills/`
- 官方样式来源：[acl-org/acl-style-files](https://github.com/acl-org/acl-style-files)
