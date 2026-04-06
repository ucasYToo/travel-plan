import type { DayPlan } from '../../types'

/**
 * 首尔行程每日规划
 * 使用 LocationGroup ID 作为酒店引用，path 中只引用 spot 和 hotel_group
 */
export const seoulDays: DayPlan[] = [
  // Day 1: 抵达日 (2026-04-29)
  {
    day: 1,
    date: '2026-04-29',
    title: '抵达首尔',
    note: '大韩航空 KE108 杭州萧山→首尔仁川（约14:40出发/18:05到达 KST）。机场铁路直达孔德站，入住麻浦格莱德酒店。',
    baseHotelId: 'mapo_glad_group',
    path: [
      {
        locationId: 'incheon_airport_t1',
        label: '仁川国际机场',
        transit: {
          distance: '约45公里',
          duration: '约60分钟',
          startName: '仁川国际机场',
          endName: '麻浦格莱德酒店',
          steps: [
            { mode: 'walk', from: '仁川国际机场T1/T2', to: '机场铁路入口', duration: '约5分钟', distance: '约300米', instruction: '跟随机场铁路 (AREX) 指示牌前往地下1层乘车口' },
            { mode: 'train', line: '机场铁路 (AREX) 直达列车', from: '仁川国际机场', to: '孔德站', duration: '约50分钟', distance: '约45公里', instruction: '乘坐机场铁路直达列车，无需换乘，孔德站下车' },
            { mode: 'walk', from: '孔德站8号出口', to: '麻浦格莱德酒店', duration: '约5分钟', distance: '约150米', instruction: '8号出口出站后步行约1分钟即达酒店正门' }
          ]
        },
        notes: [
          { category: 'tips', content: '抵达后先更换手机卡，机场有SK/KT/LG运营商柜台，推荐提前淘宝购买流量卡' }
        ]
      },
      {
        locationId: 'mapo_glad_group',
        label: '机场铁路直达 · 约60分钟',
        isHotel: true
      }
    ]
  },

  // Day 2: 西线双城记 (2026-04-30)
  {
    day: 2,
    date: '2026-04-30',
    title: '西线双城记',
    note: '早餐后先去酒店隔壁的Fritz Coffee买一杯咖啡+可颂，上午弘大潮流游+理发店(양화로11길 14-10)+保承会馆汤饭+Oats Coffee，傍晚汝矣岛日落+灯光秀+Starfield图书馆，晚上回酒店附近吃金熟成烤肉',
    baseHotelId: 'mapo_glad_group',
    path: [
      { locationId: 'mapo_glad_group', label: '起点', isHotel: true },
      {
        locationId: 'fritz',
        label: '步行 · 约5分钟',
        transit: {
          distance: '约300米',
          duration: '约5分钟',
          startName: '麻浦格莱德酒店',
          endName: 'Fritz Coffee Company',
          steps: [
            { mode: 'walk', from: '麻浦格莱德酒店', to: 'Fritz Coffee Company', duration: '约5分钟', distance: '约300米', instruction: '出酒店右转，沿孔德站方向步行约2分钟即可到达' }
          ]
        }
      },
      {
        locationId: 'hongdae_main',
        label: '机场铁路/京义线 · 约8分钟',
        transit: {
          distance: '约2.5公里',
          duration: '约8分钟',
          startName: 'Fritz Coffee Company/孔德站',
          endName: '弘大主街',
          steps: [
            { mode: 'walk', from: 'Fritz Coffee Company', to: '孔德站', duration: '约3分钟', distance: '约150米', instruction: '返回孔德站' },
            { mode: 'subway', line: '机场铁路/京义线', from: '孔德站', to: '弘益大学站', duration: '约3分钟', distance: '约2.3公里', instruction: '乘坐机场铁路或京义线至弘益大学站下车' },
            { mode: 'walk', from: '弘益大学站9号出口', to: '弘大主街', duration: '约2分钟', distance: '约100米', instruction: '9号出口出站即进入弘大商圈主街' }
          ]
        },
        notes: [
          { category: 'food', content: '在延南洞吃朝鲜火炉烤肉（돈주는남자），招牌是厚切五花肉' },
          { category: 'shopping', content: 'thisisneverthat 韩国潮牌，价格亲民设计好，弘大店常有折扣' },
          { category: 'shopping', content: 'LMC (Lifework) 街头风格，T恤和卫衣很受欢迎' },
          { category: 'tips', content: '弘大主街人很多，建议往延南洞小巷走，更有氛围' }
        ]
      },
      {
        locationId: 'hair_salon',
        label: '步行 · 约7分钟',
        transit: {
          distance: '约500米',
          duration: '约7分钟',
          startName: '弘大主街',
          endName: '홍대 미용실',
          steps: [
            { mode: 'walk', from: '弘大主街', to: '양화로11길 14-10', duration: '约7分钟', distance: '约500米', instruction: '从弘大主街步行至양화로11길 14-10 1층 101호' }
          ]
        }
      },
      {
        locationId: 'boseung',
        label: '步行 · 约12分钟',
        transit: {
          distance: '约900米',
          duration: '约12分钟',
          startName: '理发店 홍대 미용실',
          endName: '保承会馆 보승회관',
          steps: [
            { mode: 'walk', from: '홍대 미용실', to: '弘益大学站', duration: '约5分钟', distance: '约400米', instruction: '从理发店步行返回弘益大学站' },
            { mode: 'walk', from: '弘益大学站8号出口', to: '保承会馆', duration: '约7分钟', distance: '约500米', instruction: '从弘大入口站8号出口步行至어울마당로 131（2楼）' }
          ]
        }
      },
      {
        locationId: 'oats',
        label: '步行 · 约12分钟',
        transit: {
          distance: '约900米',
          duration: '约12分钟',
          startName: '保承会馆 보승회관',
          endName: 'Oats Coffee 延南店',
          steps: [
            { mode: 'walk', from: '保承会馆', to: '弘益大学站2号出口方向', duration: '约5分钟', distance: '约400米', instruction: '从保承会馆步行至弘大入口站2号出口方向' },
            { mode: 'walk', from: '弘大入口站2号出口', to: 'Oats Coffee', duration: '约7分钟', distance: '约500米', instruction: '穿过延南洞步行至성미산로29길 29-8' }
          ]
        }
      },
      {
        locationId: 'yeouido_hyundai',
        label: '京义线→5号线 · 约25分钟',
        transit: {
          distance: '约6.5公里',
          duration: '约25分钟',
          startName: 'Oats Coffee 延南店',
          endName: '汝矣岛现代百货',
          steps: [
            { mode: 'walk', from: 'Oats Coffee', to: '加佐站', duration: '约8分钟', distance: '约600米', instruction: '从Oats Coffee步行至加佐站' },
            { mode: 'subway', line: '京义线', from: '加佐站', to: '孔德站', duration: '约5分钟', distance: '约2.7公里', instruction: '乘坐京义线至孔德站' },
            { mode: 'subway', line: '首尔地铁5号线', from: '孔德站', to: '汝矣渡口站', duration: '约7分钟', distance: '约2.6公里', instruction: '换乘5号线至汝矣渡口站下车' },
            { mode: 'walk', from: '汝矣渡口站3号出口', to: '汝矣岛现代百货', duration: '约5分钟', distance: '约400米', instruction: '经地下通道连接现代百货B2层，或从地面步行至正门' }
          ]
        },
        notes: [
          { category: 'food', content: '现代百货B1层有很多美食，推荐尝试' },
          { category: 'shopping', content: 'Starfield图书馆在现代百货5-6层，拍照打卡很美' },
          { category: 'tips', content: '傍晚去汉江公园看日落，然后回来看夜景灯光秀' }
        ]
      },
      {
        locationId: 'jinsook',
        label: '地铁5号线+步行 · 约16分钟',
        transit: {
          distance: '约3.3公里',
          duration: '约16分钟',
          startName: '汝矣岛现代百货',
          endName: '金熟成 麻浦站店',
          steps: [
            { mode: 'walk', from: '汝矣岛现代百货', to: '汝矣渡口站', duration: '约3分钟', distance: '约400米', instruction: '返回汝矣渡口站' },
            { mode: 'subway', line: '首尔地铁5号线', from: '汝矣渡口站', to: '孔德站', duration: '约4分钟', distance: '约2.6公里', instruction: '乘坐5号线至孔德站下车' },
            { mode: 'walk', from: '孔德站', to: '金熟成 麻浦站店', duration: '约9分钟', distance: '约700米', instruction: '从孔德站步行至桃花街14-1，金熟成烤肉店' }
          ]
        }
      },
      {
        locationId: 'mapo_glad_group',
        label: '返回酒店 · 约5分钟',
        isHotel: true,
        transit: {
          distance: '约300米',
          duration: '约5分钟',
          startName: '金熟成烤肉',
          endName: '麻浦格莱德酒店',
          steps: [
            { mode: 'walk', from: '金熟成烤肉', to: '麻浦格莱德酒店', duration: '约5分钟', distance: '约300米', instruction: '从金熟成烤肉步行返回酒店' }
          ]
        }
      }
    ]
  },

  // Day 3: 汉南洞+汉江公园·搬家日 (2026-05-01)
  {
    day: 3,
    date: '2026-05-01',
    title: '搬家日·新罗免税+汉南洞+汉江公园',
    note: '早上从麻浦格莱德退房，前往梨泰院Aank酒店办理入住放行李，上午新罗免税店采购，下午汉南洞设计师品牌、咖啡漫游，傍晚汉江公园散步吹风。',
    baseHotelId: 'aank_itaewon_group',
    path: [
      { locationId: 'mapo_glad_group', label: '起点（退房日）', isHotel: true },
      {
        locationId: 'aank_itaewon_group',
        label: '地铁6号线 · 约15分钟',
        isHotel: true,
        transit: {
          distance: '约4.0公里',
          duration: '约15分钟',
          startName: '麻浦格莱德酒店',
          endName: 'Aank Hotel 梨泰院店',
          steps: [
            { mode: 'walk', from: '麻浦格莱德酒店', to: '孔德站', duration: '约3分钟', distance: '约100米', instruction: '携带行李步行至孔德站' },
            { mode: 'subway', line: '首尔地铁6号线', from: '孔德站', to: '梨泰院站', duration: '约7分钟', distance: '约4.0公里', instruction: '乘坐6号线直达梨泰院站，无需换乘' },
            { mode: 'walk', from: '梨泰院站', to: 'Aank Hotel 梨泰院店', duration: '约5分钟', distance: '约300米', instruction: '从梨泰院站步行至酒店办理入住，放下行李' }
          ]
        }
      },
      {
        locationId: 'shilla_dutyfree',
        label: '地铁6→3号线 · 约18分钟',
        transit: {
          distance: '约3.5公里',
          duration: '约18分钟',
          startName: '梨泰院Aank酒店',
          endName: '新罗免税店',
          steps: [
            { mode: 'walk', from: 'Aank Hotel 梨泰院店', to: '梨泰院站', duration: '约5分钟', distance: '约300米', instruction: '步行至梨泰院地铁站' },
            { mode: 'subway', line: '首尔地铁6号线', from: '梨泰院站', to: '药水站', duration: '约8分钟', distance: '约2.5公里', instruction: '乘坐6号线至药水站下车' },
            { mode: 'subway', line: '首尔地铁3号线', from: '药水站', to: '东国大学站', duration: '约2分钟', distance: '约1.0公里', instruction: '换乘3号线至东国大学站下车' },
            { mode: 'walk', from: '东国大学站5号出口', to: '新罗免税店', duration: '约5分钟', distance: '约400米', instruction: '5号出口出站后沿南山公园方向上坡步行至新罗免税店' }
          ]
        }
      },
      {
        locationId: 'hannam_street',
        label: '地铁3→6号线+步行 · 约20分钟',
        transit: {
          distance: '约3.0公里',
          duration: '约20分钟',
          startName: '新罗免税店',
          endName: '汉南洞主街',
          steps: [
            { mode: 'walk', from: '新罗免税店', to: '东国大学站', duration: '约5分钟', distance: '约400米', instruction: '步行返回东国大学站' },
            { mode: 'subway', line: '首尔地铁3号线', from: '东国大学站', to: '药水站', duration: '约2分钟', distance: '约1.0公里', instruction: '乘坐3号线至药水站' },
            { mode: 'subway', line: '首尔地铁6号线', from: '药水站', to: '梨泰院站', duration: '约8分钟', distance: '约2.5公里', instruction: '换乘6号线返回梨泰院方向' },
            { mode: 'walk', from: '梨泰院站', to: '汉南洞主街', duration: '约5分钟', distance: '约400米', instruction: '从梨泰院站步行至汉南洞商圈（汉江镇站方向爬坡）' }
          ]
        }
      },
      {
        locationId: 'hangang_hannam_park',
        label: '步行下坡 · 约18分钟',
        transit: {
          distance: '约1.5公里',
          duration: '约18分钟',
          startName: '汉南洞主街',
          endName: '汉江公园(汉南段)',
          steps: [
            { mode: 'walk', from: '汉南洞主街', to: '汉江公园入口', duration: '约18分钟', distance: '约1.5公里', instruction: '沿梨泰院路向南山方向步行下坡，经过汉南大桥北侧即可到达汉江公园' }
          ]
        }
      },
      {
        locationId: 'aank_itaewon_group',
        label: '步行返回 · 约19分钟',
        isHotel: true,
        transit: {
          distance: '约1.3公里',
          duration: '约19分钟',
          startName: '汉江公园(汉南段)',
          endName: 'Aank Hotel 梨泰院店',
          steps: [
            { mode: 'walk', from: '汉江公园', to: '汉南洞主街', duration: '约11分钟', distance: '约900米', instruction: '沿汉南大桥北侧步行上坡返回汉南洞街区' },
            { mode: 'walk', from: '汉南洞主街', to: 'Aank Hotel 梨泰院店', duration: '约8分钟', distance: '约400米', instruction: '沿梨泰院路下坡步行返回酒店' }
          ]
        }
      }
    ]
  },

  // Day 4: 圣水洞文创+美食日 (2026-05-02)
  {
    day: 4,
    date: '2026-05-02',
    title: '圣水洞文创+美食日',
    note: '东线。梨泰院乘6号线转2号线到圣水约30分钟。白天逛文创园区+咖啡，晚上在圣水洞吃Gwonski猪蹄或두찜辣炖鸡（两家步行2分钟）',
    baseHotelId: 'aank_itaewon_group',
    path: [
      { locationId: 'aank_itaewon_group', label: '起点', isHotel: true },
      {
        locationId: 'seongsu_entrance',
        label: '地铁6号线→2号线 · 约30分钟',
        transit: {
          distance: '约9.0公里',
          duration: '约30分钟',
          startName: '梨泰院Aank酒店',
          endName: '圣水洞主街',
          steps: [
            { mode: 'walk', from: 'Aank Hotel 梨泰院店', to: '梨泰院站', duration: '约5分钟', distance: '约300米', instruction: '从酒店步行至梨泰院地铁站' },
            { mode: 'subway', line: '首尔地铁6号线', from: '梨泰院站', to: '新堂站', duration: '约20分钟', distance: '约8.0公里', instruction: '乘坐6号线至新堂站下车' },
            { mode: 'subway', line: '首尔地铁2号线', from: '新堂站', to: '圣水站', duration: '约2分钟', distance: '约1.0公里', instruction: '换乘2号线至圣水站下车' },
            { mode: 'walk', from: '圣水站4号出口', to: '圣水洞主街', duration: '约3分钟', distance: '约200米', instruction: '4号出口出站后沿圣水一路进入主街区' }
          ]
        }
      },
      {
        locationId: 'gwonski',
        label: '步行 · 约7分钟',
        transit: {
          distance: '约400米',
          duration: '约7分钟',
          startName: '圣水站/主街区',
          endName: '권식족발 (Gwonski猪蹄)',
          steps: [
            { mode: 'walk', from: '圣水站4号出口', to: 'Gwonski猪蹄', duration: '约7分钟', distance: '约400米', instruction: '从圣水站步行至峨嵋山路7街4号 Gwonski猪蹄' }
          ]
        }
      },
      {
        locationId: 'dukchim',
        label: '步行 · 约3分钟',
        transit: {
          distance: '约200米',
          duration: '约3分钟',
          startName: 'Gwonski猪蹄',
          endName: '두찜(辣炖鸡) 圣水店',
          steps: [
            { mode: 'walk', from: 'Gwonski猪蹄', to: '두찜圣水店', duration: '约3分钟', distance: '约200米', instruction: '两家店铺位于圣水洞同一条小巷内，步行约2-3分钟' }
          ]
        }
      },
      {
        locationId: 'aank_itaewon_group',
        label: '地铁2号线→6号线 · 约30分钟',
        isHotel: true,
        transit: {
          distance: '约9.0公里',
          duration: '约30分钟',
          startName: '圣水洞主街',
          endName: 'Aank Hotel 梨泰院店',
          steps: [
            { mode: 'walk', from: '圣水洞主街/Gwonski猪蹄/두찜', to: '圣水站', duration: '约5分钟', distance: '约300米', instruction: '步行返回圣水站' },
            { mode: 'subway', line: '首尔地铁2号线', from: '圣水站', to: '新堂站', duration: '约2分钟', distance: '约1.0公里', instruction: '乘坐2号线至新堂站下车' },
            { mode: 'subway', line: '首尔地铁6号线', from: '新堂站', to: '梨泰院站', duration: '约20分钟', distance: '约8.0公里', instruction: '换乘6号线至梨泰院站' },
            { mode: 'walk', from: '梨泰院站', to: 'Aank Hotel 梨泰院店', duration: '约5分钟', distance: '约300米', instruction: '从梨泰院站步行返回酒店' }
          ]
        }
      }
    ]
  },

  // Day 5: 市中区购物+西村文创 (2026-05-03)
  {
    day: 5,
    date: '2026-05-03',
    title: '市中区购物+西村文创',
    note: '上午新世界百货购物，中午明洞地下美食街，下午西村手账店，傍晚最后补货',
    baseHotelId: 'aank_itaewon_group',
    path: [
      { locationId: 'aank_itaewon_group', label: '起点', isHotel: true },
      {
        locationId: 'shinsegae_main',
        label: '地铁6号线 · 约20分钟',
        transit: {
          distance: '约4.0公里',
          duration: '约20分钟',
          startName: '梨泰院Aank酒店',
          endName: '新世界百货本店',
          steps: [
            { mode: 'walk', from: 'Aank Hotel 梨泰院店', to: '梨泰院站', duration: '约5分钟', distance: '约300米', instruction: '步行至梨泰院地铁站' },
            { mode: 'subway', line: '首尔地铁6号线', from: '梨泰院站', to: '孔德站', duration: '约7分钟', distance: '约4.0公里', instruction: '乘坐6号线至孔德站' },
            { mode: 'subway', line: '首尔地铁5号线', from: '孔德站', to: '市厅站', duration: '约5分钟', distance: '约1.5公里', instruction: '换乘5号线至市厅站下车' },
            { mode: 'walk', from: '市厅站', to: '新世界百货本店', duration: '约3分钟', distance: '约300米', instruction: '从市厅站步行至新世界百货' }
          ]
        }
      },
      {
        locationId: 'myeongdong_street',
        label: '免费穿梭巴士/步行 · 约5分钟',
        transit: {
          distance: '约800米',
          duration: '约5分钟',
          startName: '新世界百货本店',
          endName: '明洞主街',
          steps: [
            { mode: 'walk', from: '新世界百货本店', to: '新世界免费巴士站', duration: '约2分钟', distance: '约100米', instruction: '步行至新世界百货免费巴士站' },
            { mode: 'bus', line: '新世界免费穿梭巴士', from: '新世界百货', to: '明洞主街', duration: '约3分钟', distance: '约700米', instruction: '乘坐新世界免费巴士至明洞主街下车（或步行约10分钟）' }
          ]
        }
      },
      {
        locationId: 'papier_prost',
        label: '地铁3号线+步行 · 约25分钟',
        transit: {
          distance: '约3.8公里',
          duration: '约25分钟',
          startName: '明洞主街',
          endName: '파피어프로스트',
          steps: [
            { mode: 'walk', from: '明洞主街', to: '乙支路3街站', duration: '约8分钟', distance: '约500米', instruction: '步行至乙支路3街站' },
            { mode: 'subway', line: '首尔地铁3号线', from: '乙支路3街站', to: '景福宫站', duration: '约12分钟', distance: '约2.5公里', instruction: '乘坐3号线至景福宫站下车' },
            { mode: 'walk', from: '景福宫站3号出口', to: '파피어프로스트', duration: '约5分钟', distance: '约300米', instruction: '3号出口出站后沿孝子路步行至西村，자하문로7길 68-4' }
          ]
        }
      },
      {
        locationId: 'aank_itaewon_group',
        label: '地铁3→6号线 · 约25分钟',
        isHotel: true,
        transit: {
          distance: '约5.5公里',
          duration: '约25分钟',
          startName: '파피어프로스트',
          endName: 'Aank Hotel 梨泰院店',
          steps: [
            { mode: 'walk', from: '파피어프로스트', to: '景福宫站', duration: '约5分钟', distance: '约300米', instruction: '步行返回景福宫站' },
            { mode: 'subway', line: '首尔地铁3号线', from: '景福宫站', to: '药水站', duration: '约8分钟', distance: '约2.5公里', instruction: '乘坐3号线至药水站下车' },
            { mode: 'subway', line: '首尔地铁6号线', from: '药水站', to: '梨泰院站', duration: '约7分钟', distance: '约2.7公里', instruction: '换乘6号线至梨泰院站' },
            { mode: 'walk', from: '梨泰院站', to: 'Aank Hotel 梨泰院店', duration: '约5分钟', distance: '约300米', instruction: '从梨泰院站步行返回酒店' }
          ]
        }
      }
    ]
  },

  // Day 6: 返航日 (2026-05-04)
  {
    day: 6,
    date: '2026-05-04',
    title: '返航杭州',
    note: '大韩航空 KE107 首尔仁川→杭州萧山（约12:15起飞/13:20到达 CST）。建议提前3小时从酒店出发。',
    baseHotelId: 'aank_itaewon_group',
    path: [
      { locationId: 'aank_itaewon_group', label: '起点', isHotel: true },
      {
        locationId: 'incheon_airport_t1',
        label: '地铁6号线→机场铁路 · 约80分钟',
        transit: {
          distance: '约55公里',
          duration: '约80分钟',
          startName: '梨泰院Aank酒店',
          endName: '仁川国际机场T1航站楼',
          steps: [
            { mode: 'walk', from: 'Aank Hotel 梨泰院店', to: '梨泰院站', duration: '约5分钟', distance: '约300米', instruction: '携带行李步行至梨泰院站' },
            { mode: 'subway', line: '首尔地铁6号线', from: '梨泰院站', to: '孔德站', duration: '约7分钟', distance: '约4.0公里', instruction: '乘坐6号线至孔德站下车' },
            { mode: 'walk', from: '孔德站', to: '机场铁路换乘通道', duration: '约3分钟', distance: '约100米', instruction: '站内换乘至机场铁路 (AREX)' },
            { mode: 'train', line: '机场铁路 (AREX) 直达列车', from: '孔德站', to: '仁川国际机场', duration: '约60分钟', distance: '约50公里', instruction: '乘坐机场铁路直达列车前往仁川国际机场T1/T2航站楼' },
            { mode: 'walk', from: '机场铁路下车口', to: '出发大厅', duration: '约5分钟', distance: '约200米', instruction: '跟随出发大厅指示牌办理值机和出境手续' }
          ]
        }
      }
    ]
  }
]
