# CommandCode Goat 用量（OpenChamber 扩展）

一个 [OpenChamber](https://openchamber.dev) 扩展，把 **CommandCode Goat 套餐配额**和**本地 OpenCode token 费用**放进同一个侧栏面板。

[English](README.md) · 中文

面板会跟随 OpenChamber 的界面语言：中文环境显示中文，其他环境显示英文。

## 面板内容

- **核心指标** —— 配额条上方四张卡片，显示当前**计费周期**的：请求数（附失败数）、成功率、成本、Token（附输入 / 输出拆分）。
- **三条配额进度条** —— 滚动 5 小时窗口、滚动每周窗口、月度额度池。每条都显示剩余金额和实时重置倒计时，并按用量从常规升级为警告（≥ 60%）再升级为错误（≥ 90%）。
- **计费周期** —— 套餐 id、订阅状态、当前周期（开始 → 结束）。刷新按钮就在这一行最右侧。
- **本地费用（图表化）** —— 可选 今日 / 本周 / 本月 / 全部。本周是**堆叠柱状图**（每天费用、按模型分色并配图例）；鼠标悬停在柱段上会显示该天该模型的费用、token、轮次与对话数。本月是**日历热力格**（每天费用，强度按当月最大值缩放），鼠标移到某天会显示同样的逐模型明细；今日不显示按天视图。每个区间下方都有**横向模型排行** —— 费用、轮次、对话数、token、缓存命中率，从多到少。
- **侧栏徽标** —— 在扩展图标上显示每周窗口的剩余百分比。

关于数字的两点说明：token 一律以 `M`（百万）为单位显示；某天若有记录但费用为 0，显示 `$0.00` 而不是破折号 —— 未配置单价的模型按 0 记录且 OpenCode 不会回溯，所以一天可以有真实工作量、却记为零账单。

## 环境要求

| | |
|---|---|
| OpenChamber | **1.24.0 或更高** —— 扩展 SDK 在该版本落地。更低版本会以 `host-too-old` 拒绝安装。 |
| CommandCode | 有 Goat 订阅，且 API key 已注册进 OpenCode（`~/.local/share/opencode/auth.json`）。 |
| 平台 | OpenChamber 的 web 与桌面端，macOS / Linux / Windows 均可。VS Code 与移动端不加载扩展。 |

配额部分需要 CommandCode 的 key。**没有 key 也能用**：本地 token 费用照常显示，同时给出一条说明告诉你配额部分不可用。

## 安装

OpenChamber → **设置 → 扩展（Extensions）** → 把下面这行粘进 *Folder, ZIP, or URL* 输入框：

```
https://github.com/SimonHeiHei/openchamber-commandcode-goat-usage
```

然后在权限弹窗里批准。OpenChamber 会克隆仓库、安装到自己的数据目录，并在本仓库 `version` 增大时提示更新。

## 它会申请什么权限

安装时只申请一个能力：**`service`** —— 一个由本扩展随 OpenChamber 一起启动的本地进程。

这件事必须说清楚。用 OpenChamber 官方文档的原话：权限列表只是提示词，**不施加 OS 沙箱** —— guest service 以你的用户权限运行，能读写你能读写的任何东西。所以批准之前请先读代码。它只有一个文件 [`service/main.js`](service/main.js)，只做三件事：

1. 从 OpenCode 的 `auth.json` 读取你的 CommandCode API key；
2. 以只读方式读取你的 OpenCode SQLite 数据库，汇总本地 token 费用；
3. 向 `https://api.commandcode.ai` 发三个只读 `GET` 请求，取你的配额与用量。

它绑定在宿主分配的端口上的 `127.0.0.1`，每个请求都要求宿主签发的 bearer token，从不写文件、不存任何数据，除了那三个请求之外不向任何地方发送数据。

## 隐私

- API key 不离开 service 进程：不出现在任何响应里、不写进日志、也不会到达面板。
- 完全不会索取你的账号身份：扩展根本不调用账号接口，所以你的用户名和邮箱不会被获取。
- 面板是沙箱 iframe，没有网络访问、没有文件系统访问；它只能通过宿主从 service 读取 JSON。
- 无遥测、无统计。唯一的外部网络端点就是 `api.commandcode.ai`。
- 本扩展不向磁盘持久化任何内容。

## 工作原理

```
面板（沙箱 iframe，classic IIFE）
  └─ host.serviceRequest ──► OpenChamber 宿主 ──► 127.0.0.1:<port> ──► service/main.js
                                                                        ├─ auth.json          （你的 key）
                                                                        ├─ opencode.db        （只读汇总）
                                                                        └─ api.commandcode.ai （配额，只读）
```

面板不直接与任何东西通信。宿主在首次使用时拉起 service，在 OpenChamber 退出时停止它。

## 数据来源

| 区块 | 来源 |
|---|---|
| 套餐、额度、窗口 | `GET /alpha/billing/subscriptions`、`/alpha/billing/credits` |
| 本计费周期用量 | `GET /alpha/usage/summary` |
| 本地费用 | 你的 `opencode.db`（`message` 表，assistant 行） |

滚动窗口及其上限都是 CommandCode 自己的数值，本扩展只负责展示。

## 开发

```bash
npm install       # @openchamber/sdk + esbuild，仅构建期使用
npm run build     # 重新打包 panel/src/main.js → panel/main.js
npm run check     # 对两个交付脚本做语法检查
```

`panel/main.js` **是故意提交进仓库的**：OpenChamber 宿主从不会编译 guest 包，所以构建产物必须随仓库分发。请改 `panel/src/main.js` 后重新构建，不要手改打包产物。

发版：改 `package.json` 里的 `version`。OpenChamber 就是拿它和本仓库比对来决定是否提示更新。注意，如果某个版本申请了**更多**能力，会重新弹出授权对话框。

## 排查

| 现象 | 原因 |
|---|---|
| 「本地服务未就绪」 | `service` 能力未获批准，或服务启动失败。去 设置 → 扩展 重新批准。 |
| 配额条消失、只显示提示 | `auth.json` 里没有 CommandCode 的 key，或上游请求失败。本地费用仍然可用。 |
| 提示「显示的是上次结果，刷新失败」 | 刷新时上游（或你的网络）抖了一下。失败的请求会自动重试一次，服务也会在后台重新拉取，所以通常会自动恢复 —— 也可以点「刷新」。鼠标悬停在提示上可看到上游的原始原因。 |
| 本地费用为空 | 所选区间内没有 OpenCode 活动，或数据库读取失败。 |
| 安装被拒：`host-too-old` | OpenChamber 低于 1.24.0。 |
| 安装被拒：`missing-build` | 缺 `panel/main.js` —— 请安装 release tag，而不是从未跑过构建的分支。 |

service 报错时会写明它尝试过的确切文件路径，这是排查非标准 OpenCode 目录布局最快的线索。

## 许可证

[MIT](LICENSE)
