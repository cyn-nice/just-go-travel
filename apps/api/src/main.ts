import 'reflect-metadata'
import { Module, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AuthController, AuthGuard, SmsService } from './auth.js'
import { DestinationsController, FavoritesController, TransportController } from './controllers.js'
import { StoreService } from './store.js'
import { MockTransportProvider } from './transport.js'
import { TransportService } from './transport.js'
import { AdminController, AdminGuard } from './admin.js'

@Module({
  imports: [JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'local-dev-secret', signOptions: { expiresIn: '30d' } })],
  controllers: [AuthController, DestinationsController, TransportController, FavoritesController, AdminController],
  providers: [StoreService, MockTransportProvider, TransportService, SmsService, AuthGuard, AdminGuard]
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({ origin: process.env.WEB_ORIGIN || 'http://localhost:5173' })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  const config = new DocumentBuilder().setTitle('说走就走 API').setVersion('0.1').addBearerAuth().build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))
  await app.listen(Number(process.env.PORT || 3000))
}
bootstrap()
