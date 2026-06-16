import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { Lazyload } from 'vant'
import './style.css'
import './fullscreen.css'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import DestinationView from './views/DestinationView.vue'
import TransportView from './views/TransportView.vue'
import ProfileView from './views/ProfileView.vue'
import LegalView from './views/LegalView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView, meta: { tab: 'home' } },
    { path: '/destination/:id', component: DestinationView },
    { path: '/transport', component: TransportView, meta: { tab: 'transport' } },
    { path: '/profile', component: ProfileView, meta: { tab: 'profile' } },
    { path: '/legal/:type', component: LegalView },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition && !to.meta.tab) return savedPosition
    if (to.path !== from.path) return { left: 0, top: 0 }
    return false
  },
})

createApp(App).use(createPinia()).use(router).use(Lazyload).mount('#app')
