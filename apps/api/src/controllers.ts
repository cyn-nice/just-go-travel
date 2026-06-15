import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { AuthGuard } from './auth.js'
import { StoreService } from './store.js'
import { scoreOptions, TransportService } from './transport.js'
import { TransportOption, TransportSearch } from './types.js'

@Controller('health')
export class HealthController {
  @Get() check() { return { status: 'ok', time: new Date().toISOString() } }
}

class SearchDto implements TransportSearch {
  @IsString() origin!: string; @IsString() destination!: string; @IsDateString() departureDate!: string
  @IsOptional() @IsDateString() returnDate?: string; @IsInt() @Min(1) @Max(9) travelers!: number
  @IsOptional() @Min(0) budget?: number
}
class FavoriteDto { @IsInt() destinationId!: number; @IsOptional() transport?: TransportOption; @IsOptional() search?: TransportSearch }

@Controller('destinations')
export class DestinationsController {
  constructor(private store: StoreService) {}
  @Get('rankings') rankings(@Query('month') month?: string, @Query('days') days?: string, @Query('style') style?: string) {
    const selectedMonth = Math.min(12, Math.max(1, Number(month) || new Date().getMonth() + 1))
    return [...this.store.destinations]
      .filter(x => (!days || x.days <= +days) && (!style || x.styles.includes(style as never)))
      .sort((a, b) => {
        const seasonalDifference = Number(b.bestMonths.includes(selectedMonth)) - Number(a.bestMonths.includes(selectedMonth))
        return seasonalDifference || b.score - a.score
      })
  }
  @Get(':id') one(@Param('id') id: string) {
    const item = this.store.destinations.find(x => x.id === +id)
    if (!item) throw new NotFoundException('目的地不存在')
    return item
  }
}

@Controller('transport')
export class TransportController {
  constructor(private transport: TransportService) {}
  @Post('search') async search(@Body() body: SearchDto) {
    const result = await this.transport.search(body), options = scoreOptions(result.options)
    const sort = (key: 'value' | 'comfort' | 'budget') => [...options].sort((a, b) => b.scores[key] - a.scores[key])
    return { query: body, updatedAt: new Date().toISOString(), cached: result.cached, notice: `当前为参考方案${result.cached ? '（缓存结果）' : ''}，请在出票平台核验实时班次与价格。`, strategies: { value: sort('value'), comfort: sort('comfort'), budget: sort('budget') } }
  }
}

@UseGuards(AuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private store: StoreService, private transport: TransportService) {}
  @Get() list(@Req() req: any) { return this.store.listFavorites(req.user.id) }
  @Post() add(@Req() req: any, @Body() body: FavoriteDto) { return this.store.addFavorite(req.user.id, req.user.phone, body.destinationId, body.transport, body.search) }
  @Delete(':id') async remove(@Req() req: any, @Param('id') id: string) { await this.store.removeFavorite(req.user.id, +id); return { success: true } }
  @Post(':id/refresh-transport') async refresh(@Req() req: any, @Param('id') id: string) {
    const favorite = await this.store.getFavorite(req.user.id, +id)
    if (!favorite.search) throw new NotFoundException('该收藏没有交通查询条件')
    const options = scoreOptions((await this.transport.search(favorite.search)).options)
    favorite.transport = [...options].sort((a, b) => b.scores.value - a.scores.value)[0]
    await this.store.updateFavoriteTransport(req.user.id, favorite)
    return favorite
  }
}
