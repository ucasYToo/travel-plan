# Export（导出图片）组件文档

## 概述

旅行地图应用支持四种导出模式，生成可直接分享的图片。所有导出都通过 `ExportContainer` + `domToPng` / Playwright 截图完成。

## 四种导出模式

| 模式 | 标识 | 尺寸 | 使用场景 |
|------|------|------|----------|
| 全景横图 | `panorama` | 2560×1440 | 展示完整路线 + 底部 Day Cards 叠加层 |
| 完整竖图 | `itinerary-vertical` | 1080px 宽，高度自适应 | 展示完整路线 + 左侧行程列表 |
| 当天横图 | `day-horizontal` | 2560×1440 | 展示单日路线，左侧紧凑行程卡片 + 右侧地图 |
| 当天竖图 | `day-vertical` | 1080px 宽，高度自适应 | 展示单日路线，上方地图 + 下方行程卡片 |

## 组件复用关系

```
ExportContainer
├── ExportMapView          # 地图渲染（所有模式共用）
├── ExportMapOverlay       # 地图覆盖层（仅 panorama）
├── ExportSidebarContent   # 行程内容渲染（除 panorama 外均使用）
│   └── DayRouteCard       # 单日行程卡片（横/竖当日截图复用）
└── drawExportOverlay      # Canvas 叠加层绘制（panorama / day-horizontal）
```

## `ExportSidebarContent` 渲染规则

`ExportSidebarContent` 通过 `variant` 和 `activeDay` 控制显示内容：

```
variant='default' + activeDay=null    →  itinerary-vertical
variant='default' + activeDay!=null   →  day-vertical
variant='dayHorizontal'               →  day-horizontal
```

### 元素显隐对照表

| 元素 | itinerary-vertical | day-vertical | day-horizontal |
|------|-------------------|--------------|----------------|
| Header（城市/标题/季节） | ✅ | ✅ | ❌（由 Canvas overlay 替代） |
| HotelRow（酒店 chips） | ✅ | ❌ | ❌ |
| SectionTitle（X 日行程） | ✅ | ❌ | ❌ |
| DayPillBar（日期切换 pills） | ✅ | ❌ | ❌ |
| DayHeader（Day X · 标题 · 日期 · 酒店） | ✅（每个 day card） | ✅（单日卡片顶部） | ✅（timeline 顶部） |
| DayNote | ✅ | ✅ | ✅ |
| Timeline（路线节点） | ✅ | ✅ | ✅ |

### 单日行程复用

横屏和竖屏的「当日截图」在行程内容上是**完全一致的**，都通过 `<DayRouteCard />` 渲染：

- **day-vertical**：以 `.dayCard` 卡片样式包裹（带圆角、阴影、白色背景），适合 540px 宽的内容区。
- **day-horizontal**：以 `.dayRouteCompact` 紧凑样式包裹（无卡片外框、更小字号），适配 320px 宽的侧边栏。

两者均包含：
1. `dayHeader`：`Day {day} · {title}` + 日期标签 + 酒店 badge
2. `dayNote`：当日备注
3. `timeline`：地点/交通节点列表

## 已知问题与处理

### dayTitle 截断

`itinerary-vertical` 模式下，底部 Day Cards 中的 `dayTitle` 因 `overflow: hidden` 在某些字体度量下可能出现最后一个字被截断的情况。当前 workaround 是在标题文本末尾追加 `&nbsp;`，为渲染留出额外缓冲。

## 截图流程

### 浏览器端导出（`useMapExporter.ts`）

1. 等待地图瓦片加载完成（`useWaitForTiles`）
2. 短暂延时确保 CSS 动画结束
3. 临时将导出容器设为可见（opacity: 1, zIndex: 1）
4. `domToPng` 生成 base64 图片
5. 对 `panorama` / `day-horizontal` 调用 `drawExportOverlay` 合成 Canvas 叠加层
6. 触发下载

### Playwright 自动化截图（`test-*.mjs`）

用于批量生成高清截图：
1. 启动 headless Chromium
2. 访问本地预览地址（`http://localhost:4174/` 或 `4175`）
3. 点击对应日期和导出按钮
4. 等待 `data-export-mode` 容器出现
5. `element.screenshot()` 保存为 PNG

## 修改建议

如需新增导出模式或调整布局：
1. 优先在 `ExportSidebarContent` 中通过 `variant` + `activeDay` 条件控制，避免复制 JSX
2. 单日行程内容应复用 `DayRouteCard`，只通过 `compact` 切换外框样式
3. Canvas 叠加层文字需同步调整 `drawExportOverlay.ts` 中的字体和坐标
