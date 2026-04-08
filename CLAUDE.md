# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 React + TypeScript + Vite 的首尔旅行地图应用。使用 Leaflet 地图库展示行程路线，支持多日行程规划可视化。

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Map Library**: Leaflet + react-leaflet
- **Styling**: Tailwind CSS (CDN) + CSS Modules (`.module.css`)
- **Testing**: Vitest + React Testing Library (jsdom)
- **Screenshot Tool**: Playwright (`screenshot.mjs`)
- **Single File Build**: `vite-plugin-singlefile` (生成独立 HTML 文件)

## Common Commands

```bash
# 开发服务器
npm run dev

# 构建（输出到 dist/index.html，所有资源内联）
npm run build

# 预览构建产物
npm run preview

# 运行全部测试
npm run test

# 运行单个测试文件
npx vitest run src/components/MapControls.test.tsx

# 测试监听模式
npm run test:watch

# 生成截图（需先启动预览服务器在 5174 端口）
node screenshot.mjs
```

## Architecture

### Data Flow

数据完全自包含，组件纯渲染，无需计算层：

```
src/data/seoul/locations.ts  →  地点坐标数据
src/data/seoul/days.ts       →  每日行程数据（含交通详情）
src/data/seoul/index.ts      →  城市数据聚合
src/data/index.ts            →  多城市数据入口
```

### Type System

核心类型定义在 `src/types/index.ts`：

- `Location` / `LocationGroup`: 地点和地点组（商圈/酒店）
- `DayPlan`: 单日行程，包含 `PathPoint[]` 路径数组
- `TransitDetail`: 两点间交通方案（距离、时长、步骤）
- `ItineraryData`: 完整行程数据，自描述可直接渲染

### UI Architecture

`App.tsx` 管理全局状态（当前城市、选中日期、详情面板）。响应式布局：

- **Desktop**: 左侧固定面板（行程概览）+ 右侧固定面板（地点/交通详情）
- **Mobile**: 地图全屏 + `BottomSheet` 弹层（行程列表和详情分别在不同 BottomSheet 中）

用户设置（如显示地点名称、显示交通标签）持久化在 `localStorage` 键 `travel-map-settings` 中。

### Key Patterns

1. **数据自描述**: 所有显示信息（包括路径标签）都在数据文件中定义，组件直接渲染不计算
2. **地点类型**:
   - `hotel_group`: 酒店组，显示"住"字标记
   - `group`: 商圈/景点组，使用字母编号 (A, B, C)
   - `spot`: 具体地点，使用数字编号 (1, 2, 3)
3. **路径点**: `PathPoint` 包含 `label`（显示标签）和可选的 `transit`（交通详情）
4. **多城市支持**: 数据层设计支持多个城市，目前只有首尔 (`seoul`)

### Utility Scripts

- `scripts/download-tiles.ts` - 下载离线地图瓦片，供 `SmartTileLayer` 本地回退使用

## Transit Data Sources

交通时间数据来源：

- 首尔地铁 API (via vercel-proxy-henna-eight.vercel.app)
- 步行距离使用 Haversine 公式估算
- 部分数据通过 WebSearch 验证

## Testing

- 使用 Vitest + jsdom
- 测试文件：`*.test.tsx`
- Coverage 配置排除了数据文件和主组件
- 测试设置：`src/test/setup.ts`

## Build Output

使用 `vite-plugin-singlefile` 生成独立 HTML 文件，所有资源内联：

- 输出：`dist/index.html`
- 可直接部署到任何静态托管服务

## Command System

项目级 Claude Command 和 Agent，位于 `.claude/` 目录。

### Command: `/travel`

文件：`.claude/commands/travel.md`

用户入口，解析意图后调用 `travel-planner` Agent 执行具体规划。

### Agent: `travel-planner`

文件：`.claude/agents/travel-planner.md`

完整 Agent 定义（Markdown + YAML frontmatter）：

- **Tools**: Read, Write, Edit, WebSearch, WebFetch, Bash
- **Ownership**: 拥有 `src/data/seoul/locations.ts` 和 `days.ts` 的修改权限
- **Logic**: 核心算法（距离计算、日期评分、地铁 API 调用）内联在文档中

#### Workflow

1. Read 数据文件 → 了解现有行程
2. WebSearch 搜索地点 → 获取名称/地址/坐标
3. 计算距离 → 500米内分配到商圈
4. 评分推荐日期 → 距离/商圈匹配/容量
5. 规划交通 → <500m步行，>1.5km调用首尔地铁 API
6. Present 方案 → 用户确认
7. Write 数据文件 → 更新 locations.ts + days.ts
8. Bash 测试 → `npm run test && npm run build`

#### Seoul Metro API

```
https://vercel-proxy-henna-eight.vercel.app/api/seoul-metro?start={韩文起点}&end={韩文终点}

常用站点：공덕(孔德), 홍대입구(弘大入口), 이태원(梨泰院), 여의도(汝矣岛), 성수(圣水)
```
