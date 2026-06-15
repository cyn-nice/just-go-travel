# 说走就走

面向临时假期用户的国内旅游攻略 H5。项目包含 Vue 3 移动端、NestJS API、MySQL 数据模型，以及可替换的交通数据 Provider。

## 当前能力

- 当季目的地榜单、天数/预算/偏好筛选与目的地详情
- 性价比、最舒适、穷游三种交通排序策略
- 手机验证码登录、收藏攻略、价格刷新
- Swagger 接口文档、开发模拟数据、MySQL 初始化结构
- 带 `x-admin-key` 的目的地维护与数据来源管理 API
- 明确标注参考价格和核价入口，不抓取或复制第三方攻略正文

## 本地运行

要求 Node.js 20+。复制 `.env.example` 为 `.env` 后执行：

```bash
npm install
npm run dev
```

- H5：`http://localhost:5173`
- API：`http://localhost:3000/api`
- Swagger：`http://localhost:3000/api/docs`
- 开发验证码：默认 `123456`

### 真实短信验证码

后端已接入腾讯云短信 Provider。默认使用 `SMS_PROVIDER=development`，便于本地开发；上线前完成腾讯云短信应用、国内签名和验证码模板审核后，配置：

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

验证码模板需包含两个参数，顺序为验证码和有效分钟数，例如：`您的验证码为{1}，{2}分钟内有效。`。密钥只能配置在后端环境变量中，不得写入前端代码或提交到仓库。

当前验证码状态保存在单个 API 进程内。多实例生产部署时，应将验证码、发送频控和错误次数迁移到 Redis 等共享存储。

在 PowerShell 执行策略限制 `npm.ps1` 的 Windows 环境中，可将以上命令写为 `npm.cmd install` 和 `npm.cmd run dev`。

当前 `DATA_STORE=memory` 可免数据库启动并完成全部用户流程。设置 `DATA_STORE=mysql` 后，API 会连接 MySQL、同步种子目的地并持久化用户收藏；数据表定义位于 `database/init.sql`。安装 Docker 后可运行 `docker compose up -d mysql`。

## 数据来源与上线边界

目的地种子内容是项目原创摘要和公共旅游事实，示例图片来自 Unsplash 动态图片服务。不得把未授权的小红书正文、图片或用户信息写入生产库。

交通 Provider 当前返回带 `referenceOnly=true` 的模拟方案，页面会展示更新时间与核价提示。正式上线前，应取得航班/铁路/客运数据供应商授权并实现 `TransportProvider` 接口。高德 Web 服务 Key 可用于地理编码、自驾距离和公交路线，但它不能替代火车票或机票实时报价。

## 生产检查清单

- 将 `JWT_SECRET` 替换为高强度密钥，启用 HTTPS 和请求限流。
- 接入合规短信供应商，关闭响应中的开发验证码。
- 建立正式迁移与备份流程，并提供账号注销能力。
- 配置自有图片 CDN，确认所有内容及图片授权。
- 接入正式交通供应商并保留来源、更新时间和可信等级。
- 完成备案、隐私政策审查、日志脱敏和安全测试。

## 常用命令

```bash
npm run typecheck
npm test
npm run build
```
