import { Injectable } from '@nestjs/common'
import { Strategy, TransportOption, TransportSearch } from './types.js'

export interface TransportProvider { search(input: TransportSearch): Promise<TransportOption[]> }

const now = () => new Date().toISOString()

@Injectable()
export class MockTransportProvider implements TransportProvider {
  async search(input: TransportSearch): Promise<TransportOption[]> {
    const scale = Math.max(1, Math.min(2.2, (input.origin.length + input.destination.length) / 4))
    const base = Math.round(260 * scale)
    return [
      { id: 'G-' + Date.now(), mode: 'train', title: '高铁直达', departure: '08:12', arrival: '13:06', durationMinutes: 294, transfers: 0, price: base, comfort: 82, detail: '二等座 · 车站候车时间可控', updatedAt: now(), bookingUrl: 'https://www.12306.cn/', source: '示例运价 / 12306 核价', referenceOnly: true },
      { id: 'F-' + Date.now(), mode: 'flight', title: '直飞航班', departure: '10:35', arrival: '12:50', durationMinutes: 135, transfers: 0, price: Math.round(base * 1.75), comfort: 90, detail: '含预计机场通勤，不含托运行李附加费', updatedAt: now(), bookingUrl: 'https://www.qunar.com/', source: '示例运价 / 平台核价', referenceOnly: true },
      { id: 'B-' + Date.now(), mode: 'bus', title: '夜间大巴', departure: '21:00', arrival: '07:20', durationMinutes: 620, transfers: 0, price: Math.round(base * .55), comfort: 48, detail: '节省一晚住宿，长时间乘坐', updatedAt: now(), bookingUrl: 'https://www.qunar.com/', source: '示例运价 / 客运站核价', referenceOnly: true },
      { id: 'M-' + Date.now(), mode: 'mixed', title: '普铁 + 城际巴士', departure: '06:40', arrival: '14:30', durationMinutes: 470, transfers: 1, price: Math.round(base * .72), comfort: 62, detail: '中转约 55 分钟，请预留余量', updatedAt: now(), bookingUrl: 'https://www.12306.cn/', source: '示例组合方案', referenceOnly: true },
      { id: 'D-' + Date.now(), mode: 'drive', title: '自驾拼车参考', departure: '07:00', arrival: '15:10', durationMinutes: 490, transfers: 0, price: Math.round(base * 1.25), comfort: 76, detail: '费用按油费与路桥费估算，未计车辆折旧', updatedAt: now(), bookingUrl: 'https://ditu.amap.com/', source: '里程估算 / 高德核路', referenceOnly: true }
    ]
  }
}

@Injectable()
export class TransportService {
  private cache = new Map<string, { options: TransportOption[]; expiresAt: number }>()
  constructor(private provider: MockTransportProvider) {}
  async search(input: TransportSearch) {
    const key = JSON.stringify(input)
    const cached = this.cache.get(key)
    if (cached && cached.expiresAt > Date.now()) return { options: cached.options, cached: true }
    try {
      const options = await Promise.race([
        this.provider.search(input),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('provider timeout')), 5000))
      ])
      this.cache.set(key, { options, expiresAt: Date.now() + 10 * 60 * 1000 })
      return { options, cached: false }
    } catch (error) {
      if (cached) return { options: cached.options, cached: true }
      throw error
    }
  }
}

const weights: Record<Strategy, [number, number, number, number]> = {
  value: [.36, .29, .22, .13], comfort: [.12, .28, .48, .12], budget: [.68, .12, .08, .12]
}

export function scoreOptions(options: TransportOption[]) {
  const prices = options.map(x => x.price), times = options.map(x => x.durationMinutes)
  const minP = Math.min(...prices), maxP = Math.max(...prices), minT = Math.min(...times), maxT = Math.max(...times)
  const norm = (v: number, min: number, max: number) => max === min ? 100 : 100 - (v - min) / (max - min) * 100
  return options.map(option => {
    const parts = [norm(option.price, minP, maxP), norm(option.durationMinutes, minT, maxT), option.comfort, Math.max(0, 100 - option.transfers * 35)]
    const scores = Object.fromEntries(Object.entries(weights).map(([key, ws]) => [key, Math.round(parts.reduce((sum, part, i) => sum + part * ws[i], 0))])) as Record<Strategy, number>
    return { ...option, scores }
  })
}
