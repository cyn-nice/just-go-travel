import { Body, CanActivate, Controller, ExecutionContext, Get, Injectable, Param, Put, UnauthorizedException, UseGuards } from '@nestjs/common'
import { StoreService } from './store.js'
import { Destination } from './types.js'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const key = context.switchToHttp().getRequest().headers['x-admin-key']
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) throw new UnauthorizedException('管理密钥无效')
    return true
  }
}

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private store: StoreService) {}
  @Get('destinations') destinations() { return this.store.destinations }
  @Put('destinations/:id') save(@Param('id') id: string, @Body() body: Destination) { return this.store.saveDestination(+id, body) }
  @Get('data-sources') sources() {
    return [
      { provider: '原创目的地摘要', sourceType: 'manual', trustLevel: 'verified', licenseNote: '公共事实与人工原创整理' },
      { provider: 'MockTransportProvider', sourceType: 'reference', trustLevel: 'reference', licenseNote: '开发演示数据，必须跳转正式平台核价' }
    ]
  }
}
