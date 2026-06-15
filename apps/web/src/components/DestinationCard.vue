<script setup lang="ts">
import type { Destination } from '../types'
defineProps<{ item: Destination; rank: number }>()
</script>

<template>
  <article class="destination-card" @click="$router.push(`/destination/${item.id}`)">
    <van-image width="100%" height="100%" fit="cover" lazy-load :src="item.cover" :alt="item.name">
      <template #loading><van-loading type="spinner" color="#ff6542" /></template>
      <template #error><van-icon name="photo-fail" size="32" /></template>
    </van-image>
    <div class="rank">TOP {{ rank }}</div>
    <div class="card-gradient"></div>
    <div class="card-copy">
      <div class="card-title"><strong>{{ item.name }}</strong><span>{{ item.province }}</span></div>
      <p>{{ item.slogan }}</p>
      <div class="tag-row"><span v-for="feature in item.features.slice(0, 2)" :key="feature">{{ feature }}</span></div>
      <div class="card-meta"><b>建议 {{ item.days }} 天</b><b>{{ item.bestMonths.join('、') }} 月适宜</b><em>{{ item.score }} 热度</em></div>
    </div>
  </article>
</template>
