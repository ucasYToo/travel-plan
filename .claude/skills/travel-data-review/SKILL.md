---
name: travel-data-review
description: |
  自动化审查旅行地图应用中的行程数据（locations.ts / days.ts）的地址、坐标与交通正确性，
  支持自动修正并生成结构化的审计报告保存到 .claude/dataReview/。
tools:
  - Read
  - Write
  - Edit
  - WebSearch
  - WebFetch
  - Bash
model: sonnet
---

# Travel Data Review Skill

## 概述

本 Skill 用于审查旅行地图应用中 `src/data/seoul/locations.ts` 和 `days.ts` 的行程数据正确性（当前项目以首尔为例），覆盖三大维度：
1. **地址审查**：WebSearch 交叉验证官方韩文地址
2. **坐标审查**：WebSearch 查公开坐标，偏差 >500m 修正；验证子地点落在父级合理范围
3. **交通审查**：调用首尔地铁 API 交叉验证地铁/铁路段的 duration/distance；Haversine 验证步行段合理性；检查换乘连贯性

## 核心约束

- **绝不中断流程**：单个 WebSearch / API 失败只标记 unresolved，继续审查其他条目
- **修改前必须验证**：所有自动修正必须通过 `npm run test && npm run build`
- **失败后必须回滚**：构建失败则还原数据文件到修改前状态
- **报告必须生成**：每次执行后保存审计报告到 `.claude/dataReview/YYYY-MM-DD-HH-MM-review-report.md`

## 标准工作流程

执行审查时，严格按下述 7 步流程操作：

1. **Read 数据文件** → `src/data/seoul/locations.ts`、`src/data/seoul/days.ts`、`src/types/index.ts`
2. **地址审查** → 对每个 location 搜索官方韩文地址，比对并标记偏差
3. **坐标审查** → 搜索公开坐标，计算偏差；检查 spot 与 parent group 的归属距离
4. **交通审查** → 遍历每天 path，完整性检查 + 地铁 API 验证 + 步行 Haversine 验证 + 换乘连贯性
5. **自动修正** → 对明确可修正的问题使用 `Edit` 修改数据文件
6. **构建验证** → 执行 `npm run test && npm run build`，失败则回滚
7. **生成审计报告** → 写入 `.claude/dataReview/` 并按需创建目录

## 文件说明

| 文件 | 用途 | 操作权限 |
|---|---|---|
| `src/data/seoul/locations.ts` | 地点坐标与地址数据 | Read / Edit / Write |
| `src/data/seoul/days.ts` | 每日行程与交通数据 | Read / Edit / Write |
| `src/types/index.ts` | 类型定义（仅读取理解结构） | Read |
| `.claude/dataReview/*.md` | 审计报告输出目录 | Write |

## 地址审查规则

### 审查对象
遍历 `seoulLocations` 中的所有键值对（包括 `seoulHotels`、`seoulDistricts`、`seoulSpots`）。

### 搜索策略
对每个地点执行 WebSearch，优先使用以下查询模板：
- `"{name} 주소"`（例如 `"Fritz Coffee Company 주소"`）
- `"{name} 서울 주소"`
- `"{韩文关键词} 주소"`（如果 description 中有韩文店名，优先用它搜索）

### 判断标准
- 若搜索结果的**第一页**中出现清晰明确的韩文官方地址，与现有 `address` 字段**不一致** → 标记 `address_mismatch`，建议替换
- 若搜索结果模糊、多源冲突、或无法确认 → 标记 `unresolved`，**不修改**
- 小型街道/商圈（如弘大主街、汉南洞主街）地址为范围性描述，允许与精确门牌号不同，不强制修正

### 修正策略
只修正以下明确场景：
- 同一店铺/酒店的韩文门牌号与现有记录不同
- 现有 `address` 为空但搜索到明确地址
- 现有 `address` 包含明显拼写错误（如 도화동 155-2 写成 도화동 155-1 且有多个来源佐证）

## 坐标审查规则

### 搜索策略
对每个地点执行 WebSearch：
- `"{name} 좌표"`
- `"{name} lat lng"`
- `"{韩文店名} 위치"`

优先信任来源：Naver 知识面板、官方 Instagram/网站、地图博客中的经纬度。

### 偏差判断
使用 Haversine 公式计算现有坐标与搜索到的公开坐标之间的距离：
- **> 500m**：标记 `coord_major_deviation`，**必须修正**
- **200m ~ 500m**：标记 `coord_minor_deviation`，建议修正但需有多个来源支持
- **< 200m**：视为正常，不标记

### 子地点归属验证
对每个 `type: 'spot'` 的 `Location`，检查其 `parentId` 对应的 `LocationGroup`：
- 若父级 `type === 'group'`（商圈）：spot 与父级距离应在 **1.0 km** 以内
- 若父级 `type === 'hotel_group'`（酒店）：spot 与父级距离应在 **2.0 km** 以内
- 超出阈值 → 标记 `parent_distance_warning`，提示重新分配 parentId 或确认商圈范围

## 交通审查规则

### 1. 基础完整性检查
遍历 `seoulDays` 中每一天的 `path`：
- `path[0].locationId` 应为 `baseHotelId`（或旅行起点如机场），否则标记 `path_start_mismatch`
- 相邻 `PathPoint` 之间的移动（除首尾酒店外）应有 `transit` 字段
- `transit` 必须包含：`distance`、`duration`、`steps`（数组）、`startName`、`endName`
- `fare` 为可选字段，缺失不标记为错误
- `steps` 中的每一步必须包含：`mode`、`from`、`to`、`duration`、`instruction`；`distance` 除 walk 外可选

### 2. 地铁/铁路段 API 交叉验证
#### API 调用
```
https://vercel-proxy-henna-eight.vercel.app/api/seoul-metro?start={韩文起点}&end={韩文终点}
```
**限速**：每次调用后至少等待 **1 秒**，避免触发速率限制。

#### 站名清洗与映射
days.ts 中使用的站点名多为中文或混合描述，需要清洗并映射为**纯韩文站名**才能调用 API。执行审查时，按以下规则处理 `step.from` 和 `step.to`：
1. 去掉非站点后缀：`"8号出口"`、`"附近"`、`"入口"`、`"T1/T2"`、`"换乘通道"`、`"下车口"`
2. 去掉线路前缀修饰：`"机场铁路"`、`"首尔地铁"`、`"京义线"` 等
3. 得到核心站名（通常是 `XX站` 或纯韩文），然后通过 **WebSearch** 查询其韩文标准名称：
   - 搜索 `"{站名} 首尔地铁 韩文"` 或 `"{站名} 역"`
   - 示例：搜索 `"孔德站 역"` 应得到 `공덕`
   - 示例：搜索 `"弘大入口站 역"` 应得到 `홍대입구`
4. 若无法确认韩文站名 → 标记 `subway_name_unresolved`，跳过 API 调用

**AREX 直达列车特殊处理**：机场铁路（AREX）直达列车不走首尔市内地铁 API，标记 `train_unverified` 并用 WebSearch 验证大致时间和距离（通常约 50-60 分钟，约 45-60km）。

#### 验证逻辑
对每个 `mode === 'subway'` 的 step：
1. 清洗 `from` 和 `to`，映射为韩文站名
2. 若两端均为有效地铁站名 → 调用 API
3. 比较 API 返回的时间/距离与 `step.duration` / `step.distance`：
   - 时间偏差 **> 5 分钟** → 标记 `subway_time_mismatch`
   - 距离偏差 **> 20%** → 标记 `subway_distance_mismatch`
4. 若 API 返回空/失败/无解 → 标记 `subway_api_unresolved`，**不修改**

### 3. 步行段 Haversine 验证
对 `mode === 'walk'` 的 step：
1. 根据前后逻辑推断出实际的两个地理点（不总是 `from`/`to` 字符串，可能需要结合 path 中前后 `PathPoint.locationId`）
2. 最佳策略：对每一段完整的 `TransitDetail`（从 `startName` 到 `endName`），如果全部 steps 都是 `walk`，则取前后两个 `PathPoint` 的 `locationId`，在 `seoulLocations` 中查找它们的 `lat/lng`，计算 Haversine 直线距离
3. 实际步行距离 ≈ 直线距离 × (1.0 ~ 1.5)
4. 比较 `TransitDetail.distance` 的数值（统一转换为米）：
   - 若实际步行距离偏离计算值 **> 30%** → 标记 `walk_distance_warning`
   - 对于 < 500m 的短途步行，允许偏差放宽至 **50%**（因为街区道路复杂）

### 4. 换乘连贯性检查
遍历同一段 `TransitDetail` 的 `steps[i]` 和 `steps[i+1]`：
- 检查 `steps[i].to` 与 `steps[i+1].from` 是否在语义上匹配
- 完全一致：最佳
- 允许合理差��：`"XX站"` ↔ `"XX站Y号出口"`、`"XX站"` ↔ `"XX站附近"`
- 若完全不相关（如 `"孔德站"` → `"弘大主街"` 中间没有步行衔接但下一段是 `subway`）→ 标记 `transfer_mismatch`
- 特别检查：`train` 换乘 `subway` 或 `walk` 时，中间 station 名称是否一致

## 参考公式与工具

### Haversine 距离公式（米）
用于计算两点经纬度之间的地球表面直线距离：

```typescript
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // 地球半径（米）
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
```

### 距离字符串解析
统一将字符串解析为数字（米）：
- `"约45公里"` → 45000
- `"约2.5公里"` → 2500
- `"约300米"` → 300
- `"约60分钟"` → 60
- `"约5分钟"` → 5
- 若包含中文数字如 "约一千米"，按常规汉字数字解析

### 地铁 API 调用示例
```
curl "https://vercel-proxy-henna-eight.vercel.app/api/seoul-metro?start=홍대입구&end=공덕"
```
预期返回 JSON 类似：
```json
{
  "time": 3,
  "distance": 2.8,
  "fare": 1550
}
```
- `time` 单位为分钟
- `distance` 单位为公里
- 若返回为空或非 JSON → 标记 unresolved

## 自动修正与构建验证

### 修正原则
- 只修正数据层面明确、可靠的问题
- **绝不猜测**：信息不完整或来源冲突时，标记 unresolved 留给人工判断
- 使用 `Edit` 工具进行增量修改，保留文件其余结构和导出不变

### 修正前准备
1. 在内存中记录 `locations.ts` 和 `days.ts` 的**原始完整内容**字符串，或执行 `Bash("git diff")` 查看变更
2. 若使用 `Edit`，确保 `old_string` 足够长且唯一，避免误匹配

### 修正后验证
执行：
```bash
npm run test && npm run build
```

- **通过**：标记 `build_passed`，进入报告生成
- **失败**：
  1. 立即回滚 `locations.ts` 和 `days.ts`（若保留了原始内容字符串则 `Write` 还原，若在 git 仓库内且修改前未暂存则可使用 `git checkout -- src/data/seoul/locations.ts src/data/seoul/days.ts`）
  2. 标记 `build_failed_and_rolled_back`
  3. 在报告中记录失败原因

## 审计报告模板

每次执行后，必须生成 Markdown 报告并保存到：
```
/Users/niannian/seoul/.claude/dataReview/YYYY-MM-DD-HH-MM-review-report.md
```
使用当前实际时间作为文件名（24小时制）。

### 报告结构（7个章节）

```markdown
# 行程数据审查报告 — {YYYY-MM-DD HH:MM}

## 1. 执行摘要
- 审查地点总数：{N}
- 审查天数总数：{N}
- 发现问题数：{N}
- 自动修正数：{N}
- 未决问题数：{N}
- 构建状态：{passed / failed-rolled-back}

## 2. 地址审查结果
| 地点ID | 名称 | 状态 | 现有地址 | 建议地址 | 说明 |
|---|---|---|---|---|---|
| ... | ... | ok / mismatch / fixed / unresolved | ... | ... | ... |

## 3. 坐标审查结果
| 地点ID | 名称 | 状态 | 现有坐标 | 偏差(m) | 父级距离 | 说明 |
|---|---|---|---|---|---|---|
| ... | ... | ok / major-fixed / minor / unresolved | ... | ... | ... | ... |

## 4. 交通审查结果
### 4.1 完整性检查
### 4.2 地铁/铁路验证
### 4.3 步行距离验证
### 4.4 换乘连贯性

## 5. 修复记录
- {文件}：{修改内容简述}

## 6. 未决问题
- {问题描述}：{原因/建议后续行动}

## 7. 构建验证结果
{npm run test && npm run build 的输出摘要，或失败详情}
```

## 错误处理与降级策略

| 场景 | 处理方式 |
|---|---|
| WebSearch 无结果 | 标记 `unresolved`，跳过该条目 |
| 地铁 API 超时/空返回 | 标记 `subway_api_unresolved`，跳过该 step |
| 距离字符串无法解析 | 记录原始字符串，标记 `parse_warning`，尝试用正则提取数字+单位 |
| `Edit` 工具匹配失败 | 回退到 `Write` 重写整个文件（需先用原始内容回滚失败编辑） |
| 构建失败后无法 git restore | 使用内存中保留的原始内容字符串进行 `Write` 还原 |

## 触发方式

作为项目级 Skill，可在任意会话中通过加载此 Skill 后执行审查提示：

```
请使用 travel-data-review skill 对当前项目的行程数据进行全面审查，
修正能确认的问题，生成审计报告，并确保测试和构建通过。
```

审查完成后，向用户汇报：
1. 共审查了多少地点和天数
2. 自动修正了几处问题
3. 还剩余几处未决问题
4. 审计报告的完整文件路径
