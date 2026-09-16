## A1 · 两组 GLM 的逐题增益差（d_t = lift_flash − lift_strong，3 轮中位）

| 任务 | 5.3f lift | 5.2 lift | d_t |
|---|---:|---:|---:|
| S1-static-scan | 0 | 0 | 0 |
| S10-paste-rename-and-version-chip | 0 | 0 | 0 |
| S11-mermaid-lazyload-trap | 0 | 10 | -10 |
| S12-global-upgrade-ebusy-trap | 0 | 0 | 0 |
| S13-peer-range-vs-runtime | 0 | 0 | 0 |
| S14-link-install-lock-trap | 0 | 0 | 0 |
| S15-slot-error-boundary-crash | 0 | -10 | 10 |
| S16-self-host-upgrade-trap | 0 | 0 | 0 |
| S17-external-ui-plugin-onboarding-trap | 20 | 0 | 20 |
| S18-terminal-sprite-render-trap | 20 | 0 | 20 |
| S19-phantom-update-stale-host | 0 | 0 | 0 |
| S2-negative-scan | 0 | 0 | 0 |
| S20-msvc-flock-trap | 5 | 8 | -3 |
| S21-resource-service-unavailable-trap | 20 | 10 | 10 |
| S22-duplicate-insert-boot-crash-trap | 20 | 0 | 20 |
| S3-snapshot-migration | 10 | 0 | 10 |
| S4-legacy-client-imports | 62 | 37 | 25 |
| S5-negative-naming | 12 | 0 | 12 |
| S6-corridor-net-state | 25 | 12 | 13 |
| S7-unpublished-cohort | 0 | 0 | 0 |
| S8-release-routing-trap | 10 | 0 | 10 |
| S9-composer-coordinate-trap | 0 | 0 | 0 |
| **mean** | | | **6.23** |
| **95% CI (task bootstrap)** | | | **[2.590909090909091, 10.045454545454545]** |
| **Wilcoxon** | | | **p=0.007988586882083037, n=12（零差 10 项单列）** |

## A2 · 逐轮 mean delta（glm-5.2 R1–R3 / glm-5.3-flash R1–R3）

- **glm-5.3-flash**: r1=6.32, round2=8.82, round3=9.82
- **glm-5.2**: r1=1.55, round2=1.64, round3=5

## Leave-one-task-out（A1 mean d_t）

- 全样本 mean d_t = 6.23
- 剔除单项后范围: 5.33（剔除 S4-legacy-client-imports）～ 7（剔除 S11-mermaid-lazyload-trap）

## 基线 vs 增益（Spearman）

- glm-5.3-flash: ρ = -0.696
- glm-5.2: ρ = -0.274

> 回顾性探索分析；均值 bootstrap 与 Wilcoxon 非独立确认；任务 bootstrap 的相关性限制见 workplan §2。
