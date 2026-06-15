<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route=useRoute(), privacy=computed(()=>route.params.type==='privacy')
</script>
<template><section class="legal-page"><van-nav-bar :title="privacy?'隐私政策':'用户协议'" left-arrow @click-left="$router.back()" /><article><h1>{{ privacy?'隐私政策':'用户协议' }}</h1><p>更新日期：2026年6月15日</p><h2>服务说明</h2><p>“说走就走”为用户提供目的地灵感、参考攻略与交通方案比较。价格与班次仅供参考，实际信息以持牌出票平台为准。</p><h2>{{ privacy?'信息处理':'使用规则' }}</h2><p v-if="privacy">我们仅处理登录所需手机号、收藏内容与用户主动提交的出行查询。开发环境验证码不得用于生产；生产环境应接入合规短信服务并完善注销流程。</p><p v-else>用户不得利用本服务从事违法活动。第三方链接由相应服务商负责，用户下单前应自行核验价格、退改规则与安全信息。</p><h2>数据来源</h2><p>目的地内容为人工整理的公共事实与原创摘要，不复制第三方平台正文。交通数据接入正式供应商前使用明确标注的参考数据。</p></article></section></template>
