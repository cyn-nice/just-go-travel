import { defineStore } from 'pinia'
import { api } from './api'
import type { Destination, Favorite, SearchInput, Strategy, TransportOption } from './types'

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: localStorage.getItem('travel-token') || '', phone: localStorage.getItem('travel-phone') || '' }),
  actions: {
    async sendCode(phone: string) { return (await api.post('/auth/sms/send', { phone })).data },
    async login(phone: string, code: string) {
      const { data } = await api.post('/auth/sms/login', { phone, code })
      this.token = data.token; this.phone = phone
      localStorage.setItem('travel-token', data.token); localStorage.setItem('travel-phone', phone)
    },
    logout() { this.token = ''; this.phone = ''; localStorage.removeItem('travel-token'); localStorage.removeItem('travel-phone') }
  }
})

export const useTravelStore = defineStore('travel', {
  state: () => ({ destinations: [] as Destination[], favorites: [] as Favorite[], loading: false, lastSearch: null as SearchInput | null, strategies: null as Record<Strategy, TransportOption[]> | null, notice: '' }),
  actions: {
    async loadDestinations(filters: Record<string, string | number> = {}) { this.loading = true; try { this.destinations = (await api.get('/destinations/rankings', { params: filters })).data } finally { this.loading = false } },
    async searchTransport(input: SearchInput) { this.loading = true; try { const { data } = await api.post('/transport/search', input); this.lastSearch = input; this.strategies = data.strategies; this.notice = data.notice } finally { this.loading = false } },
    async loadFavorites() { this.favorites = (await api.get('/favorites')).data },
    async favorite(destinationId: number, transport?: TransportOption) { await api.post('/favorites', { destinationId, transport, search: this.lastSearch }); await this.loadFavorites() },
    async removeFavorite(id: number) { await api.delete(`/favorites/${id}`); await this.loadFavorites() },
    async refreshFavorite(id: number) { await api.post(`/favorites/${id}/refresh-transport`); await this.loadFavorites() }
  }
})
