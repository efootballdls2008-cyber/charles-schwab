import { get } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

export interface ProfitDataPoint {
  day: string
  profit: number
}

export interface ProfitOverview {
  id: number
  userId: number
  period: string
  data: ProfitDataPoint[]
}

export async function getProfitOverview(userId: number): Promise<ProfitOverview[]> {
  return get<ProfitOverview[]>(ENDPOINTS.profitOverview(userId))
}
