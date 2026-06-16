# 说走就走

面向临时假期用户的国内旅游攻略 H5 应用。系统围绕“当季目的地推荐、交通方案对比、收藏完整攻略”三条主路径，帮助用户快速决定去哪儿、怎么去。

项目采用前后端分离开发，线上可由 NestJS 同域托管 Vue H5 页面和 `/api` 接口，适合部署到 Render 等免费 Web Service。

## 当前功能

- 当季推荐：按月份展示国内目的地推荐，支持按假期天数和出行偏好筛选。
- 目的地详情：展示热门景点、游玩特色、建议路线、注意事项和最佳季节。
- 交通方案：支持出发地、目的地和日期查询，提供性价比、最舒适、穷游三类方案。
- 用户中心：手机号验证码登录，查看、删除收藏攻略，支持刷新收藏中的交通方案。
- 数据标识：交通方案展示参考价格、更新时间、核价入口和 `referenceOnly` 提示。
- 免费部署：支持 Render 单服务部署，默认使用内存数据即可完成演示流程。

## 技术栈

### 前端

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios
- Vant 移动端组件库
- unplugin-vue-components 按需引入 Vant 组件

### 后端

- Node.js
- TypeScript
- NestJS
- REST API
- JWT 登录鉴权
- class-validator 参数校验
- Swagger 接口文档
- mysql2 数据库访问
- 腾讯云短信 SDK 适配层

### 数据库与部署

- MySQL，表结构位于 `database/init.sql`
- Docker Compose 提供本地 MySQL 环境
- Render 部署配置位于 `render.yaml`
- 默认 `DATA_STORE=memory` 可免数据库运行
- 配置 `DATA_STORE=mysql` 和 `DATABASE_URL` 后可持久化收藏数据

## 数据来源与合规说明

当前系统没有使用未授权爬虫，也没有复制小红书、去哪儿、携程、12306、航司或其他第三方平台的正文、图片、用户信息和实时价格。

### 目的地推荐数据

- 首版目的地、景点、游玩特色、注意事项和推荐理由来自项目内人工整理的原创摘要。
- 内容基于公开旅游常识、季节适宜度、目的地特点和产品演示需要整理，不直接搬运第三方攻略原文。
- 当季排名使用本地种子数据和评分字段计算，核心数据位于 `apps/api/src/data.ts`。
- 排序会结合月份、推荐分、建议天数、出行偏好等字段生成展示结果。

### 交通方案数据

- 当前交通方案由后端 `MockTransportProvider` 生成，是结构化模拟数据和参考价格。
- 页面会展示更新时间和核价入口，并通过 `referenceOnly=true` 表明价格仅供参考。
- 核价入口可跳转到 12306、去哪儿、高德地图等第三方平台，由用户完成实时核价。
- 系统不承诺实时最低价，也不抓取未授权票价数据。
- 正式上线如需实时机票、火车票、汽车票价格，需要接入有授权的商业 API 或票务供应商。

### 图片资源

- 目的地卡片图片使用项目本地静态资源，路径位于 `apps/web/public/images/destinations`。
- 列表卡片使用压缩后的缩略图，详情页使用更高分辨率封面图。
- 当前图片用于产品演示和视觉呈现，不作为第三方平台图片采集结果。
- 生产环境建议替换为自有版权、授权图库或可商用图片，并配置 CDN。

### 可扩展数据接口

后端已预留 Provider 思路，后续可以替换或扩展：

- 高德开放平台：地理编码、距离、自驾路线、公交路线。
- 正式票务供应商：机票、火车票、汽车票报价和可订班次。
- 内容管理后台：维护目的地、景点、攻略、数据来源和可信级别。

## 前端优化点

- 使用 Vant 组件替代原生表单控件，提升移动端触控体验和视觉一致性。
- 目的地月份选择改为单选弹层，默认当前月份，减少首页占用空间。
- 当季推荐保留纵向大卡片样式，首屏尽量展示 3 个目的地。
- 目的地卡片图片铺满卡片，使用 `object-fit: cover` 保持自然风景展示效果。
- 为推荐列表增加 `cardCover` 缩略图字段，列表加载小图，详情页加载大图。
- 首屏前 3 张图片优先加载，后续图片使用 Vant Lazyload 懒加载，减少首屏压力。
- Tab 切换时自动重置滚动位置，避免从长列表切到其他页面后停留在页面中部。
- 交通页面使用城市选择组件，避免出发地和目的地输入样式错乱。
- 交通页隐藏出行人数和人均预算字段，降低临时出行用户的填写负担。
- 用户中心优化短信验证码登录交互，支持倒计时、错误提示和开发验证码说明。
- 前端 API 使用同源部署策略，线上访问时不需要额外处理跨域配置。
- 移动端布局适配安全区域和底部 Tabbar，增强手机浏览器体验。

## 本地运行

要求 Node.js 20+。复制 `.env.example` 为 `.env` 后执行：

```bash
npm install
npm run dev
```

Windows PowerShell 如果遇到 `npm.ps1` 执行策略限制，可以使用：

```bash
npm.cmd install
npm.cmd run dev
```

本地默认地址：

- H5：http://localhost:5173
- API：http://localhost:3000/api
- Swagger：http://localhost:3000/api/docs
- 开发验证码：`123456`

## 短信验证码

后端已接入短信 Provider 适配层。默认使用开发模式：

```env
SMS_PROVIDER=development
EXPOSE_DEV_SMS_CODE=true
```

正式上线前需要申请腾讯云短信应用、国内签名和验证码模板，然后配置：

```env
SMS_PROVIDER=tencent
SMS_CODE_SECRET=独立的随机长字符串
TENCENTCLOUD_SECRET_ID=
TENCENTCLOUD_SECRET_KEY=
TENCENTCLOUD_REGION=ap-guangzhou
TENCENT_SMS_SDK_APP_ID=
TENCENT_SMS_SIGN_NAME=
TENCENT_SMS_TEMPLATE_ID=
```

验证码状态目前保存在单个 API 进程内。多实例生产部署时，建议迁移到 Redis 等共享存储，并增加发送频控、错误次数限制和风控策略。

## 免费部署

仓库包含 `render.yaml`，可在 Render 创建单个 Web Service。服务会先构建 Vue 前端和 NestJS API，再由 API 进程同域托管 H5 页面与 `/api`。

- 健康检查：`/api/health`
- 免费演示默认使用内存数据和开发验证码 `123456`
- Render 免费实例休眠或重新部署后，内存收藏数据可能清空
- 需要长期保存收藏时，将 `DATA_STORE` 改为 `mysql`，并配置 MySQL 兼容数据库连接串
- 正式开放登录前，应接入真实短信服务并关闭 `EXPOSE_DEV_SMS_CODE`

## 常用命令

```bash
npm run typecheck
npm test
npm run build
```

## 生产检查清单

- 替换高强度 `JWT_SECRET`。
- 配置 HTTPS、请求限流和接口日志脱敏。
- 接入合规短信供应商，关闭开发验证码回显。
- 替换或确认所有图片、文案和数据来源授权。
- 接入正式交通数据供应商，保留来源、更新时间和可信级别。
- 使用 MySQL 或兼容数据库持久化用户收藏。
- 完成隐私政策、用户协议、备案和安全测试。
