# PRD: 首尔旅行数据审查 Skill (data-review)

版本: v1.0.0 | 日期: 2026-04-06 | 负责人: 项目团队

---

## 1. 概述

本项目级 skill 用于自动化审查首尔旅行地图应用中的行程数据正确性，重点覆盖**地址、定位（坐标）、交通**三大维度。skill 在执行时会读取 `src/data/seoul/locations.ts` 和 `src/data/seoul/days.ts`，通过 WebSearch、首尔地铁 API（`vercel-proxy-henna-eight.vercel.app`）以及 Haversine 公式等多种手段进行交叉验证，发现错误后自动修正数据文件，并生成审计报告保存到 `.claude/dataReview/` 目录。

> 目标是建立持续的数据质量保障机制，确保旅行地图展示的信息（路线、时间、距离、地址）准确可信，减少游客在实际出行中的困惑与偏差。

---

## 2. 研究发现

### 2.1 现有解决方案
- **当前代码库**：项目已有 `travel-planner` Agent（`.claude/agents/travel-planner.md`），负责规划行程和写入数据文件，内置了距离计算（Haversine）和首尔地铁 API 调用逻辑。
- **数据文件结构**：
  - `src/data/seoul/locations.ts` 包含 `LocationGroup`（商圈/酒店）和 `Location`（具体地点），字段包括 `lat`, `lng`, `address`, `children` 等。
  - `src/data/seoul/days.ts` 包含 `DayPlan` 数组，每个 `PathPoint` 可附带 `TransitDetail`（含多段 `TransitStep`）。
- **现有验证**：项目测试（Vitest）主要覆盖组件渲染，对数据准确性的验证较弱。

### 2.2 技术环境
- **首尔地铁 API**：`https://vercel-proxy-henna-eight.vercel.app/api/route?dptreStnNm={起点}&arvlStnNm={终点}`
  - 实测可用：`홍대입구 → 공덕` 返回耗时 3 分钟、距离 2.8km、费用 1,550 韩元。
  - 支持查询总时间、总距离、票价、换乘次数。
- **坐标/地址验证**：无现成的项目级 API Key（如 Naver/Kakao），故以 **WebSearch** 为主要验证手段，通过搜索地点的官方韩文地址和公开坐标进行比对。
- **距离自洽校验**：使用 Haversine 公式计算两点间直线距离，与 `TransitDetail.distance` 及步行/地铁路线描述中的分段距离进行交叉验证。

### 2.3 推荐方法
- **将其封装为项目级 Claude Skill**（`~/.claude/skills/seoul-data-review/SKILL.md`），而非 Agent 或 Command。
  - Skill 的优势：可被任何 Agent 或用户会话调用，提供可复用的审查方法论和结构化提示词。
  - 不选 Agent 的原因：Agent 更适合有明确目标且需要自主调度的长任务，而 data-review 更像一套可复用的审查规范+执行流程。

---

## 3. 目标与成功标准

| 目标 | 成功指标（SMART） | 优先级 |
|------|------------------|--------|
| 自动发现数据中 80% 以上的地址/坐标/交通错误 | 每次审查生成的报告中，问题检出率达到 80% 以上（以人工抽查为基准） | P0 |
| 审查后能自动修正已知问题 | 所有可通过 API/WebSearch 明确确认的错误，必须在同一轮执行中完成修复 | P0 |
| 每次审查生成可追溯的审计报告 | 报告以 Markdown 形式保存到 `.claude/dataReview/`，包含：审查时间、发现问题列表、修复记录、未决问题 | P1 |
| 审查流程对现有数据格式零破坏 | 修改后的 `locations.ts` 和 `days.ts` 必须通过 `npm run test && npm run build` | P0 |

---

## 4. 用户故事

### 4.1 作为开发者，我想触发自动数据审查，以便在修改行程数据后快速发现潜在错误

**作为一个** 项目开发者，
**我想要** 通过自然语言（如 `/data-review` 或调用 skill）触发自动审查流程，
**以便** 在新增了地点或交通信息后，快速确认数据的准确性。

**验收标准：**
- [ ] Given 项目已部署 data-review skill，When 开发者输入审查指令，Then skill 自动读取 `src/data/seoul/locations.ts` 和 `days.ts`
- [ ] Given 数据中存在坐标与地址不匹配，When skill 执行地址验证，Then 在审计报告中标记该问题并尝试修正
- [ ] Given 审查流程结束，When 所有修改写入文件后，Then 自动运行 `npm run test && npm run build` 验证构建通过
- [ ] 错误处理: 若 WebSearch 或地铁 API 超时/失败，skill 应跳过该条并记录为"未决问题"，不中断整体流程

**优先级:** 必须有
**估算:** 中

### 4.2 作为项目维护者，我想查看历史审计报告，以便追踪数据质量的变化趋势

**作为一个** 项目维护者，
**我想要** 每次审查后生成的报告都按时间戳保存在 `.claude/dataReview/` 目录，
**以便** 回溯某次审查发现了哪些问题、修复了哪些内容。

**验收标准：**
- [ ] Given 审查完成，Then 报告文件命名为 `YYYY-MM-DD-HH-MM-review-report.md` 并保存到 `.claude/dataReview/`
- [ ] Given 打开任意历史报告，Then 内容至少包含：执行摘要、地址/坐标/交通三维度检查结果、修复记录、未决问题、验证结果（test/build）
- [ ] 边界情况: 若 `.claude/dataReview/` 目录不存在，skill 应自动创建它

**优先级:** 应该有
**估算:** 小

### 4.3 作为数据使用者（旅行者），我期待地图上的交通时间和距离准确可信

**作为一个** 最终用户（旅行者），
**我想要** 地图上的交通时间、距离和换乘信息与实际情况一致，
**以便** 我能合理安排出行时间。

**验收标准：**
- [ ] Given 两段地点间使用地铁连接，When skill 审查时调用首尔地铁 API，Then 将 API 返回的耗时/距离/票价与 `TransitDetail` 比对，偏差超过 20% 的问题必须被标记
- [ ] Given 两段地点间距离小于 500 米，When 数据中标记为步行，Then skill 使用 Haversine 公式验证步行距离合理性（允许 ±30% 偏差考虑实际道路）
- [ ] Given 步行路线中包含明显不合理的路径（如从弘大步行到汝矣岛），Then 强制标记为严重错误

**优先级:** 必须有
**估算:** 中

---

## 5. 功能需求

### 5.1 地址审查 (Address Review)
- **FR1.1**: 对每个 `Location` 和 `LocationGroup` 的 `address` 字段，使用 WebSearch 搜索其 `name` 的官方韩文地址，与现有 `address` 进行比对。
- **FR1.2**: 若搜索结果与现有地址不一致，标记为"地址存疑"，并优先使用搜索结果中的官方地址进行替换。
- **FR1.3**: 对于搜索结果不唯一或无法确认的地址，记录到审计报告的"未决问题"中，不做强制修改。

### 5.2 定位（坐标）审查 (Coordinate Review)
- **FR2.1**: 对每个地点使用 WebSearch 查找其公开坐标（lat/lng），与现有坐标比对。
- **FR2.2**: 若坐标偏差超过 500 米，标记为"坐标严重偏差"，并使用搜索到的更准确坐标更新数据。
- **FR2.3**: 验证每个 `Location` 的 `parentId` 对应的商圈/酒店组，其坐标与父级坐标的距离是否合理（同一商圈内的 spot 应在父级 1km 范围内，酒店周边的 spot 应在 2km 范围内）。

### 5.3 交通审查 (Transit Review)
- **FR3.1**: 遍历 `days.ts` 中每一天的 `path`，检查相邻 `PathPoint` 之间的 `TransitDetail` 是否存在且合理。
- **FR3.2**: 对于含有 `subway` 或 `train` 步骤的交通信息，提取起终点站韩文名，调用首尔地铁 API (`/api/route`) 获取官方路线数据，与现有 `duration`、`distance`、`steps` 进行交叉验证。
  - 时间偏差超过 5 分钟或距离偏差超过 20% 视为问题。
- **FR3.3**: 对于纯步行 (`walk`) 路段，使用 Haversine 公式计算直线距离，验证 `TransitDetail.distance` 的合理性（步行路线实际距离通常为直线距离的 1.0~1.5 倍，允许 ±30% 偏差）。
- **FR3.4**: 检查 `TransitStep` 的换乘逻辑���否连贯：上一段的 `to` 应与下一段的 `from` 一致（或语义上合理），不一致则标记为警告。
- **FR3.5**: 对于 `train`（机场铁路 AREX）路段，单独标记并使用 WebSearch 验证其时刻和站点信息。

### 5.4 自动修复与报告 (Fix & Report)
- **FR4.1**: 所有明确可修正的问题（坐标偏差、地址错误、API 可直接确认的交通数据偏差），应在生成报告前写入 `locations.ts` 和 `days.ts`。
- **FR4.2**: 所有修改必须通过 `npm run test && npm run build` 验证，若构建失败则回滚修改并记录为"修复失败"。
- **FR4.3**: 审计报告必须以 Markdown 格式保存到 `.claude/dataReview/YYYY-MM-DD-HH-MM-review-report.md`，报告结构固定为以下章节：
  1. 执行摘要（审查地点数、发现问题数、修复数）
  2. 地址审查结果
  3. 坐标审查结果
  4. 交通审查结果
  5. 修复记录（文件变更详情）
  6. 未决问题（无法确认或需要人工复核的问题）
  7. 构建验证结果

---

## 6. 非功能需求

| 类别 | 需求 | 验收标准 |
|------|------|----------|
| **性能** | 单次审查应在合理时间内完成 | 完整审查 6 天行程数据（约 30 个地点）耗时 < 10 分钟 |
| **可靠性** | 外部 API 失败不中断整体流程 | WebSearch 或地铁 API 失败时，该条目跳过并记录，其他条目继续审查 |
| **可维护性** | Skill 文档应清晰说明审查规则和阈值 | 新开发者可在 10 分钟内理解审查逻辑和报告格式 |
| **兼容性** | 修改后的数据文件必须兼容现有类型定义和组件 | `npm run test && npm run build` 100% 通过 |

---

## 7. 约束与假设

### 约束
- **技术约束**: 项目没有 Naver/Kakao Map API Key，坐标和地址验证完全依赖 WebSearch 和公开信息，对于小众/新开店铺可能搜索不到精确结果。
- **技术约束**: 首尔地铁 API 基于 Vercel 代理，存在 100 req/min 的速率限制，审查逻辑中应避免高频并发请求。
- **业务约束**: 数据文件是 TypeScript 源码（非 JSON），修改后必须保持正确的 TS 语法、导出结构和格式。
- **资源约束**: Skill 仅拥有 Read/Write/Edit/WebSearch/WebFetch/Bash 工具的使用权，不能部署外部服务或数据库。

### 假设
- **假设 1**: 项目中的地点名称（韩文/中文混合）足以通过 WebSearch 找到对应的官方韩文地址和坐标。若名称过于口语化或误差较大，搜索结果可能不准确。
- **假设 2**: 首尔地铁 API (`vercel-proxy-henna-eight.vercel.app`) 在长期内可用。若该服务下线，交通审查功能将降级为仅使用 Haversine + WebSearch 验证。
- **假设 3**: 旅行者更倾向于"准但保守"的交通时间估算（宁可多给时间），因此审查后修正的交通时间不应明显低于 API 返回值。

---

## 8. 未决问题

| 问题 | 负责人 | 截止日期 | 状态 |
|------|--------|----------|------|
| 是否需要为 address 字段增加英文/中文地址的辅助验证？ | 项目团队 | 2026-04-10 | 待解决 |
| 地铁 API 返回的 `distance` 与项目中 `TransitDetail.distance` 的格式/单位不一致，是否需要统一单位？ | 项目团队 | 2026-04-10 | 待解决 |
| 是否需要在 skill 中集成 Naver/Kakao API（若后续申请到 Key）？ | 项目团队 | 2026-04-15 | 待解决 |

---

## 9. 下一步

请选择：

- [ ] 运行 `/plan` —— 创建详细实施计划
- [ ] 运行 `/tdd` —— 直接进入测试驱动开发
- [ ] 直接说 "根据 PRD 执行" —— 立即开始实现
- [ ] 继续讨论 —— 修改 PRD 或补充需求

---

## 附录

### A. Skill 部署位置
- 文件路径: `/Users/niannian/.claude/skills/seoul-data-review/SKILL.md`

### B. 审计报告存放位置
- 目录路径: `/Users/niannian/seoul/.claude/dataReview/`
- 报告命名: `YYYY-MM-DD-HH-MM-review-report.md`

### C. 关键 API 参考
- 首尔地铁路由 API: `GET https://vercel-proxy-henna-eight.vercel.app/api/route?dptreStnNm={韩文起点}&arvlStnNm={韩文终点}`
- 响应示例（格式化）:
  ```
  [홍대입구 → 공덕]
  소요시간: 3분 | 거리: 2.8km | 요금: 1,550원 | 환승: 0회
  ```

### D. 数据来源
- `src/data/seoul/locations.ts`
- `src/data/seoul/days.ts`
- `src/types/index.ts`
