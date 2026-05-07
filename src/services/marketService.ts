import { get } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

export interface MarketStat {
  id: number
  month: string
  btc: number
  xrp: number
  eth: number
  zec: number
  ltc: number
}

export async function getMarketStats(): Promise<MarketStat[]> {
  return get<MarketStat[]>(ENDPOINTS.marketStats)
}
