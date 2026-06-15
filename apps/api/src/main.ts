import 'reflect-metadata'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
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
    app.useStaticAssets(webRoot)
    app.getHttpAdapter().getInstance().get(/^(?!\/api(?:\/|$)).*/, (_request: unknown, response: { sendFile(path: string): void }) => {
      response.sendFile(join(webRoot, 'index.html'))
    })
  }
  await app.listen(Number(process.env.PORT || 3000))
}
bootstrap()
