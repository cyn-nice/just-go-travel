import { Destination, TravelStyle } from './types.js'

const destinationImageQueries = [
  'Kanas Lake Altay Xinjiang', 'Weihai coastal road Shandong', 'Zhaoxing Dong Village Guizhou',
  'Kaiyuan Temple Quanzhou', 'Erhai Lake Dali Yunnan', 'Qingdao Badaguan coast',
  'Changbai Mountain Tianchi', 'Sayram Lake Ili Xinjiang', 'Zhagana Gannan Gansu',
  'Li River Yangshuo Guilin', 'Dongji Island Zhoushan', 'Enshi Grand Canyon Hubei',
  'Hulunbuir grassland Inner Mongolia', 'Gulangyu Xiamen Fujian', 'Chengdu teahouse Sichuan',
  'Orange Isle Changsha Hunan', 'Ming Xiaoling Nanjing', 'Longmen Grottoes Luoyang',
  'Mogao Caves Dunhuang', 'Heshun Ancient Town Tengchong', 'Huangling Wuyuan Jiangxi',
  'Xishuangbanna rainforest Yunnan', 'Harbin Central Street winter', 'Yalong Bay Sanya Hainan',
]

const img = (query: string, lock: number) => `https://loremflickr.com/1200/800/${encodeURIComponent(query).replaceAll('%20', ',')}?lock=${lock}`

const localDestinationImages: Record<number, string> = {
  0: '/images/destinations/altay.jpg',
  1: '/images/destinations/weihai.jpg',
  2: '/images/destinations/qiandongnan.jpg',
  5: '/images/destinations/qingdao.jpg',
  6: '/images/destinations/changbai.jpg',
  7: '/images/destinations/ili.jpg',
  8: '/images/destinations/gannan.jpg',
  9: '/images/destinations/guilin.jpg',
  10: '/images/destinations/zhoushan.jpg',
  11: '/images/destinations/enshi.jpg',
  12: '/images/destinations/hulunbuir.jpg',
  18: '/images/destinations/dunhuang.jpg',
  19: '/images/destinations/tengchong.jpg',
  20: '/images/destinations/wuyuan.jpg',
  21: '/images/destinations/xishuangbanna.jpg',
  23: '/images/destinations/sanya.jpg',
}

interface Seed {
  name: string
  province: string
  image: string
  slogan: string
  reason: string
  months: number[]
  days: number
  styles: TravelStyle[]
  score: number
  features: string[]
  spots: [string, string]
}

const seeds: Seed[] = [
  { name: '阿勒泰', province: '新疆', image: 'photo-1500530855697-b586d89ba3ee', slogan: '雪山、草原与长风', reason: '草原转绿后景观层次丰富，适合轻户外与公路旅行。', months: [6,7,8,9], days: 5, styles: ['nature','relax'], score: 96, features: ['雪山草原','湖泊公路','村落晨雾'], spots: ['喀纳斯','禾木'] },
  { name: '威海', province: '山东', image: 'photo-1507525428034-b723cf961d3e', slogan: '沿着海岸线追日落', reason: '海岸线成熟、城市节奏舒缓，短假期也能获得完整海滨体验。', months: [5,6,7,8,9], days: 3, styles: ['food','relax','nature'], score: 95, features: ['环海骑行','海鲜夜市','日出沙滩'], spots: ['环海路','刘公岛'] },
  { name: '黔东南', province: '贵州', image: 'photo-1464822759023-fed622ff2c3b', slogan: '钻进山水与村寨之间', reason: '气候凉爽，苗侗村寨、梯田与地方美食组合丰富。', months: [5,6,7,8,9,10], days: 4, styles: ['culture','nature','food'], score: 94, features: ['苗侗村寨','酸汤美食','梯田徒步'], spots: ['肇兴侗寨','堂安梯田'] },
  { name: '泉州', province: '福建', image: 'photo-1528127269322-539801943592', slogan: '半城烟火，半城古迹', reason: '老城步行友好，小吃与世遗建筑密集，两天也能玩得充实。', months: [3,4,5,10,11,12], days: 2, styles: ['culture','food'], score: 93, features: ['世遗古城','闽南小吃','寺庙街巷'], spots: ['开元寺','西街'] },
  { name: '大理', province: '云南', image: 'photo-1526392060635-9d6019884377', slogan: '在苍山洱海边慢下来', reason: '山海、古城与田园路线成熟，适合放松和轻度骑行。', months: [2,3,4,5,10,11,12], days: 4, styles: ['nature','relax','culture'], score: 92, features: ['洱海骑行','白族村落','苍山日落'], spots: ['洱海','喜洲古镇'] },
  { name: '青岛', province: '山东', image: 'photo-1530789253388-582c481c54b0', slogan: '红瓦绿树与海风啤酒', reason: '城市漫步、海滨浴场和夜间美食都很集中。', months: [5,6,7,8,9,10], days: 3, styles: ['food','relax','culture'], score: 91, features: ['老城漫步','海滨浴场','啤酒海鲜'], spots: ['八大关','小麦岛'] },
  { name: '长白山', province: '吉林', image: 'photo-1464278533981-50106e6176b1', slogan: '去森林深处看天池', reason: '夏季森林清凉，秋季层林渐染，景观随季节变化明显。', months: [6,7,8,9,10], days: 3, styles: ['nature','relax'], score: 90, features: ['高山天池','原始森林','温泉度假'], spots: ['长白山天池','绿渊潭'] },
  { name: '伊犁', province: '新疆', image: 'photo-1500534314209-a25ddb2bd429', slogan: '一路向西穿过花海', reason: '草原、峡谷和公路景观连续，适合多日自驾或小团旅行。', months: [5,6,7,8,9], days: 5, styles: ['nature'], score: 90, features: ['草原花海','峡谷公路','哈萨克风情'], spots: ['赛里木湖','那拉提'] },
  { name: '甘南', province: '甘肃', image: 'photo-1470770841072-f978cf4d019e', slogan: '高原草甸上的清凉夏日', reason: '寺院、草原与石城景观并存，夏季温度舒适。', months: [6,7,8,9], days: 5, styles: ['nature','culture'], score: 89, features: ['高原草甸','藏地寺院','石城秘境'], spots: ['扎尕那','拉卜楞寺'] },
  { name: '桂林阳朔', province: '广西', image: 'photo-1518005020951-eccb494ad742', slogan: '住进山水画里', reason: '喀斯特山水、遇龙河与田园骑行适合轻松度假。', months: [3,4,5,6,9,10,11], days: 3, styles: ['nature','relax'], score: 89, features: ['山水竹筏','田园骑行','溶洞奇观'], spots: ['遇龙河','相公山'] },
  { name: '舟山', province: '浙江', image: 'photo-1528150177508-7cc0c36cda5c', slogan: '挑一座小岛吹海风', reason: '岛屿选择丰富，可按假期长度组合沙滩、渔村和环岛路线。', months: [5,6,7,8,9,10], days: 3, styles: ['relax','food','nature'], score: 88, features: ['海岛日落','渔村慢游','环岛公路'], spots: ['东极岛','嵊泗列岛'] },
  { name: '恩施', province: '湖北', image: 'photo-1500534623283-312aade485b7', slogan: '峡谷与秘境里的清凉', reason: '峡谷、洞穴与土家文化集中，适合夏季避暑。', months: [4,5,6,7,8,9,10], days: 4, styles: ['nature','culture'], score: 88, features: ['峡谷地貌','洞穴奇观','土家风情'], spots: ['恩施大峡谷','屏山峡谷'] },
  { name: '呼伦贝尔', province: '内蒙古', image: 'photo-1500534623283-312aade485b7', slogan: '把视野交给无边草原', reason: '夏季草原辽阔，适合亲子、公路和摄影旅行。', months: [6,7,8,9], days: 5, styles: ['nature','relax'], score: 87, features: ['草原公路','湿地日落','边境小城'], spots: ['莫日格勒河','额尔古纳湿地'] },
  { name: '厦门', province: '福建', image: 'photo-1500530855697-b586d89ba3ee', slogan: '海边街巷里的松弛感', reason: '城市交通方便，海岛、街区和闽南美食适合短途出发。', months: [2,3,4,5,10,11,12], days: 3, styles: ['food','relax','culture'], score: 87, features: ['海边骑行','文艺街区','闽南风味'], spots: ['鼓浪屿','环岛路'] },
  { name: '成都', province: '四川', image: 'photo-1547981609-4b6bfe67ca0b', slogan: '从早茶喝到深夜', reason: '美食密度高，市区与周边山水可灵活组合。', months: [1,2,3,4,5,9,10,11,12], days: 3, styles: ['food','culture','relax'], score: 86, features: ['川味美食','茶馆生活','周边山水'], spots: ['宽窄巷子','青城山'] },
  { name: '长沙', province: '湖南', image: 'photo-1518005020951-eccb494ad742', slogan: '夜色越深越有烟火气', reason: '夜游、美食与城市文化高度集中，适合周末快闪。', months: [3,4,5,9,10,11], days: 2, styles: ['food','culture'], score: 86, features: ['夜市小吃','湘江夜景','城市展馆'], spots: ['岳麓山','橘子洲'] },
  { name: '南京', province: '江苏', image: 'photo-1528127269322-539801943592', slogan: '梧桐树下读六朝', reason: '历史建筑、博物馆与城市绿道适合慢慢步行。', months: [3,4,5,10,11,12], days: 3, styles: ['culture','food'], score: 85, features: ['六朝古迹','梧桐街道','秦淮夜色'], spots: ['明孝陵','南京博物院'] },
  { name: '洛阳', province: '河南', image: 'photo-1564507592333-c60657eea523', slogan: '穿过盛唐与石窟', reason: '古都遗迹密集，春季花事和夜游体验突出。', months: [3,4,5,9,10,11], days: 3, styles: ['culture','food'], score: 85, features: ['龙门石窟','古都夜游','牡丹花事'], spots: ['龙门石窟','洛邑古城'] },
  { name: '敦煌', province: '甘肃', image: 'photo-1509316785289-025f5b846b35', slogan: '走进大漠与千年壁画', reason: '人文遗产与沙漠景观辨识度极高，秋季尤其舒适。', months: [4,5,6,9,10], days: 4, styles: ['culture','nature'], score: 84, features: ['莫高窟','鸣沙山','丝路人文'], spots: ['莫高窟','鸣沙山月牙泉'] },
  { name: '腾冲', province: '云南', image: 'photo-1464822759844-d150baec0494', slogan: '火山温泉与边城秋色', reason: '火山地貌、温泉与古镇适合慢节奏旅行。', months: [2,3,4,10,11,12], days: 4, styles: ['relax','nature','culture'], score: 84, features: ['火山地热','温泉度假','银杏古村'], spots: ['和顺古镇','热海景区'] },
  { name: '婺源', province: '江西', image: 'photo-1500534314209-a25ddb2bd429', slogan: '徽派村落里的四季颜色', reason: '春季花田和秋季晒秋最具代表性，村落路线适合自驾。', months: [3,4,10,11], days: 3, styles: ['culture','nature'], score: 83, features: ['徽派村落','油菜花田','篁岭晒秋'], spots: ['篁岭','江湾'] },
  { name: '西双版纳', province: '云南', image: 'photo-1516026672322-bc52d61a55d5', slogan: '住进热带雨林的夜晚', reason: '冬季温暖，雨林、傣族文化与夜市体验丰富。', months: [1,2,3,4,11,12], days: 4, styles: ['nature','food','culture'], score: 83, features: ['热带雨林','傣味夜市','民族村寨'], spots: ['中科院植物园','曼听公园'] },
  { name: '哈尔滨', province: '黑龙江', image: 'photo-1483347756197-71ef80e95f73', slogan: '在冰雪与欧式街景间漫步', reason: '冬季冰雪氛围浓厚，夏季则适合清凉城市漫游。', months: [1,2,7,8,12], days: 3, styles: ['culture','food','nature'], score: 82, features: ['冰雪世界','欧式街区','东北美食'], spots: ['中央大街','太阳岛'] },
  { name: '三亚', province: '海南', image: 'photo-1507525428034-b723cf961d3e', slogan: '把冬天换成海岛阳光', reason: '冬春气候舒适，海湾和热带雨林可组合游玩。', months: [1,2,3,4,11,12], days: 4, styles: ['relax','nature','food'], score: 82, features: ['热带海湾','雨林徒步','海鲜夜市'], spots: ['亚龙湾','蜈支洲岛'] },
]

export const destinations: Destination[] = seeds.map((seed, index) => {
  const cover = localDestinationImages[index] ?? img(destinationImageQueries[index], index + 101)
  const cardCover = cover.startsWith('/images/destinations/')
    ? cover.replace('/images/destinations/', '/images/destinations/cards/')
    : cover

  return {
    id: index + 1,
    name: seed.name,
    province: seed.province,
    cover,
    cardCover,
    slogan: seed.slogan,
    reason: seed.reason,
    bestMonths: seed.months,
    days: seed.days,
    budgetMin: 0,
    budgetMax: 0,
    styles: seed.styles,
    score: seed.score,
    features: seed.features,
    route: [`抵达${seed.name}`, seed.spots[0], seed.spots[1], '自由探索与返程'],
    tips: ['根据天气调整户外行程', '热门景点建议错峰前往', '出发前确认交通与开放时间'],
    attractions: seed.spots.map((name, spotIndex) => ({
      id: (index + 1) * 100 + spotIndex + 1,
      name,
      description: `${name}是${seed.name}具有代表性的旅行体验，适合安排在核心行程中。`,
      tag: seed.features[spotIndex] || '必体验',
    })),
  }
})
