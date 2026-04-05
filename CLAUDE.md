# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 React + TypeScript + Vite 的首尔旅行地图应用。使用 Leaflet 地图库展示行程路线，支持多日行程规划可视化。

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Map Library**: Leaflet + react-leaflet
- **Styling**: Tailwind CSS (CDN)
- **Testing**: Vitest + React Testing Library
- **Single File Build**: vite-plugin-singlefile (生成独立 HTML 文件)

## Common Commands

```bash
# 开发服务器
npm run dev

# 构建（输出到 dist/，生成独立 HTML）
npm run build

# 预览构建产物
npm run preview

# 运行测试
npm run test

# 测试监听模式
npm run test:watch
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

### Component Structure

```
src/components/
├── MapView.tsx        # 地图渲染（Leaflet），显示标记和路线
├── Sidebar.tsx        # 侧边栏：行程列表、酒店信息、路线详情
└── TransportModal.tsx # 交通详情弹窗
```

### Key Patterns

1. **数据自描述**: 所有显示信息（包括路径标签）都在数据文件中定义，组件直接渲染不计算
2. **地点类型**: 
   - `hotel_group`: 酒店组，显示"住"字标记
   - `group`: 商圈/景点组，使用字母编号 (A, B, C)
   - `spot`: 具体地点，使用数字编号 (1, 2, 3)
3. **路径点**: `PathPoint` 包含 `label`（显示标签）和可选的 `transit`（交通详情）
4. **多城市支持**: 数据层设计支持多个城市，目前只有首尔 (`seoul`)

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
