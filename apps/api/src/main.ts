import 'reflect-metadata'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { brotliCompressSync, gzipSync } from 'node:zlib'
import { extname, join, relative } from 'node:path'
import { Module, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AuthController, AuthGuard, SmsService } from './auth.js'
import { DestinationsController, FavoritesController, HealthController, TransportController } from './controllers.js'
import { StoreService } from './store.js'
import { MockTransportProvider } from './transport.js'
import { TransportService } from './transport.js'
import { AdminController, AdminGuard } from './admin.js'

@Module({
  imports: [JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'local-dev-secret', signOptions: { expiresIn: '30d' } })],
  controllers: [AuthController, HealthController, DestinationsController, TransportController, FavoritesController, AdminController],
  providers: [StoreService, MockTransportProvider, TransportService, SmsService, AuthGuard, AdminGuard]
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({ origin: process.env.WEB_ORIGIN || 'http://localhost:5173' })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  const config = new DocumentBuilder().setTitle('说走就走 API').setVersion('0.1').addBearerAuth().build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))
  const webRootCandidates = [
    join(__dirname, '..', '..', 'web', 'dist'),
    join(process.cwd(), 'apps', 'web', 'dist'),
    join(process.cwd(), '..', 'web', 'dist'),
  ]
  const webRoot = webRootCandidates.find(existsSync)
  if (webRoot) {
    const compressedAssetCache = new Map<string, { mtimeMs: number; body: Buffer }>()
    const compressedAssetTypes: Record<string, string> = {
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
    }
    app.getHttpAdapter().getInstance().get(/\.(css|js|json|svg)$/, (request: any, response: any, next: () => void) => {
      const acceptedEncoding = String(request.headers['accept-encoding'] || '')
      const encoding = acceptedEncoding.includes('br') ? 'br' : acceptedEncoding.includes('gzip') ? 'gzip' : ''
      if (!encoding) return next()

      let pathname = ''
      try {
        pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      } catch {
        return next()
      }

      const assetPath = join(webRoot, pathname)
      const assetRelativePath = relative(webRoot, assetPath)
      if (assetRelativePath.startsWith('..') || assetRelativePath === '' || !existsSync(assetPath)) return next()

      const extension = extname(assetPath)
      const contentType = compressedAssetTypes[extension]
      if (!contentType) return next()

      const stats = statSync(assetPath)
      const cacheKey = `${encoding}:${assetPath}`
      let cached = compressedAssetCache.get(cacheKey)
      if (!cached || cached.mtimeMs !== stats.mtimeMs) {
        const raw = readFileSync(assetPath)
        cached = { mtimeMs: stats.mtimeMs, body: encoding === 'br' ? brotliCompressSync(raw) : gzipSync(raw) }
        compressedAssetCache.set(cacheKey, cached)
      }

      response.setHeader('Content-Type', contentType)
      response.setHeader('Content-Encoding', encoding)
      response.setHeader('Cache-Control', 'public, max-age=2592000, immutable')
      response.setHeader('Vary', 'Accept-Encoding')
      response.send(cached.body)
    })
    app.useStaticAssets(webRoot, { index: false, maxAge: '30d', immutable: true })
    app.getHttpAdapter().getInstance().get(/^(?!\/api(?:\/|$)).*/, (_request: unknown, response: { sendFile(path: string): void }) => {
      response.sendFile(join(webRoot, 'index.html'))
    })
  }
  await app.listen(Number(process.env.PORT || 3000))
}
bootstrap()
