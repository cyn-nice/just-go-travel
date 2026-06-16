<script setup lang="ts">
import type { Destination } from '../types'
defineProps<{ item: Destination; rank: number }>()
</script>

<template>
  <article class="destination-card" @click="$router.push(`/destination/${item.id}`)">
    <img
      :src="item.cardCover || item.cover"
      :alt="item.name"
      :loading="rank === 1 ? 'eager' : 'lazy'"
      :fetchpriority="rank === 1 ? 'high' : 'auto'"
      decoding="async"
      width="800"
      height="407"
    />
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
