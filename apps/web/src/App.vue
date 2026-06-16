<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute(), router = useRouter()
const active = computed({
  get: () => String(route.meta.tab || ''),
  set: value => {
    const path = value === 'home' ? '/' : `/${value}`
    router.push(path).then(() => window.scrollTo({ top: 0, left: 0 }))
  },
})
</script>

<template>
  <main class="app-shell"><router-view /></main>
  <van-tabbar v-if="route.meta.tab" v-model="active" class="main-tabbar" fixed safe-area-inset-bottom active-color="#ff6542" inactive-color="#8b8b8b">
    <van-tabbar-item name="home" icon="fire-o">当季推荐</van-tabbar-item>
    <van-tabbar-item name="transport" icon="guide-o">交通方案</van-tabbar-item>
    <van-tabbar-item name="profile" icon="contact-o">我的</van-tabbar-item>
  </van-tabbar>
</template>
