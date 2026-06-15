<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { api } from '../api'
import { useAuthStore, useTravelStore } from '../stores'
import type { Destination } from '../types'
const route = useRoute(), router = useRouter(), auth = useAuthStore(), store = useTravelStore()
const item = ref<Destination | null>(null)
onMounted(async () => { item.value = (await api.get(`/destinations/${route.params.id}`)).data })
async function collect() {
  if (!auth.token) return router.push('/profile')
  await store.favorite(Number(route.params.id)); showToast('已收藏完整攻略')
}
</script>

<template>
  <div v-if="item" class="detail-page">
    <van-nav-bar title="目的地攻略" left-arrow fixed placeholder @click-left="$router.back()" />
    <div class="detail-cover"><van-image width="100%" height="100%" fit="cover" lazy-load :src="item.cover"><template #loading><van-loading type="spinner" color="#ff6542" /></template></van-image><div><span>{{ item.province }}</span><h1>{{ item.name }}</h1><p>{{ item.slogan }}</p></div></div>
    <section class="quick-facts"><div><small>建议</small><b>{{ item.days }} 天</b></div><div><small>适宜</small><b>{{ item.bestMonths.join('、') }} 月</b></div><div><small>热度</small><b>{{ item.score }}</b></div></section>
    <section class="content-block"><small>WHY NOW</small><h2>为什么现在去</h2><p>{{ item.reason }}</p><div class="tag-row dark"><span v-for="x in item.features" :key="x">{{ x }}</span></div></section>
    <section class="content-block"><small>HIGHLIGHTS</small><h2>热门体验</h2><article v-for="spot in item.attractions" :key="spot.id" class="spot"><b>{{ spot.name }}</b><em>{{ spot.tag }}</em><p>{{ spot.description }}</p></article></section>
    <section class="content-block"><small>ITINERARY</small><h2>建议路线</h2><ol class="timeline"><li v-for="(step,index) in item.route" :key="step"><i>{{ index+1 }}</i><span>DAY {{ index+1 }}</span><b>{{ step }}</b></li></ol></section>
    <section class="content-block tips"><small>BEFORE YOU GO</small><h2>出发前知道</h2><p v-for="tip in item.tips" :key="tip">{{ tip }}</p></section>
    <div class="detail-actions"><van-button plain round color="#171717" @click="collect">收藏攻略</van-button><van-button round color="#ff6542" @click="$router.push({path:'/transport',query:{destination:item.name}})">查交通方案</van-button></div>
  </div>
</template>
