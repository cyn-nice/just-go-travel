<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { showFailToast } from 'vant'
import TransportCard from '../components/TransportCard.vue'
import { useTravelStore } from '../stores'
import type { Strategy } from '../types'

type CityField = 'origin' | 'destination'

const route = useRoute()
const store = useTravelStore()
const active = ref<Strategy>('value')
const minDate = new Date().toISOString().slice(0, 10)
const cityPopupVisible = ref(false)
const activeCityField = ref<CityField>('origin')
const pickerValues = ref<string[]>([])

const cities = [
  '北京', '上海', '广州', '深圳', '成都', '重庆', '杭州', '南京', '武汉', '西安',
  '长沙', '郑州', '天津', '苏州', '青岛', '厦门', '福州', '泉州', '济南', '威海',
  '烟台', '大连', '沈阳', '长春', '哈尔滨', '昆明', '大理', '丽江', '西双版纳',
  '贵阳', '黔东南', '桂林', '南宁', '三亚', '海口', '太原', '洛阳', '合肥',
  '南昌', '景德镇', '兰州', '敦煌', '甘南', '西宁', '银川', '呼和浩特',
  '乌鲁木齐', '阿勒泰', '伊宁', '拉萨', '林芝', '张家界', '恩施', '舟山',
]
const cityColumns = cities.map(city => ({ text: city, value: city }))

const form = reactive({
  origin: '',
  destination: String(route.query.destination || ''),
  departureDate: minDate,
  returnDate: '',
})

const current = computed(() => store.strategies?.[active.value] || [])
const pickerTitle = computed(() => activeCityField.value === 'origin' ? '选择出发城市' : '选择目的城市')

function openCityPicker(field: CityField) {
  activeCityField.value = field
  const selected = form[field]
  pickerValues.value = selected && cities.includes(selected) ? [selected] : [cities[0]]
  cityPopupVisible.value = true
}

function confirmCity({ selectedValues }: { selectedValues: Array<string | number> }) {
  form[activeCityField.value] = String(selectedValues[0] || '')
  cityPopupVisible.value = false
}

function swapCities() {
  const origin = form.origin
  form.origin = form.destination
  form.destination = origin
}

async function submit() {
  if (!form.origin) return showFailToast('请选择出发城市')
  if (!form.destination) return showFailToast('请选择目的城市')
  if (form.origin === form.destination) return showFailToast('出发地和目的地不能相同')
  if (!form.departureDate) return showFailToast('请选择出发日期')
  if (form.departureDate < minDate) return showFailToast('出发日期不能早于今天')
  if (form.returnDate && form.returnDate < form.departureDate) return showFailToast('返程日期不能早于出发日期')

  await store.searchTransport({
    origin: form.origin,
    destination: form.destination,
    departureDate: form.departureDate,
    returnDate: form.returnDate || undefined,
    travelers: 1,
  })
}
</script>

<template>
  <section class="page transport-page">
    <header class="simple-header">
      <small>SMART ROUTE</small>
      <h1>怎么去，<i>更划算</i></h1>
      <p>同一段旅程，按你的优先级重新排序。</p>
    </header>

    <van-form class="search-panel" @submit="submit">
      <div class="city-route-selector">
        <button type="button" class="city-select" @click="openCityPicker('origin')">
          <span>出发地</span>
          <strong :class="{ placeholder: !form.origin }">{{ form.origin || '选择城市' }}</strong>
          <van-icon name="arrow" />
        </button>

        <button type="button" class="swap-city" aria-label="交换出发地和目的地" @click="swapCities">
          <van-icon name="exchange" />
        </button>

        <button type="button" class="city-select" @click="openCityPicker('destination')">
          <span>目的地</span>
          <strong :class="{ placeholder: !form.destination }">{{ form.destination || '选择城市' }}</strong>
          <van-icon name="arrow" />
        </button>
      </div>

      <div class="date-fields">
        <van-field v-model="form.departureDate" type="date" label="出发日期" left-icon="calendar-o" />
        <van-field v-model="form.returnDate" type="date" label="返程日期" placeholder="可不填" left-icon="calendar-o" />
      </div>

      <van-button block round color="#171717" native-type="submit" :loading="store.loading" loading-text="正在比较">
        立即比较方案
      </van-button>
    </van-form>

    <template v-if="store.strategies">
      <van-notice-bar wrapable :scrollable="false" color="#8a5a00" background="#fff5dd" left-icon="info-o">
        {{ store.notice }}
      </van-notice-bar>
      <van-tabs v-model:active="active" sticky offset-top="0" color="#ff6542" title-active-color="#171717" animated swipeable>
        <van-tab name="value" title="性价比" />
        <van-tab name="comfort" title="最舒适" />
        <van-tab name="budget" title="穷游" />
      </van-tabs>
      <div class="transport-list">
        <TransportCard v-for="(item, index) in current" :key="item.id" :item="item" :best="index === 0" />
      </div>
    </template>

    <div v-else class="empty-route">
      <span>→</span>
      <h3>选好城市，就能出发</h3>
      <p>我们会把价格、耗时、舒适度与换乘次数放在一起比较。</p>
    </div>

    <van-popup v-model:show="cityPopupVisible" position="bottom" round teleport="body">
      <van-picker
        v-model="pickerValues"
        :title="pickerTitle"
        :columns="cityColumns"
        @confirm="confirmCity"
        @cancel="cityPopupVisible = false"
      />
    </van-popup>
  </section>
</template>
