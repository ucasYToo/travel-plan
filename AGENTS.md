# AGENTS.md

本文件是 Codex 在本仓库工作的项目级指南。说明以当前代码为准；如果文档与实现冲突，先核对 `package.json`、`src/data/schema.ts` 和相关测试，再同步更新文档。

## 项目定位

`trip-packer` 同时包含两部分：

1. React + TypeScript + Leaflet 的旅行地图前端，可展示多城市、多日行程与交通详情，并导出分享图片。
2. 可发布到 npm 的 CLI，把一个或多个行程 JSON 校验后打包成独立 HTML。

当前内置示例城市为首尔和成都。产品不是“仅首尔行程页面”，实现与文档都应保持通用、多城市导向。

## 技术栈与约束

- React 18、TypeScript、Vite 5
- Leaflet / react-leaflet
- CSS Modules + `src/index.css` 全局设计令牌和 reset；项目不使用 Tailwind
- Zod 4 校验 JSON 数据
- Vitest + React Testing Library
- `modern-screenshot` 负责浏览器内图片导出
- Playwright 负责 CLI 构建截图与视觉回归
- `vite-plugin-singlefile` 生成自包含 HTML

不要重新引入依赖 CDN 的样式框架。独立 HTML 必须保持可离线分发，地图瓦片本身除外。

## 常用命令

```bash
npm install
npm run dev
npm run test
npm run build
npm run build:cli
```

单测与数据校验：

```bash
npx vitest run src/components/MapControls.test.tsx
npx vitest run src/components/export/ExportPanel.test.tsx
node bin/trip-packer.js validate -d testData/tokyo.json --strict
```

生成桌面端与移动端基准截图时使用生产预览，避免开发模块加载和 HMR 干扰截图：

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
npm run screenshot
```

若预览服务使用了其他端口，把实际 URL 传给 `SCREENSHOT_URL`。截图默认写入 `screenshots/desktop.png` 和 `screenshots/mobile.png`。

## 代码结构

```text
src/
├── App.tsx                         # 全局 UI、选中状态、面板和导出队列
├── data/
│   ├── cities/*.json               # 内置城市数据
│   ├── index.ts                    # 城市注册表与默认城市
│   └── schema.ts                   # CLI/数据层共用的 Zod Schema
├── components/
│   ├── MapView.tsx                 # 交互地图、标记和路线
│   ├── MapController.tsx           # fitBounds、缩放与视口遮挡边距
│   ├── MapControls.tsx             # 城市、日期、显示设置与导出入口
│   ├── BottomSheet.tsx             # 移动端行程/详情抽屉
│   ├── content/                    # 侧栏、时间线和详情内容
│   └── export/                     # 四种图片导出布局与截图流水线
└── types/index.ts                  # 前端领域类型

cli/
├── commands/build.ts               # JSON → 临时 Vite 项目 → 单 HTML
├── commands/validate.ts            # 数据校验命令
└── lib/                            # 数据加载、截图、日志与输出
```

## 数据模型与修改规则

- `src/data/schema.ts` 是外部 JSON 的运行时真源；`src/types/index.ts` 是前端编译期类型。字段变化必须同步两处并补测试。
- `src/data/index.ts` 注册内置城市。新增 `src/data/cities/*.json` 后还要更新 `CITIES` 和 `CITY_OPTIONS`。
- `locations` 是按 ID 索引的字典。`spot.parentId`、`group.children`、`day.baseHotelId` 和 `day.path[].locationId` 必须保持引用完整。
- `PathPoint.label` 是路线段的显示文案；详细换乘信息放在 `transit`，组件不应从文案反推交通逻辑。
- 国内城市通过 `metadata.country === "CN"` 选择高德瓦片，其他国家使用 CARTO/OSM 体系。

修改数据后至少运行数据测试、完整测试和构建。涉及 CLI 输入时同时运行严格校验。

## 响应式 UI 约定

- 桌面断点统一为 `1024px`。修改时同步检查 `App.module.css`、`MapControls.module.css`、`BottomSheet.module.css` 和导出按钮样式。
- 桌面端使用左右固定侧栏；移动/平板使用 Bottom Sheet。不要让两个布局在同一断点同时出现或同时消失。
- 地图 `fitBounds` 必须考虑顶部控件、侧栏和 Bottom Sheet 的遮挡，相关参数通过 `MapViewportPadding` 传入。
- 全局 reset 位于 `src/index.css`。组件尺寸依赖 `body` 无默认 margin、标题段落 margin 清零和 `box-sizing: border-box`，不要删除这些基础规则。
- 地图总览会按缩放级别降低地点标签密度；单日路线仍显示完整标签。新增标签时优先避免遮挡，而不是无条件显示所有文字。
- iOS 安全区使用 `env(safe-area-inset-*)`；移动端交互区需保留可滚动和至少可键盘操作的路径。

## 图片导出

四种模式定义在 `src/components/export/utils.ts`：

- `panorama`：2560×1440 全景横图
- `day-horizontal`：2560×1440 单日横图
- `day-vertical`：1080px 宽单日竖图，高度自适应
- `itinerary-vertical`：1080px 宽完整竖图，高度自适应

关键约定：

- `ExportContainer` 渲染隐藏的固定尺寸地图和行程内容。
- 横图的水印/摘要只由 `drawExportOverlay.ts` 在 Canvas 阶段绘制一次；不要同时加入 DOM 覆盖层，否则成图会重复。
- 导出容器必须关闭入场动画并强制相关内容为可见，避免截图停在延迟动画中间。
- `useMapExporter` 必须在成功或失败时恢复临时样式，并清理瓦片追踪状态。
- CLI `--images` 优先使用系统 Chrome/Chromium/Edge，也支持 `PLAYWRIGHT_EXECUTABLE_PATH`；不要假设 `playwright-core` 自带浏览器二进制。
- 修改导出布局后同时检查浏览器下载结果和 Playwright 元素截图，至少覆盖全景、最长单日、完整竖图。

`scripts/tests/` 中部分旧调试脚本仍带历史机器路径或固定端口；不要把它们当成通用入口。通用页面回归使用 `npm run screenshot`，新增自动化脚本必须使用 `process.cwd()`、环境变量或临时目录。

## CLI 构建流程

CLI 会创建临时项目、注入城市数据并调用 Vite 构建。`vite.config.ts` 使用 `emptyOutDir: false`，避免前端构建删除 `dist/cli`。改动 `cli/lib/temp-project.ts`、模板复制范围、`package.json.files` 或 Vite 配置时，需要同时验证：

1. `npm run build:cli`
2. CLI 单城市构建
3. CLI 多城市构建与默认城市选择
4. 输出仍是单个可打开的 HTML

不要手工编辑 `dist/` 产物；应修源码后重新构建。

## 测试与交付清单

按改动风险选择验证，UI/导出改动通常至少执行：

```bash
npm run test
npm run build
npm run build:cli
npm run screenshot
```

视觉检查至少覆盖：

- 1280×800 桌面端
- 375×812 移动端
- 一个 1024px 左右的断点尺寸
- 默认全景和一个路线点较多的单日
- 打开地点详情、交通详情和导出面板后的遮挡关系

提交前查看 `git status`，保留用户已有的无关改动。锁文件、生成截图和测试输出只有在本次任务确实改变它们时才更新。
