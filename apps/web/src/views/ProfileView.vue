<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { showConfirmDialog, showFailToast, showToast } from 'vant'
import { useAuthStore, useTravelStore } from '../stores'

const auth = useAuthStore()
const store = useTravelStore()
const sending = ref(false)
const loggingIn = ref(false)
const countdown = ref(0)
const login = reactive({ phone: '', code: '' })
let countdownTimer: ReturnType<typeof setInterval> | undefined

function getErrorMessage(error: unknown) {
  const message = (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
  return Array.isArray(message) ? message[0] : message || '请求失败，请稍后重试'
}

function startCountdown(seconds: number) {
  countdown.value = seconds
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && countdownTimer) clearInterval(countdownTimer)
  }, 1000)
}

async function send() {
  if (!/^1\d{10}$/.test(login.phone)) return showFailToast('请输入正确的中国大陆手机号')
  sending.value = true
  try {
    const data = await auth.sendCode(login.phone)
    showToast(data.devCode ? `开发验证码：${data.devCode}` : '验证码已发送')
    startCountdown(data.resendAfter || 60)
  } catch (error) {
    showFailToast(getErrorMessage(error))
  } finally {
    sending.value = false
  }
}

async function submit() {
  loggingIn.value = true
  try {
    await auth.login(login.phone, login.code)
    await store.loadFavorites()
    showToast('登录成功')
  } catch (error) {
    showFailToast(getErrorMessage(error))
  } finally {
    loggingIn.value = false
  }
}

async function remove(id: number) {
  await showConfirmDialog({ title: '移除收藏', message: '确定不再保留这份攻略吗？' })
  await store.removeFavorite(id)
}

async function logout() {
  await showConfirmDialog({ title: '退出登录', message: '收藏仍会保存在账号中。' })
  auth.logout()
  store.favorites = []
}

onMounted(() => {
  if (auth.token) store.loadFavorites().catch(() => auth.logout())
})
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<template>
  <section class="page profile-page">
    <header class="profile-header">
      <small>MY JOURNEY</small>
      <h1>{{ auth.token ? '下一次出发，' : '把心动路线，' }}<i>{{ auth.token ? '就在收藏里' : '先存下来' }}</i></h1>
      <p>{{ auth.token ? '你的目的地灵感和交通方案都在这里。' : '登录后收藏攻略可跨设备查看。' }}</p>
    </header>

    <template v-if="!auth.token">
      <van-form class="login-card" @submit="submit">
        <div class="login-card-title">
          <div><small>手机号验证</small><h2>快捷登录</h2></div>
          <van-icon name="shield-o" />
        </div>

        <div class="login-fields">
          <van-field
            v-model="login.phone"
            type="tel"
            maxlength="11"
            label="手机号"
            placeholder="请输入中国大陆手机号"
            clearable
            left-icon="phone-o"
            :rules="[{ required: true, pattern: /^1\d{10}$/, message: '请输入正确手机号' }]"
          />
          <van-field
            v-model="login.code"
            type="digit"
            maxlength="6"
            label="验证码"
            placeholder="6 位验证码"
            clearable
            left-icon="shield-o"
            :rules="[{ required: true, pattern: /^\d{6}$/, message: '请输入 6 位验证码' }]"
          >
            <template #button>
              <van-button size="small" plain round color="#ff6542" :disabled="countdown > 0" :loading="sending" @click.prevent="send">
                {{ countdown ? `${countdown}s` : '获取验证码' }}
              </van-button>
            </template>
          </van-field>
        </div>

        <p class="login-security-note"><van-icon name="passed" /> 验证码 5 分钟内有效，仅用于本次登录</p>
        <van-button block round color="#171717" native-type="submit" :loading="loggingIn" loading-text="正在登录">
          登录并继续
        </van-button>
        <small class="agreement">登录即表示同意 <router-link to="/legal/terms">用户协议</router-link> 与 <router-link to="/legal/privacy">隐私政策</router-link></small>
      </van-form>
    </template>

    <template v-else>
      <div class="user-card">
        <div><small>当前账号</small><strong>{{ auth.phone.slice(0, 3) }}****{{ auth.phone.slice(-4) }}</strong></div>
        <span>{{ store.favorites.length }} 份心动攻略</span>
      </div>
      <div class="section-head"><div><small>SAVED TRIPS</small><h2>我的收藏</h2></div></div>
      <div v-if="store.favorites.length" class="favorite-list">
        <van-swipe-cell v-for="favorite in store.favorites" :key="favorite.id">
          <article class="favorite-card" @click="$router.push(`/destination/${favorite.destination.id}`)">
            <van-image width="110" height="98" fit="cover" lazy-load :src="favorite.destination.cover" />
            <div>
              <small>{{ new Date(favorite.createdAt).toLocaleDateString('zh-CN') }} 收藏</small>
              <h3>{{ favorite.destination.name }}</h3>
              <p>{{ favorite.destination.province }} · 建议 {{ favorite.destination.days }} 天</p>
              <b v-if="favorite.transport">{{ favorite.transport.title }} · 交通参考 ¥{{ favorite.transport.price }}</b>
            </div>
            <van-button v-if="favorite.search" size="mini" plain round @click.stop="store.refreshFavorite(favorite.id)">更新价格</van-button>
          </article>
          <template #right><van-button square text="删除" type="danger" class="delete-button" @click="remove(favorite.id)" /></template>
        </van-swipe-cell>
      </div>
      <div v-else class="no-favorites">
        <van-empty description="还没有收藏攻略"><van-button round color="#ff6542" @click="$router.push('/')">去发现目的地</van-button></van-empty>
      </div>
      <van-cell-group inset class="settings">
        <van-cell title="用户协议" icon="description" is-link to="/legal/terms" />
        <van-cell title="隐私政策" icon="shield-o" is-link to="/legal/privacy" />
        <van-cell title="退出登录" icon="close" is-link @click="logout" />
      </van-cell-group>
    </template>
  </section>
</template>
