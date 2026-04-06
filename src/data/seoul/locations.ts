import type { Location, LocationGroup } from '../../types'

/**
 * 首尔行程地点数据
 * 商圈(group)和地点(spot)为两级结构，path中只引用spot和hotel_group
 */

// ===== 酒店商圈组 =====
export const seoulHotels: Record<string, LocationGroup> = {
  mapo_glad_group: {
    id: 'mapo_glad_group',
    name: '麻浦格莱德酒店',
    lat: 37.5415,
    lng: 126.9500,
    color: '#3b82f6',
    type: 'hotel_group',
    description: '孔德站8号出口 · 机场铁路直达 · 住2晚',
    address: '서울 마포구 도화동 155-2',
    children: ['fritz', 'jinsook']
  },
  aank_itaewon_group: {
    id: 'aank_itaewon_group',
    name: 'Aank Hotel 梨泰院店',
    lat: 37.5345,
    lng: 126.9946,
    color: '#8b5cf6',
    type: 'hotel_group',
    description: '梨泰院商圈步行范围 · 国际化街区 · 住3晚',
    address: '서울 용산구 이태원로 179',
    children: []
  }
}

// ===== 商圈组 =====
export const seoulDistricts: Record<string, LocationGroup> = {
  hongdae: {
    id: 'hongdae',
    name: '弘大商圈',
    lat: 37.5563,
    lng: 126.9230,
    color: '#8b5cf6',
    type: 'group',
    description: '年轻文化 · 夜生活 · 街头艺术',
    address: '서울 마포구 홍익로',
    children: ['hongdae_main', 'hair_salon']
  },
  yeouido: {
    id: 'yeouido',
    name: '汝矣岛现代百货',
    lat: 37.5260,
    lng: 126.9280,
    color: '#ec4899',
    type: 'group',
    description: '高端购物 · 网红打卡 · Starfield图书馆',
    address: '서울 영등포구 여의대로 108',
    children: ['yeouido_hyundai']
  },
  hannam: {
    id: 'hannam',
    name: '汉南洞商圈',
    lat: 37.5370,
    lng: 127.0010,
    color: '#f59e0b',
    type: 'group',
    description: '小众设计师品牌 · 咖啡文化',
    address: '서울 용산구 한남동',
    children: ['hannam_street']
  },
  hangang_hannam: {
    id: 'hangang_hannam',
    name: '汉江公园(汉南段)',
    lat: 37.5235,
    lng: 127.0005,
    color: '#10b981',
    type: 'group',
    description: '汉江边散步·骑行·野餐 · 距汉南洞约10分钟',
    address: '서울 용산구 이촌동 302-17',
    children: ['hangang_hannam_park']
  },
  seongsu: {
    id: 'seongsu',
    name: '圣水洞',
    lat: 37.5443,
    lng: 127.0557,
    color: '#10b981',
    type: 'group',
    description: '文创园区 · 时尚概念店',
    address: '서울 성동구 성수동',
    children: ['seongsu_entrance', 'gwonski', 'dukchim']
  },
  seochon: {
    id: 'seochon',
    name: '西村',
    lat: 37.5803,
    lng: 126.9692,
    color: '#3b82f6',
    type: 'group',
    description: '景福宫西侧 · 文创小店 · 韩屋咖啡',
    address: '서울 종로구 통의동',
    children: ['papier_prost']
  },
  shilla: {
    id: 'shilla',
    name: '新罗百货',
    lat: 37.5561,
    lng: 127.0098,
    color: '#f97316',
    type: 'group',
    description: '免税购物天堂 · 高端品牌云集',
    address: '서울 중구 동호로 249',
    children: ['shilla_dutyfree']
  },
  shinsegae: {
    id: 'shinsegae',
    name: '新世界百货',
    lat: 37.5598,
    lng: 126.9815,
    color: '#14b8a6',
    type: 'group',
    description: '百年老店 · 奢华购物地标',
    address: '서울 중구 소공로 63',
    children: ['shinsegae_main']
  },
  myeongdong: {
    id: 'myeongdong',
    name: '明洞',
    lat: 37.5612,
    lng: 126.9879,
    color: '#f59e0b',
    type: 'group',
    description: '购物天堂 · 美食聚集地',
    address: '서울 중구 명동',
    children: ['myeongdong_street']
  },
  narita_airport: {
    id: 'narita_airport',
    name: '仁川国际机场',
    lat: 37.4602,
    lng: 126.4407,
    color: '#6b7280',
    type: 'group',
    description: '韩国主要国际机场',
    address: '인천 중구 공항로 272',
    children: ['incheon_airport_t1']
  }
}

// ===== 具体地点（子地点）=====
export const seoulSpots: Record<string, Location> = {
  // 麻浦格莱德酒店周边
  fritz: {
    id: 'fritz',
    name: 'Fritz Coffee Company',
    type: 'spot',
    lat: 37.5423,
    lng: 126.9493,
    color: '#78350f',
    description: '孔德店 · 复古韩屋风格 · 小海豹烘焙',
    address: '서울 마포구 새창로2길 17',
    parentId: 'mapo_glad_group'
  },
  jinsook: {
    id: 'jinsook',
    name: '金熟成 麻浦站店',
    type: 'spot',
    lat: 37.5395,
    lng: 126.9457,
    color: '#ef4444',
    description: '麻浦区本地人气烤肉店 · 桃花街14-1',
    address: '서울 마포구 도화동 37-1',
    parentId: 'mapo_glad_group'
  },

  // 弘大商圈
  hongdae_main: {
    id: 'hongdae_main',
    name: '弘大主街',
    type: 'spot',
    lat: 37.5563,
    lng: 126.9230,
    color: '#8b5cf6',
    description: '弘大商圈核心街区 · 街头文化聚集地',
    address: '서울 마포구 홍익로',
    parentId: 'hongdae'
  },
  hair_salon: {
    id: 'hair_salon',
    name: '理发段 홍대 미용실',
    type: 'spot',
    lat: 37.5555,
    lng: 126.9235,
    color: '#f97316',
    description: '弘大理发店 · 양화로11길 14-10 1층 101호',
    address: '서울 마포구 양화로11길 14-10',
    parentId: 'hongdae'
  },

  // 汝矣岛
  yeouido_hyundai: {
    id: 'yeouido_hyundai',
    name: '汝矣岛现代百货',
    type: 'spot',
    lat: 37.5260,
    lng: 126.9280,
    color: '#ec4899',
    description: 'The Hyundai Seoul · Starfield图书馆',
    address: '서울 영등포구 여의대로 108',
    parentId: 'yeouido'
  },

  // 汉南洞
  hannam_street: {
    id: 'hannam_street',
    name: '汉南洞主街',
    type: 'spot',
    lat: 37.5370,
    lng: 127.0010,
    color: '#f59e0b',
    description: '汉南洞设计师品牌街区 · 汉江镇站3号出口',
    address: '서울 용산구 한남동',
    parentId: 'hannam'
  },

  // 汉江公园
  hangang_hannam_park: {
    id: 'hangang_hannam_park',
    name: '汉江公园(汉南段)',
    type: 'spot',
    lat: 37.5235,
    lng: 127.0005,
    color: '#10b981',
    description: '汉南大桥北侧 · 散步骑行野餐',
    address: '서울 용산구 이촌동 302-17',
    parentId: 'hangang_hannam'
  },

  // 圣水洞
  seongsu_entrance: {
    id: 'seongsu_entrance',
    name: '圣水洞主街',
    type: 'spot',
    lat: 37.5443,
    lng: 127.0557,
    color: '#10b981',
    description: '圣水洞商圈入口 · 圣水站4号出口',
    address: '서울 성동구 성수동',
    parentId: 'seongsu'
  },
  gwonski: {
    id: 'gwonski',
    name: '권식족발 (Gwonski猪蹄)',
    type: 'spot',
    lat: 37.5440,
    lng: 127.0550,
    color: '#ef4444',
    description: '圣水洞人气猪蹄店 · 峨嵋山路7街4号',
    address: '서울 성동구 아차산로7길 4',
    parentId: 'seongsu'
  },
  dukchim: {
    id: 'dukchim',
    name: '두찜(辣炖鸡) 圣水店',
    type: 'spot',
    lat: 37.5432,
    lng: 127.0553,
    color: '#ef4444',
    description: '圣水洞辣炖鸡/炖鸡专门店 · 圣水一路8街5号1楼',
    address: '서울 성동구 성수이로8길 5',
    parentId: 'seongsu'
  },

  // 西村
  papier_prost: {
    id: 'papier_prost',
    name: '파피어프로스트 (Papier Prost)',
    type: 'spot',
    lat: 37.5803,
    lng: 126.9692,
    color: '#3b82f6',
    description: '西村文创文具店 · 手帐·贴纸·生活杂货',
    address: '서울 종로구 자하문로7길 68-4 1층',
    parentId: 'seochon'
  },

  // 新罗
  shilla_dutyfree: {
    id: 'shilla_dutyfree',
    name: '新罗免税店',
    type: 'spot',
    lat: 37.5561,
    lng: 127.0098,
    color: '#f97316',
    description: '新罗免税购物天堂 · 高端品牌云集',
    address: '서울 중구 동호로 249',
    parentId: 'shilla'
  },

  // 新世界
  shinsegae_main: {
    id: 'shinsegae_main',
    name: '新世界百货本店',
    type: 'spot',
    lat: 37.5598,
    lng: 126.9815,
    color: '#14b8a6',
    description: '明洞新世界百货本店 · 百年奢华购物地标',
    address: '서울 중구 소공로 63',
    parentId: 'shinsegae'
  },

  // 明洞
  myeongdong_street: {
    id: 'myeongdong_street',
    name: '明洞主街',
    type: 'spot',
    lat: 37.5612,
    lng: 126.9879,
    color: '#f59e0b',
    description: '明洞购物美食主街',
    address: '서울 중구 명동',
    parentId: 'myeongdong'
  },

  // 仁川机场
  incheon_airport_t1: {
    id: 'incheon_airport_t1',
    name: '仁川国际机场T1航站楼',
    type: 'spot',
    lat: 37.4602,
    lng: 126.4407,
    color: '#6b7280',
    description: '韩国主要国际机场 · T1航站楼',
    address: '인천 중구 공항로 272',
    parentId: 'narita_airport'
  }
}

// 兼容导出：合并所有地点数据
export const seoulLocations = {
  ...seoulHotels,
  ...seoulDistricts,
  ...seoulSpots
}
