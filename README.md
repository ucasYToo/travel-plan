# trip-packer

[![npm version](https://badge.fury.io/js/trip-packer.svg)](https://www.npmjs.com/package/trip-packer)

> 从 JSON 行程数据一键打包成独立的旅行地图 HTML 网页。

`trip-packer` 是一个 CLI 工具，它把 React + Vite + Leaflet 的旅行地图应用封装为可全局安装的 npm 包。你只需按固定 Schema 提供城市行程 JSON 数据，一条命令即可生成一个**单一自包含 HTML 文件**，可直接部署到任意静态托管服务。

---

## 特性

- 单命令构建：从 JSON 产出独立 HTML
- 支持多城市：一份 HTML 中切换城市
- 数据校验：复用 Zod Schema，错误信息清晰
- 国家感知的地图底图：国内(`CN`)自动使用高德瓦片，国外使用 CARTO 瓦片
- 无明依赖：产物为单一 HTML，无需服务器

---

## 安装

```bash
npm install -g trip-packer
```

或使用 `npx`（无需安装）：

```bash
npx trip-packer build --data ./tokyo.json --output ./tokyo-map.html
```

---

## 快速开始

### 1. 准备数据

单城市 JSON 示例 `tokyo.json`：

```json
{
  "metadata": {
    "title": "东京旅行攻略",
    "subtitle": "新宿3晚 · 5日往返",
    "mapCenter": { "lat": 35.6895, "lng": 139.6917 },
    "mapZoom": 12,
    "cityLabel": "東京",
    "seasonLabel": "SPRING",
    "flag": "🇯🇵",
    "country": "JP"
  },
  "locations": {
    "shinjuku_hotel": {
      "id": "shinjuku_hotel",
      "name": "新宿格兰贝尔酒店",
      "lat": 35.6938,
      "lng": 139.7034,
      "color": "#3b82f6",
      "type": "hotel_group",
      "description": "歌舞伎町核心地带",
      "address": "東京都新宿区歌舞伎町2-14-5",
      "children": ["shinjuku_gyoen"]
    },
    "shinjuku_gyoen": {
      "id": "shinjuku_gyoen",
      "name": "新宿御苑",
      "type": "spot",
      "lat": 35.6852,
      "lng": 139.71,
      "color": "#10b981",
      "description": "赏樱胜地",
      "address": "東京都新宿区内藤町11",
      "parentId": "shinjuku_hotel"
    }
  },
  "days": [
    {
      "day": 1,
      "title": "东京抵达",
      "note": "入住新宿酒店",
      "baseHotelId": "shinjuku_hotel",
      "path": [
        { "locationId": "shinjuku_hotel", "label": "入住", "isHotel": true }
      ]
    }
  ]
}
```

更多示例见仓库内的 `testData/` 目录（杭州、京都、首尔示例）。

### 2. 构建

```bash
# 单城市
trip-packer build -d tokyo.json -o tokyo-map.html

# 多城市（默认激活第一个城市）
trip-packer build \
  -d tokyo.json \
  -d osaka.json \
  -o japan-trip.html

# 多城市显式指定默认城市
trip-packer build \
  -d tokyo.json \
  -d osaka.json \
  --default-city osaka \
  -o japan-trip.html
```

### 3. 验证数据（仅校验不构建）

```bash
trip-packer validate -d tokyo.json --strict
```

---

## CLI 命令

### `trip-packer build [options]`

| 选项 | 必填 | 说明 |
|------|------|------|
| `-d, --data <path>` | 是 | 城市 JSON 文件路径，可多次指定 |
| `-o, --output <path>` | 否 | 输出路径（文件或目录），默认 `./dist/index.html` |
| `--default-city <cityId>` | 否 | 默认激活的城市 ID（默认第一个传入的城市） |
| `--strict` | 否 | 严格模式，任何警告也视为错误 |
| `--no-validate` | 否 | 跳过数据验证（仅用于调试） |
| `-v, --version` | 否 | 显示 CLI 版本 |
| `-h, --help` | 否 | 显示帮助信息 |

### `trip-packer validate [options]`

| 选项 | 必填 | 说明 |
|------|------|------|
| `-d, --data <path>` | 是 | 城市 JSON 文件路径，可多次指定 |
| `--strict` | 否 | 严格模式 |
| `-h, --help` | 否 | 显示帮助信息 |

### 退出码

- `0` — 成功
- `1` — 通用错误（验证失败、构建失败、文件不存在等）
- `2` — 命令行参数错误（如 `--default-city` 指定的城市不存在）

---

## JSON Schema

数据格式定义在 `src/data/schema.ts`，核心结构如下：

### `metadata`

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 主标题 |
| `subtitle` | `string` | 副标题 |
| `mapCenter` | `{ lat, lng }` | 地图默认中心（可选） |
| `mapZoom` | `number` | 默认缩放级别（可选） |
| `cityLabel` | `string` | 城市本地名（可选） |
| `seasonLabel` | `string` | 季节标签（可选） |
| `flag` | `string` | Emoji 国旗（可选） |
| `country` | `string` | **ISO 国家代码**（如 `CN`、`JP`、`KR`），决定瓦片源 |

### `locations`

地点字典，按 `id` 索引。支持两种类型：

- **`spot`**：具体地点（景点、餐厅、店铺），需有 `parentId` 指向所属组
- **`group` / `hotel_group`**：地点组（商圈/酒店），包含 `children`（子地点 id 列表）

### `days`

每日行程数组，每个元素包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| `day` | `number` | 第几天（从 1 开始） |
| `title` | `string` | 当日标题 |
| `note` | `string` | 当日备注 |
| `baseHotelId` | `string` | 当日住宿酒店 ID |
| `path` | `PathPoint[]` | 当日完整路径 |

#### `PathPoint`

```json
{
  "locationId": "shinjuku_gyoen",
  "label": "步行 · 约15分钟",
  "isHotel": false,
  "transit": { ... },
  "notes": [ ... ]
}
```

---

## 地图瓦片与国家代码

`country` 字段控制地图底图源：

- **`"CN"`** → 使用[高德地图](https://www.amap.com/)瓦片（国内访问友好）
- **其他/未设置** → 使用 CARTO CDN 瓦片

示例：

```json
{
  "metadata": {
    "title": "杭州三日游",
    "country": "CN"
  }
}
```

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 构建前端产物（dist/index.html）
npm run build

# 编译 CLI
npm run build:cli

# 运行测试
npm run test
```

---

## 项目结构

```
.
├── bin/trip-packer.js          # CLI 入口
├── cli/                        # CLI 源码
│   ├── index.ts                # Commander 入口
│   ├── commands/               # build / validate 命令
│   └── lib/                    # 数据加载、临时项目、输出处理
├── src/                        # React 前端源码
│   ├── data/
│   │   ├── schema.ts           # Zod Schema
│   │   └── cities/             # 示例城市数据
│   ├── components/
│   │   ├── MapView.tsx         # 地图视图
│   │   └── SmartTileLayer.tsx  # 智能瓦片层（按国家切换源）
│   └── utils/tileSource.ts     # 瓦片源配置
├── testData/                   # 测试 JSON（杭州、京都等）
└── vite.config.ts              # Vite 构建配置
```

---

## License

MIT
