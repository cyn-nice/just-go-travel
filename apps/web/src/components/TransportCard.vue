<script setup lang="ts">
import type { TransportOption } from '../types'
defineProps<{ item: TransportOption; best?: boolean }>()
const modeName: Record<string,string> = { flight:'飞机', train:'高铁', bus:'大巴', drive:'自驾', mixed:'组合' }
</script>

<template>
  <article class="transport-card">
    <div class="transport-head"><div><van-tag v-if="best" color="#ff6542">首选</van-tag><span class="mode">{{ modeName[item.mode] }}</span><b>{{ item.title }}</b></div><strong>¥{{ item.price }}</strong></div>
    <div class="time-line"><div><b>{{ item.departure }}</b><small>出发</small></div><span><i></i>{{ Math.floor(item.durationMinutes/60) }}h {{ item.durationMinutes%60 }}m · {{ item.transfers ? item.transfers+'次换乘' : '直达' }}</span><div><b>{{ item.arrival }}</b><small>到达</small></div></div>
    <p>{{ item.detail }}</p>
    <footer><small>{{ item.source }} · {{ new Date(item.updatedAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}) }} 更新</small><van-button size="small" plain round color="#ff6542" :url="item.bookingUrl">去核价</van-button></footer>
  </article>
</template>
