import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const imageRoot = join(root, 'apps', 'web', 'public', 'images', 'destinations')
const imageFiles = [
  'altay.jpg',
  'changbai.jpg',
  'dunhuang.jpg',
  'enshi.jpg',
  'gannan.jpg',
  'guilin.jpg',
  'hulunbuir.jpg',
  'ili.jpg',
  'qiandongnan.jpg',
  'qingdao.jpg',
  'sanya.jpg',
  'tengchong.jpg',
  'weihai.jpg',
  'wuyuan.jpg',
  'xishuangbanna.jpg',
  'zhoushan.jpg',
  'cards/altay.jpg',
  'cards/changbai.jpg',
  'cards/dunhuang.jpg',
  'cards/enshi.jpg',
  'cards/gannan.jpg',
  'cards/guilin.jpg',
  'cards/hulunbuir.jpg',
  'cards/ili.jpg',
  'cards/qiandongnan.jpg',
  'cards/qingdao.jpg',
  'cards/sanya.jpg',
  'cards/tengchong.jpg',
  'cards/weihai.jpg',
  'cards/wuyuan.jpg',
  'cards/xishuangbanna.jpg',
  'cards/zhoushan.jpg',
]

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()

try {
  for (const file of imageFiles) {
    const sourcePath = join(imageRoot, file)
    const outputPath = sourcePath.replace(extname(sourcePath), '.webp')
    const jpeg = await readFile(sourcePath)
    const quality = file.startsWith('cards/') ? 0.74 : 0.82
    const webpBase64 = await page.evaluate(
      async ({ base64, quality }) => {
        const image = new Image()
        image.decoding = 'async'
        image.src = `data:image/jpeg;base64,${base64}`
        await image.decode()

        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0)

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
        const bytes = new Uint8Array(await blob.arrayBuffer())
        let binary = ''
        for (const byte of bytes) {
          binary += String.fromCharCode(byte)
        }
        return btoa(binary)
      },
      { base64: jpeg.toString('base64'), quality },
    )

    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, Buffer.from(webpBase64, 'base64'))
    console.log(`converted ${relative(root, sourcePath)} -> ${relative(root, outputPath)}`)
  }
} finally {
  await browser.close()
}
