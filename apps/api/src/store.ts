import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import mysql, { Pool } from 'mysql2/promise'
import { destinations } from './data.js'
import { Destination, Favorite, TransportOption, TransportSearch } from './types.js'

@Injectable()
export class StoreService implements OnModuleInit, OnModuleDestroy {
  private favorites: Favorite[] = []
  private nextId = 1
  private pool?: Pool
  destinations = destinations

  async onModuleInit() {
    if (process.env.DATA_STORE !== 'mysql') return
    this.pool = mysql.createPool(process.env.DATABASE_URL || 'mysql://travel:travel@localhost:3306/just_go')
    await this.pool.query('SELECT 1')
    for (const item of this.destinations) {
      await this.pool.execute(
        `INSERT INTO destinations (id,name,province,cover_url,slogan,reason,best_months,suggested_days,budget_min,budget_max,styles,seasonal_score,features,route,tips,status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published') ON DUPLICATE KEY UPDATE name=VALUES(name),province=VALUES(province),cover_url=VALUES(cover_url),slogan=VALUES(slogan),reason=VALUES(reason),best_months=VALUES(best_months),suggested_days=VALUES(suggested_days),budget_min=VALUES(budget_min),budget_max=VALUES(budget_max),styles=VALUES(styles),seasonal_score=VALUES(seasonal_score),features=VALUES(features),route=VALUES(route),tips=VALUES(tips),status='published'`,
        [item.id,item.name,item.province,item.cover,item.slogan,item.reason,JSON.stringify(item.bestMonths),item.days,item.budgetMin,item.budgetMax,JSON.stringify(item.styles),item.score,JSON.stringify(item.features),JSON.stringify(item.route),JSON.stringify(item.tips)]
      )
      await this.pool.execute('DELETE FROM attractions WHERE destination_id=?', [item.id])
      for (const spot of item.attractions) await this.pool.execute('INSERT INTO attractions (id,destination_id,name,description,tag) VALUES (?,?,?,?,?)', [spot.id,item.id,spot.name,spot.description,spot.tag])
    }
  }
  async onModuleDestroy() { await this.pool?.end() }

  private async ensureUser(userId: number, phone: string) {
    if (this.pool) await this.pool.execute('INSERT INTO users (id,phone) VALUES (?,?) ON DUPLICATE KEY UPDATE phone=VALUES(phone)', [userId, phone])
  }
  async saveDestination(id: number, input: Destination) {
    const index = this.destinations.findIndex(x => x.id === id)
    const item = { ...input, id }
    if (index >= 0) this.destinations[index] = item
    else this.destinations.push(item)
    if (this.pool) await this.pool.execute(
      `INSERT INTO destinations (id,name,province,cover_url,slogan,reason,best_months,suggested_days,budget_min,budget_max,styles,seasonal_score,features,route,tips,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published') ON DUPLICATE KEY UPDATE name=VALUES(name),province=VALUES(province),cover_url=VALUES(cover_url),slogan=VALUES(slogan),reason=VALUES(reason),best_months=VALUES(best_months),suggested_days=VALUES(suggested_days),budget_min=VALUES(budget_min),budget_max=VALUES(budget_max),styles=VALUES(styles),seasonal_score=VALUES(seasonal_score),features=VALUES(features),route=VALUES(route),tips=VALUES(tips)`,
      [item.id,item.name,item.province,item.cover,item.slogan,item.reason,JSON.stringify(item.bestMonths),item.days,item.budgetMin,item.budgetMax,JSON.stringify(item.styles),item.score,JSON.stringify(item.features),JSON.stringify(item.route),JSON.stringify(item.tips)]
    )
    if (this.pool) {
      await this.pool.execute('DELETE FROM attractions WHERE destination_id=?', [id])
      for (const spot of item.attractions) await this.pool.execute('INSERT INTO attractions (id,destination_id,name,description,tag) VALUES (?,?,?,?,?)', [spot.id,id,spot.name,spot.description,spot.tag])
    }
    return item
  }
  async listFavorites(userId: number) {
    if (!this.pool) return this.favorites.filter(x => x.userId === userId)
    const [rows] = await this.pool.query<any[]>('SELECT id,user_id,destination_snapshot,transport_snapshot,search_snapshot,created_at FROM favorites WHERE user_id=? ORDER BY created_at DESC', [userId])
    return rows.map(row => ({ id: row.id, userId: row.user_id, destination: row.destination_snapshot, transport: row.transport_snapshot || undefined, search: row.search_snapshot || undefined, createdAt: new Date(row.created_at).toISOString() })) as Favorite[]
  }
  async addFavorite(userId: number, phone: string, destinationId: number, transport?: TransportOption, search?: TransportSearch) {
    const destination = this.destinations.find(x => x.id === destinationId)
    if (!destination) throw new NotFoundException('目的地不存在')
    if (this.pool) {
      await this.ensureUser(userId, phone)
      await this.pool.execute(`INSERT INTO favorites (user_id,destination_id,destination_snapshot,transport_snapshot,search_snapshot) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE transport_snapshot=VALUES(transport_snapshot),search_snapshot=VALUES(search_snapshot)`, [userId,destinationId,JSON.stringify(destination),transport ? JSON.stringify(transport) : null,search ? JSON.stringify(search) : null])
      const list = await this.listFavorites(userId)
      return list.find(x => x.destination.id === destinationId)!
    }
    const existing = this.favorites.find(x => x.userId === userId && x.destination.id === destinationId)
    if (existing) return existing
    const favorite = { id: this.nextId++, userId, destination: structuredClone(destination), transport, search, createdAt: new Date().toISOString() }
    this.favorites.unshift(favorite)
    return favorite
  }
  async removeFavorite(userId: number, id: number) {
    if (this.pool) { await this.pool.execute('DELETE FROM favorites WHERE user_id=? AND id=?', [userId,id]); return }
    this.favorites = this.favorites.filter(x => !(x.userId === userId && x.id === id))
  }
  async getFavorite(userId: number, id: number) {
    if (this.pool) {
      const list = await this.listFavorites(userId), favorite = list.find(x => x.id === id)
      if (!favorite) throw new NotFoundException('收藏不存在')
      return favorite
    }
    const favorite = this.favorites.find(x => x.userId === userId && x.id === id)
    if (!favorite) throw new NotFoundException('收藏不存在')
    return favorite
  }
  async updateFavoriteTransport(userId: number, favorite: Favorite) {
    if (this.pool) await this.pool.execute('UPDATE favorites SET transport_snapshot=? WHERE user_id=? AND id=?', [JSON.stringify(favorite.transport),userId,favorite.id])
  }
}
