# Beyond Migration Docs: Evaluating Skills for Small Language Models under Limited Budgets

[English README](README.md) · [本轮修改记录](audit/REVISION-2026-09-12.zh.md) · [最新复审](REVIEW-2026-09-12.zh.md)

准备继续实验：先看[后续工作清单](NEXT-STEPS.zh.md)，包含当前完成情况、真实模型预演阻塞、执行顺序与验收标准。

当前主问题是：**有限推理预算下，迁移 skill 相比包含相同关键事实的原始文档，能否提高小模型的版本迁移正确性？** 四条件为无资料、通用流程、同源 docs、document-only skill；D−C 是主要对比。以 hands-on 行为验收为主，静态诊断、引用合规和资源开销分别报告。

范围收敛为两个便宜模型配置、DSH 单生态、固定任务池的回顾性 open-book 研究。独立事件泛化、clean/trap 机制和跨生态移至扩展，不作为当前必须完成的主张。任务审核按维护者确认的实际流程描述为“提交者自检＋维护者复核”，不称独立双盲标注或官方认证；逐题覆盖待记录核对。

现有 56 题是候选池，不按历史成绩筛选；最终 N、模型身份、预算和重复次数仍待冻结。核心规模为 `8NR`，不能继续把旧 448 次计划作为已定协议。生成表仍保留 **23 题历史快照**，不是新研究主表。[旧计划](../docs/superpowers/plans/2026-09-08-paper-56-task-rerun.md)与[旧 TODO](GAP-ANALYSIS.zh.md)保留供追溯，其范围和强制实验项以本轮主稿为准。尚无正式 D−C 结果。

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

## 写作状态

- [x] 重写摘要、Introduction 与贡献，明确一个核心研究问题与辅助分析。
- [x] 将未验证的正向结论改为证据状态和待检验分析。
- [x] 正文接入固定快照宏，区分题号前缀与交互类型。
- [x] 建立实验账本与开发暴露账本（初步审计，未认证独立 split）。
- [x] 替换五项正文引用的 stub，旧线索保存于 `audit/`。
- [ ] 归档可获得的历史产物；为新主实验补齐配置哈希、事件分组与 provenance。
- [ ] 完成独立 grader 校验与双臂统一重评。
- [ ] 按预演成本冻结 N、模型和重复协议，完成四条件主实验；holdout/clean-trap 作为扩展。
- [ ] 补完图表、实测结果、附录与完整相关工作综述。

## 相关资源

- Benchmark 任务与判分：`../benchmark/`
- Skill 语料：`../skills/`
- 官方样式来源：[acl-org/acl-style-files](https://github.com/acl-org/acl-style-files)
