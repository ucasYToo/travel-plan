# PRD: 旅行地图 CLI 打包工具

> 模板来源：`requirement-workflow/templates/prd-full.md`

---

## 1. 概述

### 1.1 背景
当前仓库 (`seoul-travel-map`) 是一个基于 React + Vite + Leaflet 的单文件旅行地图 Web 应用。行程数据完全由 JSON 驱动，构建后输出为一个独立的 `dist/index.html`，可部署到任何静态托管服务。

### 1.2 目标
将上述应用封装为一个可全局安装的 **npm CLI 工具** (`trip-packer`)，使拥有 agent 助手（如 OpenClaw）的用户能够：
1. 在外部按固定 JSON Schema 生成旅行数据；
2. 通过一条命令快速打包成独立 HTML 网页；
3. 无需理解模板代码、无需 fork 项目。

> **包名说明**: 主推包名为 `trip-packer`（简洁、未被占用）。备选方案包括 `travel-map-cli`、`itinerary-mapper`，如发布前发现冲突可替换。

### 1.3 成功标准
- CLI 安装后一条命令即可从 JSON 产出 HTML
- 支持传入单城市或多城市 JSON 数据
- 构建产物为单一自包含 HTML 文件
- 输入数据在构建前通过现有 Zod Schema 验证，错误信息清晰
- CLI 返回非零退出码表示失败，便于 agent 自动化集成

---

## 2. 用户画像与场景

| 角色 | 描述 | 核心诉求 |
|------|------|----------|
| **Agent 开发者** | 使用 OpenClaw 等 agent 自动生成旅行 JSON 数据 | 最低的集成成本：命令行调用，标准化输入输出 |
| **旅行者/博主** | 想快速生成可分享的旅行地图网页 | 无需配置开发环境，一键打包 |
| **自动化流水线** | 在 CI/CD 或脚本中批量生成地图页面 | 零交互、明确的退出码和日志 |

---

## 3. 用户故事与验收标准

### US-1: 单城市数据打包
**作为** agent 开发者，
**我希望能**传入单个城市 JSON 文件并运行 CLI 命令，
**从而**获得一个可部署的 HTML 文件。

**验收标准:**
- [ ] 运行 `npx trip-packer build --data ./tokyo.json --output ./dist/tokyo.html` 成功生成 HTML
- [ ] 生成的 HTML 在浏览器中打开后能正确渲染地图、地点、行程路径
- [ ] 构建过程如果数据验证失败，CLI 打印具体错误并返回退出码 `1`

### US-2: 多城市数据打包
**作为** agent 开发者，
**我希望能**同时传入多个城市 JSON 文件，
**从而**生成支持城市切换的单一 HTML 应用。

**验收标准:**
- [ ] 支持命令如 `npx trip-packer build --data ./tokyo.json --data ./osaka.json --output ./dist/japan-trip.html`
- [ ] 生成的 HTML 包含城市切换下拉菜单/选项卡，且默认激活第一个城市
- [ ] 支持 `--default-city <cityId>` 参数显式指定默认激活城市，若指定的城市不在数据列表中则报错（退出码 `2`）
- [ ] 每个城市的 `metadata.title` 作为城市列表中的显示名称

### US-3: 数据验证与错误反馈
**作为** 自动化流水线使用者，
**我希望能**在构建前获知 JSON 数据中的格式错误，
**从而**在部署前修正数据。

**验收标准:**
- [ ] CLI 复用项目中已有的 Zod Schema (`src/data/schema.ts`) 对输入进行验证
- [ ] 验证失败时输出结构化的错误信息（包括字段路径和失败原因）
- [ ] 支持 `--strict` 模式：任何警告也视为错误（返回退出码 `1`）

### US-4: 自定义输出目录与文件名
**作为** 自动化脚本调用者，
**我希望能**指定输出路径和文件名，
**从而**将产物直接放入目标部署目录。

**验收标准:**
- [ ] `--output` 参数支持相对路径和绝对路径
- [ ] 若 `--output` 以 `.html` 结尾，直接使用该文件名
- [ ] 若 `--output` 指向目录，使用默认文件名 `index.html`
- [ ] 输出目录不存在时自动创建

---

## 4. 功能需求

### 4.1 CLI 命令结构

```
trip-packer build [options]
trip-packer validate [options]
```

#### `build` 选项

| 选项 | 必填 | 说明 |
|------|------|------|
| `-d, --data <path>` | 是 | 城市 JSON 文件路径，可多次指定以支持多城市 |
| `-o, --output <path>` | 否 | 输出路径（文件或目录），默认 `./dist/index.html` |
| `--default-city <cityId>` | 否 | 指定默认激活的城市 ID（默认使用第一个传入的城市） |
| `--strict` | 否 | 严格模式，验证警告也视为错误 |
| `--no-validate` | 否 | 跳过数据验证（仅用于内部调试，不推荐） |
| `-v, --version` | 否 | 显示 CLI 版本 |
| `-h, --help` | 否 | 显示帮助信息 |

#### `validate` 选项

| 选项 | 必填 | 说明 |
|------|------|------|
| `-d, --data <path>` | 是 | 城市 JSON 文件路径，可多次指定 |
| `--strict` | 否 | 严格模式，验证警告也视为错误 |
| `-h, --help` | 否 | 显示帮助信息 |

### 4.2 输入数据格式

输入文件必须是符合现有 `ItineraryData` 结构的 JSON 文件，Schema 定义在 `src/data/schema.ts` 中。

**单文件示例:** `tokyo.json`

```json
{
  "metadata": {
    "title": "东京旅行攻略",
    "subtitle": "新宿3晚 · 5日往返",
    "mapCenter": { "lat": 35.6895, "lng": 139.6917 },
    "mapZoom": 12,
    "cityLabel": "東京",
    "seasonLabel": "SPRING"
  },
  "locations": { ... },
  "days": [ ... ]
}
```

**多城市时:** CLI 内部自动生成 `CITIES` 映射和城市选项列表，文件名 stem 作为 `cityId`（必要时 slugify）。

### 4.3 构建流程（功能逻辑）

1. **解析参数** — 读取 `--data` 路径列表、`--output` 和 `--default-city`
2. **读取 JSON** — 逐个读取输入文件，提取 `cityId`（文件名 slug）
3. **验证数据** — 使用 `itinerarySchema` 验证每个文件；失败则打印错误并退出
4. **检查默认城市** — 若传了 `--default-city`，确认该 cityId 存在于数据列表中；不存在则报错（退出码 `2`）
5. **生成入口文件** — 在临时目录中生成 `src/data/index.ts`，动态导入传入的城市数据，并注入 `defaultCityId`
6. **调用 Vite Build** — 以生产模式运行构建，输出到指定路径
7. **清理临时文件** — 若使用了临时入口，构建后自动清理
8. **输出结果** — 打印成功信息和产物路径

### 4.4 退出码约定

| 退出码 | 含义 |
|--------|------|
| `0` | 成功 |
| `1` | 通用错误（验证失败、构建失败、文件不存在等） |
| `2` | 命令行参数错误（如 `--default-city` 指定的城市不存在） |

> `validate` 子命令同样遵循上述退出码：验证通过返回 `0`，失败返回 `1`。

---

## 5. 技术约束

### 5.1 约束
- **必须**复用当前项目的 Vite 配置和 `vite-plugin-singlefile` 插件，确保产物仍是单一 HTML
- **必须**复用现有的 Zod Schema 进行数据验证，不重复定义
- **必须**保持当前项目的数据自描述架构，不引入服务端或运行时计算层
- CLI 的临时入口文件生成**不应**污染原仓库的 `src/data/index.ts`（使用临时工作目录或内存流）
- 产物 HTML 中**不应**包含开发模式代码或 source map

### 5.2 假设
- 用户环境中已安装 Node.js 18+
- 用户传入的 JSON 文件编码为 UTF-8
- 城市数据中的 `locationId` 在全局范围内唯一（多城市场景下用户自行保证）
- 当前项目依赖（`vite`、`vite-plugin-singlefile`、`zod` 等）在 CLI 的 `package.json` 中被正确声明为依赖

---

## 6. 非功能需求

- **构建时间:** 单城市数据在 10 秒内完成构建（M1/M2 级别机器）
- **包体积:** CLI npm 包安装体积（不含运行时生成的产物）应 < 50MB
- **日志输出:** 默认输出 INFO 级别日志；支持 `--silent` 和 `--verbose`（未来扩展）
- **跨平台:** 支持 macOS、Linux、Windows（路径处理和 shell 命令使用 Node.js 跨平台 API）

---

## 7. 风险与依赖

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 当前 `src/data/index.ts` 是硬编码的 TypeScript 导入，动态替换可能破坏类型检查 | 中 | 在临时目录中进行完整构建，使用基于字符串替换或模板生成的 `index.ts` |
| `vite-plugin-singlefile` 对大体积产物（多城市大数据）有内存压力 | 中 | 明确文档说明推荐的城市/地点数量上限；必要时未来引入分包 |
| Zod Schema 与 JSON 不完全对等（如 `z.string().optional()` 的空字符串处理） | 低 | 构建前使用现有 `cities.test.ts` 做回归测试 |

---

## 8. 行业最佳实践与研究发现

> 研究方法：`requirement-workflow/SKILL.md#研究阶段`

### 8.1 现有项目分析
- 当前项目已实现 **JSON 驱动 + 单文件构建** 的架构，天然适合 CLI 封装。
- `src/data/schema.ts` 已使用 Zod 定义完整的数据校验层，可直接被 CLI Node 侧代码复用。
- `vite.config.ts` 已配置 `viteSingleFile()`，产物天然为单一 HTML。

### 8.2 设计决策
- CLI 不引入新的构建工具，而是**包装现有构建流程**：生成临时入口 → `vite build` → 搬运产物。这最大程度降低了与原前端代码的耦合。
- 多城市支持通过**命令行多次传入 `--data`** 实现，比要求用户编写聚合 JSON 更符合 agent 自动化的直觉。

---

## 9. 待决策问题（已确认）

| # | 问题 | 决策 |
|---|------|------|
| 1 | **CLI 工具名称** | 主推 `trip-packer`；备选 `travel-map-cli` / `itinerary-mapper` |
| 2 | **产物中的城市默认值** | 多城市时默认激活第一个传入的城市；支持 `--default-city <cityId>` 显式指定 |
| 3 | **是否暴露 `validate` 子命令** | 是。暴露 `trip-packer validate`，方便 agent 做前置检查 |

---

## 10. 附录

### A. 推荐 CLI 使用示例

```bash
# 安装
npm install -g trip-packer

# 单城市打包
trip-packer build \
  --data ./my-trip/tokyo.json \
  --output ./my-trip/tokyo-map.html

# 多城市打包（默认激活第一个城市）
trip-packer build \
  --data ./my-trip/tokyo.json \
  --data ./my-trip/osaka.json \
  --output ./my-trip/japan-map.html

# 多城市打包（显式指定默认城市）
trip-packer build \
  --data ./my-trip/tokyo.json \
  --data ./my-trip/osaka.json \
  --default-city osaka \
  --output ./my-trip/japan-map.html

# 仅验证数据（不构建）
trip-packer validate --data ./my-trip/tokyo.json --strict

# CI 流水线中使用
npx trip-packer build --data ./data/*.json --output ./dist/ --strict
```

### B. 参考文件
- `src/data/schema.ts` — Zod Schema 定义
- `src/data/index.ts` — 当前城市数据入口
- `src/types/index.ts` — TypeScript 类型定义
- `vite.config.ts` — Vite 构建配置
