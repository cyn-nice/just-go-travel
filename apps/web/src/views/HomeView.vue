<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import DestinationCard from '../components/DestinationCard.vue'
import { useTravelStore } from '../stores'
const store = useTravelStore()
const filters = reactive({ month: new Date().getMonth() + 1, days: '', style: '' })
const showMonthPicker = ref(false)
const months = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: `${index + 1}月` }))
const monthColumns = months.map(month => ({ text: month.label, value: month.value }))
const selectedMonthLabel = computed(() => `${filters.month}月当季推荐`)
const dayOptions = [
  { text: '不限天数', value: '' },
  { text: '2天内', value: 2 },
  { text: '3天内', value: 3 },
  { text: '5天内', value: 5 },
]
const styleOptions = [
  { text: '全部偏好', value: '' },
  { text: '自然风光', value: 'nature' },
  { text: '人文古城', value: 'culture' },
  { text: '吃吃喝喝', value: 'food' },
  { text: '松弛度假', value: 'relax' },
]
const refresh = () => store.loadDestinations(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
function confirmMonth({ selectedValues }: { selectedValues: number[] }) {
  filters.month = Number(selectedValues[0])
  showMonthPicker.value = false
  refresh()
}
onMounted(refresh)
</script>

<template>
  <section class="page home-page">
    <van-popup v-model:show="showMonthPicker" position="bottom" round safe-area-inset-bottom>
      <van-picker
        title="选择推荐月份"
        :columns="monthColumns"
        :model-value="[filters.month]"
        @confirm="confirmMonth"
        @cancel="showMonthPicker = false"
      />
    </van-popup>

    <div class="section-head seasonal-section-head">
      <div><small>DESTINATION RANKING</small><button class="inline-month-selector" type="button" @click="showMonthPicker = true"><b>{{ selectedMonthLabel }}</b><van-icon name="arrow-down" /></button></div>
      <span>{{ store.destinations.length }} 个目的地</span>
    </div>
    <van-dropdown-menu class="filters">
      <van-dropdown-item v-model="filters.days" :options="dayOptions" @change="refresh" />
      <van-dropdown-item v-model="filters.style" :options="styleOptions" @change="refresh" />
    </van-dropdown-menu>
    <van-skeleton v-if="store.loading" title :row="6" />
    <div v-else class="destination-list">
      <DestinationCard v-for="(item,index) in store.destinations" :key="item.id" :item="item" :rank="index+1" />
      <van-empty v-if="!store.destinations.length" description="换个筛选条件看看" />
    </div>
    <p class="source-note">推荐综合月份适宜度、交通便利度与公开旅游趋势整理；排名仅作出行灵感参考。</p>
  </section>
</template>
