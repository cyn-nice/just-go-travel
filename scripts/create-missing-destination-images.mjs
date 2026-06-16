import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const imageRoot = join(root, 'apps', 'web', 'public', 'images', 'destinations')

const destinations = [
  { file: 'quanzhou', title: '泉州', subtitle: '开元寺与古城烟火', palette: ['#163b4d', '#d99a48', '#f2d7a2'], motif: 'temple' },
  { file: 'dali', title: '大理', subtitle: '苍山洱海的风', palette: ['#6bb7d6', '#f4f0d2', '#355c7d'], motif: 'lake' },
  { file: 'xiamen', title: '厦门', subtitle: '鼓浪屿海边街巷', palette: ['#4fa7b7', '#ffd6a5', '#e76f51'], motif: 'island' },
  { file: 'chengdu', title: '成都', subtitle: '茶馆、竹影与烟火', palette: ['#2f5d50', '#d8a657', '#7a3e2f'], motif: 'bamboo' },
  { file: 'changsha', title: '长沙', subtitle: '湘江夜色与橘子洲', palette: ['#182848', '#4b6cb7', '#ff9f1c'], motif: 'river' },
  { file: 'nanjing', title: '南京', subtitle: '梧桐树下的六朝风', palette: ['#704214', '#c98b2f', '#2d4739'], motif: 'wall' },
  { file: 'luoyang', title: '洛阳', subtitle: '龙门石窟与盛唐', palette: ['#5c4033', '#c9a66b', '#2f4858'], motif: 'grotto' },
  { file: 'harbin', title: '哈尔滨', subtitle: '冰雪与欧式街景', palette: ['#9bd5e8', '#ffffff', '#355070'], motif: 'snow' },
]

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })

try {
  for (const destination of destinations) {
    for (const variant of ['cover', 'card']) {
      const size = variant === 'cover' ? { width: 1000, height: 750 } : { width: 800, height: 407 }
      const quality = variant === 'cover' ? 0.82 : 0.74
      const bytes = await page.evaluate(
        async ({ destination, size, quality }) => {
          const canvas = document.createElement('canvas')
          canvas.width = size.width
          canvas.height = size.height
          const ctx = canvas.getContext('2d')
          const [a, b, c] = destination.palette

          const sky = ctx.createLinearGradient(0, 0, 0, size.height)
          sky.addColorStop(0, a)
          sky.addColorStop(0.58, b)
          sky.addColorStop(1, c)
          ctx.fillStyle = sky
          ctx.fillRect(0, 0, size.width, size.height)

          ctx.globalAlpha = 0.2
          for (let i = 0; i < 7; i += 1) {
            ctx.beginPath()
            ctx.arc(size.width * (0.12 + i * 0.16), size.height * (0.16 + (i % 2) * 0.08), size.width * 0.16, 0, Math.PI * 2)
            ctx.fillStyle = '#fff'
            ctx.fill()
          }
          ctx.globalAlpha = 1

          function mountain(y, color, offset) {
            ctx.beginPath()
            ctx.moveTo(0, size.height)
            for (let x = -100; x <= size.width + 100; x += 100) {
              ctx.lineTo(x, y + Math.sin((x + offset) / 120) * 34 + (x % 240 === 0 ? -70 : 0))
            }
            ctx.lineTo(size.width, size.height)
            ctx.closePath()
            ctx.fillStyle = color
            ctx.fill()
          }

          mountain(size.height * 0.54, 'rgba(30,45,54,0.48)', 10)
          mountain(size.height * 0.68, 'rgba(19,32,36,0.58)', 90)

          if (destination.motif === 'lake' || destination.motif === 'island' || destination.motif === 'river') {
            const water = ctx.createLinearGradient(0, size.height * 0.55, 0, size.height)
            water.addColorStop(0, 'rgba(255,255,255,0.35)')
            water.addColorStop(1, 'rgba(16,58,78,0.55)')
            ctx.fillStyle = water
            ctx.fillRect(0, size.height * 0.58, size.width, size.height * 0.42)
            for (let y = size.height * 0.66; y < size.height * 0.92; y += 38) {
              ctx.strokeStyle = 'rgba(255,255,255,0.38)'
              ctx.lineWidth = 3
              ctx.beginPath()
              ctx.moveTo(size.width * 0.12, y)
              ctx.bezierCurveTo(size.width * 0.35, y - 18, size.width * 0.5, y + 18, size.width * 0.86, y)
              ctx.stroke()
            }
          }

          if (destination.motif === 'temple' || destination.motif === 'wall' || destination.motif === 'grotto') {
            ctx.fillStyle = 'rgba(68,42,30,0.75)'
            ctx.fillRect(size.width * 0.18, size.height * 0.62, size.width * 0.64, size.height * 0.18)
            ctx.beginPath()
            ctx.moveTo(size.width * 0.12, size.height * 0.62)
            ctx.lineTo(size.width * 0.5, size.height * 0.43)
            ctx.lineTo(size.width * 0.88, size.height * 0.62)
            ctx.closePath()
            ctx.fillStyle = 'rgba(174,82,44,0.88)'
            ctx.fill()
            for (let i = 0; i < 5; i += 1) {
              ctx.fillStyle = 'rgba(255,226,160,0.78)'
              ctx.fillRect(size.width * (0.25 + i * 0.11), size.height * 0.67, size.width * 0.055, size.height * 0.1)
            }
          }

          if (destination.motif === 'bamboo') {
            for (let i = 0; i < 16; i += 1) {
              const x = size.width * (0.08 + i * 0.06)
              ctx.strokeStyle = 'rgba(32,77,58,0.75)'
              ctx.lineWidth = 8
              ctx.beginPath()
              ctx.moveTo(x, size.height)
              ctx.bezierCurveTo(x + 40, size.height * 0.62, x - 30, size.height * 0.28, x + 20, size.height * 0.05)
              ctx.stroke()
            }
          }

          if (destination.motif === 'snow') {
            ctx.fillStyle = 'rgba(255,255,255,0.85)'
            ctx.beginPath()
            ctx.moveTo(0, size.height * 0.7)
            ctx.bezierCurveTo(size.width * 0.25, size.height * 0.62, size.width * 0.7, size.height * 0.8, size.width, size.height * 0.68)
            ctx.lineTo(size.width, size.height)
            ctx.lineTo(0, size.height)
            ctx.closePath()
            ctx.fill()
          }

          ctx.fillStyle = 'rgba(0,0,0,0.18)'
          ctx.fillRect(0, 0, size.width, size.height)

          ctx.fillStyle = '#fff'
          ctx.shadowColor = 'rgba(0,0,0,0.35)'
          ctx.shadowBlur = 14
          ctx.font = `700 ${Math.round(size.width * 0.082)}px "Microsoft YaHei", sans-serif`
          ctx.fillText(destination.title, size.width * 0.07, size.height * 0.78)
          ctx.font = `400 ${Math.round(size.width * 0.03)}px "Microsoft YaHei", sans-serif`
          ctx.fillText(destination.subtitle, size.width * 0.075, size.height * 0.86)
          ctx.shadowBlur = 0

          const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
          return Array.from(new Uint8Array(await blob.arrayBuffer()))
        },
        { destination, size, quality },
      )

      const targetDir = variant === 'cover' ? imageRoot : join(imageRoot, 'cards')
      await mkdir(targetDir, { recursive: true })
      await writeFile(join(targetDir, `${destination.file}.webp`), Buffer.from(bytes))
    }
    console.log(`created ${destination.file}.webp`)
  }
} finally {
  await browser.close()
}
