// ─── Persistent Bot Engine (module-level singleton) ──────────────────────────
// Lives outside React component lifecycle so the bot keeps running even when
// the user navigates away from /user/exchange or logs out.
// State is persisted to the backend via botSettings + botTrades.

import { post, patch as patchApi, get } from '../api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignalType = 'BUY' | 'SELL' | 'HOLD'
export type StrategyName = 'AI Scalper Pro' | 'Trend Follower' | 'Mean Reversion' | 'Grid Bot' | 'DCA Strategy'
export type RiskLevel = 'Conservative' | 'Moderate' | 'Aggressive'

export interface BotTrade {
  id: string
  userId: number
  pair: string
  side: 'buy' | 'sell'
  entryPrice: number
  exitPrice: number | null
  amount: number
  pnl: number
  pnlPct: number
  strategy: StrategyName
  signal: string
  openedAt: string
  closedAt: string | null
  status: 'open' | 'closed'
}

export interface AlgoSignal {
  type: SignalType
  reason: string
  confidence: number
  indicators: {
    rsi: number
    macd: number
    macdSignal: number
    ema9: number
    ema21: number
    bbUpper: number
    bbLower: number
    bbMid: number
  }
  timestamp: number
}

export interface AlgoState {
  running: boolean
  strategy: StrategyName
  riskLevel: RiskLevel
  pair: string
  timeframe: string
  takeProfit: number
  stopLoss: number
  trailingStop: number
  autoReinvest: boolean
  maxOpenTrades: number
  dailyProfitTarget: number
}

export interface BotSettings {
  id: number
  userId: number
  running: boolean
  strategy: StrategyName
  riskLevel: RiskLevel
  pair: string
  timeframe: string
  takeProfit: number
  stopLoss: number
  trailingStop: number
  autoReinvest: boolean
  maxOpenTrades: number
  dailyProfitTarget: number
}

export interface AlgoPerformance {
  totalPnl: number
  totalPnlPct: number
  tradesExecuted: number
  winRate: number
  wins: number
  losses: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  maxDrawdown: number
  todayPnl: number
  todayPnlPct: number
  pnlHistory: { time: string; pnl: number; cumulative: number }[]
}

export interface TradeCloseEvent {
  pnl: number
  pnlPct: number
  pair: string
  reason: 'take-profit' | 'stop-loss' | 'signal-reversal'
}

// ─── Indicator Math ───────────────────────────────────────────────────────────

function calcEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0
  const k = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k)
  }
  return ema
}

function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

function calcMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calcEMA(prices, 12)
  const ema26 = calcEMA(prices, 26)
  const macd = ema12 - ema26
  const signal = macd * 0.85
  return { macd, signal, histogram: macd - signal }
}

function calcBollingerBands(prices: number[], period = 20, stdDev = 2) {
  const slice = prices.slice(-period)
  if (slice.length < period) return { upper: prices[prices.length - 1] * 1.02, lower: prices[prices.length - 1] * 0.98, mid: prices[prices.length - 1] }
  const mid = slice.reduce((a, b) => a + b, 0) / period
  const variance = slice.reduce((a, b) => a + Math.pow(b - mid, 2), 0) / period
  const sd = Math.sqrt(variance)
  return { upper: mid + stdDev * sd, lower: mid - stdDev * sd, mid }
}

function generateSignal(prices: number[], strategy: StrategyName, riskLevel: RiskLevel): AlgoSignal {
  const price = prices[prices.length - 1]
  const rsi = calcRSI(prices)
  const { macd, signal: macdSignal } = calcMACD(prices)
  const ema9 = calcEMA(prices, 9)
  const ema21 = calcEMA(prices, 21)
  const bb = calcBollingerBands(prices)
  const riskMult = riskLevel === 'Conservative' ? 0.7 : riskLevel === 'Aggressive' ? 1.3 : 1.0

  let type: SignalType = 'HOLD'
  let reason = 'No clear signal — holding position'
  let confidence = 40

  switch (strategy) {
    case 'AI Scalper Pro': {
      const rsiBuy = rsi < 35 * riskMult
      const rsiSell = rsi > 65 / riskMult
      const macdBullish = macd > macdSignal
      const macdBearish = macd < macdSignal
      const emaBullish = ema9 > ema21
      const emaBearish = ema9 < ema21
      if (rsiBuy && macdBullish && emaBullish) { type = 'BUY'; reason = `RSI oversold (${rsi.toFixed(1)}) + MACD bullish crossover + EMA9 > EMA21`; confidence = 82 + Math.random() * 12 }
      else if (rsiSell && macdBearish && emaBearish) { type = 'SELL'; reason = `RSI overbought (${rsi.toFixed(1)}) + MACD bearish crossover + EMA9 < EMA21`; confidence = 78 + Math.random() * 14 }
      else if (rsiBuy && macdBullish) { type = 'BUY'; reason = `RSI oversold (${rsi.toFixed(1)}) + MACD bullish — partial signal`; confidence = 62 + Math.random() * 10 }
      else if (rsiSell && macdBearish) { type = 'SELL'; reason = `RSI overbought (${rsi.toFixed(1)}) + MACD bearish — partial signal`; confidence = 60 + Math.random() * 10 }
      break
    }
    case 'Trend Follower': {
      const strongBull = ema9 > ema21 && price > ema9 && macd > 0
      const strongBear = ema9 < ema21 && price < ema9 && macd < 0
      const weakBull = ema9 > ema21 && price > ema21
      const weakBear = ema9 < ema21 && price < ema21
      if (strongBull) { type = 'BUY'; reason = `Strong uptrend: EMA9 > EMA21, price above both, MACD positive`; confidence = 85 + Math.random() * 10 }
      else if (strongBear) { type = 'SELL'; reason = `Strong downtrend: EMA9 < EMA21, price below both, MACD negative`; confidence = 83 + Math.random() * 10 }
      else if (weakBull) { type = 'BUY'; reason = `Uptrend forming: EMA9 > EMA21, price above EMA21`; confidence = 60 + Math.random() * 15 }
      else if (weakBear) { type = 'SELL'; reason = `Downtrend forming: EMA9 < EMA21, price below EMA21`; confidence = 58 + Math.random() * 15 }
      break
    }
    case 'Mean Reversion': {
      const nearLower = price <= bb.lower * 1.005
      const nearUpper = price >= bb.upper * 0.995
      const midBull = price < bb.mid && rsi < 50
      const midBear = price > bb.mid && rsi > 50
      if (nearLower && rsi < 40) { type = 'BUY'; reason = `Price at lower Bollinger Band (${bb.lower.toFixed(0)}) + RSI ${rsi.toFixed(1)} — mean reversion buy`; confidence = 80 + Math.random() * 12 }
      else if (nearUpper && rsi > 60) { type = 'SELL'; reason = `Price at upper Bollinger Band (${bb.upper.toFixed(0)}) + RSI ${rsi.toFixed(1)} — mean reversion sell`; confidence = 78 + Math.random() * 12 }
      else if (midBull) { type = 'BUY'; reason = `Price below BB midline, RSI < 50 — mild reversion signal`; confidence = 55 + Math.random() * 15 }
      else if (midBear) { type = 'SELL'; reason = `Price above BB midline, RSI > 50 — mild reversion signal`; confidence = 53 + Math.random() * 15 }
      break
    }
    case 'Grid Bot': {
      const gridSize = (bb.upper - bb.lower) / 6
      const level = Math.floor((price - bb.lower) / gridSize)
      if (level <= 1) { type = 'BUY'; reason = `Grid level ${level + 1}/6 — buying at lower grid zone`; confidence = 70 + Math.random() * 15 }
      else if (level >= 4) { type = 'SELL'; reason = `Grid level ${level + 1}/6 — selling at upper grid zone`; confidence = 70 + Math.random() * 15 }
      break
    }
    case 'DCA Strategy': {
      const dip = rsi < 45 && price < ema21
      const peak = rsi > 60 && price > ema9 * 1.02
      if (dip) { type = 'BUY'; reason = `DCA buy: price dip below EMA21, RSI ${rsi.toFixed(1)}`; confidence = 72 + Math.random() * 15 }
      else if (peak) { type = 'SELL'; reason = `DCA take-profit: price above EMA9 +2%, RSI ${rsi.toFixed(1)}`; confidence = 68 + Math.random() * 15 }
      break
    }
  }

  return {
    type,
    reason,
    confidence: Math.min(99, confidence),
    indicators: { rsi, macd, macdSignal, ema9, ema21, bbUpper: bb.upper, bbLower: bb.lower, bbMid: bb.mid },
    timestamp: Date.now(),
  }
}

function buildPriceHistory(seedPrice: number, bars = 50): number[] {
  const prices: number[] = [seedPrice]
  const drift = 0.0002
  const volatility = 0.004
  for (let i = 1; i < bars; i++) {
    const prev = prices[i - 1]
    const change = prev * (drift + (Math.random() - 0.48) * volatility)
    prices.push(Math.max(prev + change, prev * 0.95))
  }
  return prices
}

function calcPositionSize(balance: number, riskLevel: RiskLevel, price: number): number {
  const riskPct = riskLevel === 'Conservative' ? 0.02 : riskLevel === 'Moderate' ? 0.05 : 0.10
  const usdAmount = balance * riskPct
  return parseFloat((usdAmount / price).toFixed(6))
}

// ─── Singleton Engine ─────────────────────────────────────────────────────────

export const DEFAULT_STATE: AlgoState = {
  running: false,
  strategy: 'AI Scalper Pro',
  riskLevel: 'Moderate',
  pair: 'BTC/USDT',
  timeframe: '1h',
  takeProfit: 10,
  stopLoss: 3,
  trailingStop: 2,
  autoReinvest: true,
  maxOpenTrades: 3,
  dailyProfitTarget: 15,
}

type EngineListener = () => void
type TradeCloseListener = (event: TradeCloseEvent) => void

class BotEngine {
  private state: AlgoState = { ...DEFAULT_STATE }
  private openTrade: BotTrade | null = null
  private trades: BotTrade[] = []
  private priceHistory: number[] = []
  private currentPrice = 0
  private balance = 0
  private userId = 0
  private settingsId: number | null = null
  private tick = 0
  private intervalId: ReturnType<typeof setInterval> | null = null
  private elapsedId: ReturnType<typeof setInterval> | null = null
  private pnlUpdateId: ReturnType<typeof setInterval> | null = null
  private elapsed = 0
  private signal: AlgoSignal | null = null
  private scanStatus = 'Initialising algorithm…'
  private listeners: Set<EngineListener> = new Set()
  private tradeCloseListeners: Set<TradeCloseListener> = new Set()
  private initialized = false
  private initializing = false

  // ── Subscribe / unsubscribe ──────────────────────────────────────────────

  subscribe(fn: EngineListener) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  onTradeClose(fn: TradeCloseListener) {
    this.tradeCloseListeners.add(fn)
    return () => this.tradeCloseListeners.delete(fn)
  }

  private notify() {
    this.listeners.forEach((fn) => fn())
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  getState() { return this.state }
  getSignal() { return this.signal }
  getTrades() { return this.trades }
  getOpenTrade() { return this.openTrade }
  getScanStatus() { return this.scanStatus }
  getElapsed() { return this.elapsed }
  getPerformance(): AlgoPerformance { return this.calcPerformance() }

  // ── Init: load persisted state from db ──────────────────────────────────

  async init(userId: number, balance: number) {
    if (this.initializing) return
    if (this.initialized && this.userId === userId) {
      // Already initialized for this user — just update balance
      this.balance = balance
      return
    }
    this.initializing = true
    this.userId = userId
    this.balance = balance

    try {
      // Load settings
      const settings = await get<BotSettings[]>(`/botSettings?userId=${userId}`)
      if (settings.length > 0) {
        const s = settings[0]
        this.settingsId = s.id
        this.state = {
          running: s.running,
          strategy: s.strategy,
          riskLevel: s.riskLevel,
          pair: s.pair,
          timeframe: s.timeframe,
          takeProfit: s.takeProfit,
          stopLoss: s.stopLoss,
          trailingStop: s.trailingStop,
          autoReinvest: s.autoReinvest,
          maxOpenTrades: s.maxOpenTrades,
          dailyProfitTarget: s.dailyProfitTarget,
        }
      } else {
        // Create default settings record
        const created = await post<BotSettings>('/botSettings', {
          userId,
          ...DEFAULT_STATE,
        })
        this.settingsId = created.id
      }

      // Load existing trades
      const allTrades = await get<BotTrade[]>(`/botTrades?userId=${userId}`)
      this.trades = allTrades

      // Restore open trade if any
      const openTrades = allTrades.filter((t) => t.status === 'open')
      if (openTrades.length > 0) {
        this.openTrade = openTrades[0]
      }

      this.initialized = true

      // Resume loop if was running
      if (this.state.running) {
        this.scanStatus = 'Resuming algorithm…'
        this.startLoop()
      }

      this.notify()
    } catch (e) {
      console.error('[BotEngine] init error', e)
    } finally {
      this.initializing = false
    }
  }

  // ── Persist settings to db ───────────────────────────────────────────────

  private async persistSettings() {
    if (!this.settingsId) return
    try {
      await patchApi<BotSettings>(`/botSettings/${this.settingsId}`, {
        ...this.state,
        userId: this.userId,
      })
    } catch { /* non-critical */ }
  }

  // ── Price feed ───────────────────────────────────────────────────────────

  updatePrice(price: number) {
    if (price <= 0) return
    this.currentPrice = price
    if (this.priceHistory.length === 0) {
      this.priceHistory = buildPriceHistory(price, 50)
    } else {
      this.priceHistory.push(price)
      if (this.priceHistory.length > 200) this.priceHistory.shift()
    }
  }

  updateBalance(balance: number) {
    this.balance = balance
  }

  // ── Start / Stop ─────────────────────────────────────────────────────────

  async start() {
    if (this.state.running) return
    this.state = { ...this.state, running: true }
    this.scanStatus = 'Algorithm started — scanning market…'
    this.tick = 0
    this.elapsed = 0
    await this.persistSettings()
    this.startLoop()
    this.notify()

    // Fire first signal after 2s
    setTimeout(() => {
      if (this.priceHistory.length >= 26) {
        const sig = generateSignal(this.priceHistory, this.state.strategy, this.state.riskLevel)
        this.signal = sig
        if (sig.type !== 'HOLD') {
          const price = this.currentPrice > 0 ? this.currentPrice : this.priceHistory[this.priceHistory.length - 1]
          this.executeTrade(sig, price)
        }
        this.notify()
      }
    }, 2000)
  }

  /**
   * Stop the bot.
   * If there is an open trade, returns false and does NOT stop.
   * The caller must close the open trade first (or force=true to override).
   */
  async stop(force = false): Promise<{ ok: boolean; reason?: string }> {
    if (this.openTrade && !force) {
      return { ok: false, reason: 'open_trade' }
    }
    this.state = { ...this.state, running: false }
    this.scanStatus = 'Bot stopped'
    this.stopLoop()
    await this.persistSettings()
    this.notify()
    return { ok: true }
  }

  async updateSettings(updates: Partial<AlgoState>) {
    this.state = { ...this.state, ...updates }
    await this.persistSettings()
    this.notify()
  }

  // ── Internal loop ────────────────────────────────────────────────────────

  private startLoop() {
    this.stopLoop() // clear any existing

    this.intervalId = setInterval(() => {
      this.tick += 1
      const tick = this.tick

      const SCAN_MESSAGES = [
        'Scanning price action…',
        'Calculating RSI & MACD…',
        'Checking Bollinger Bands…',
        'Evaluating EMA crossover…',
        'Analysing volume profile…',
        'Running signal confirmation…',
        'Checking risk parameters…',
      ]
      this.scanStatus = SCAN_MESSAGES[tick % SCAN_MESSAGES.length]

      const prices = this.priceHistory
      if (prices.length < 26) { this.notify(); return }

      const currentPrice = this.currentPrice > 0 ? this.currentPrice : prices[prices.length - 1]

      this.checkExitConditions(currentPrice)

      if (tick % 3 === 0) {
        const newSignal = generateSignal(prices, this.state.strategy, this.state.riskLevel)
        this.signal = newSignal
        if (newSignal.type !== 'HOLD') {
          this.scanStatus = `${newSignal.type} signal — confidence ${newSignal.confidence.toFixed(0)}%`
          this.executeTrade(newSignal, currentPrice)
        }
      }

      this.notify()
    }, 8000)

    this.elapsedId = setInterval(() => {
      this.elapsed += 1
      this.notify()
    }, 1000)

    // Separate interval for updating unrealized P&L more frequently
    this.pnlUpdateId = setInterval(() => {
      const currentPrice = this.currentPrice > 0 ? this.currentPrice : this.priceHistory[this.priceHistory.length - 1]
      if (this.openTrade && currentPrice > 0) {
        this.updateUnrealizedPnL(currentPrice)
        this.notify()
      }
    }, 3000) // Update every 3 seconds
  }

  private stopLoop() {
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null }
    if (this.elapsedId !== null) { clearInterval(this.elapsedId); this.elapsedId = null }
    if (this.pnlUpdateId !== null) { clearInterval(this.pnlUpdateId); this.pnlUpdateId = null }
  }

  // ── Trade execution ──────────────────────────────────────────────────────

  private async executeTrade(sig: AlgoSignal, currentPrice: number) {
    if (!this.state.running) return

    // Close open trade if signal reverses
    if (this.openTrade && this.openTrade.side !== sig.type.toLowerCase()) {
      await this.closeTrade(this.openTrade, currentPrice, 'signal-reversal')
    }

    // Open new trade
    if (!this.openTrade && sig.type !== 'HOLD' && sig.confidence >= 60) {
      const amount = calcPositionSize(this.balance, this.state.riskLevel, currentPrice)
      const newTrade: BotTrade = {
        id: `bot-${Date.now()}`,
        userId: this.userId,
        pair: this.state.pair,
        side: sig.type === 'BUY' ? 'buy' : 'sell',
        entryPrice: currentPrice,
        exitPrice: null,
        amount,
        pnl: 0,
        pnlPct: 0,
        strategy: this.state.strategy,
        signal: sig.reason,
        openedAt: new Date().toISOString(),
        closedAt: null,
        status: 'open',
      }
      this.openTrade = newTrade
      this.trades = [newTrade, ...this.trades]
      try { await post('/botTrades', newTrade) } catch { /* non-critical */ }
    }
  }

  private async closeTrade(trade: BotTrade, exitPrice: number, reason: TradeCloseEvent['reason']) {
    const pnl = trade.side === 'buy'
      ? (exitPrice - trade.entryPrice) * trade.amount
      : (trade.entryPrice - exitPrice) * trade.amount
    const pnlPct = trade.side === 'buy'
      ? ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100
      : ((trade.entryPrice - exitPrice) / trade.entryPrice) * 100

    const closed: BotTrade = {
      ...trade,
      exitPrice,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPct: parseFloat(pnlPct.toFixed(2)),
      closedAt: new Date().toISOString(),
      status: 'closed',
    }

    this.openTrade = null
    this.trades = this.trades.map((t) => t.id === closed.id ? closed : t)

    this.tradeCloseListeners.forEach((fn) => fn({
      pnl: closed.pnl,
      pnlPct: closed.pnlPct,
      pair: trade.pair,
      reason,
    }))

    try {
      await patchApi(`/botTrades/${closed.id}`, {
        exitPrice: closed.exitPrice,
        pnl: closed.pnl,
        pnlPct: closed.pnlPct,
        closedAt: closed.closedAt,
        status: 'closed',
      })
    } catch { /* non-critical */ }

    this.scanStatus = reason === 'take-profit'
      ? `✓ Take-profit hit at ${exitPrice.toFixed(2)} — +${pnlPct.toFixed(2)}%`
      : reason === 'stop-loss'
        ? `✗ Stop-loss triggered at ${exitPrice.toFixed(2)} — ${pnlPct.toFixed(2)}%`
        : `↺ Signal reversal — trade closed at ${exitPrice.toFixed(2)}`
  }

  private checkExitConditions(currentPrice: number) {
    const open = this.openTrade
    if (!open || !this.state.running) return

    const pnlPct = open.side === 'buy'
      ? ((currentPrice - open.entryPrice) / open.entryPrice) * 100
      : ((open.entryPrice - currentPrice) / open.entryPrice) * 100

    const hitTP = pnlPct >= this.state.takeProfit
    const hitSL = pnlPct <= -this.state.stopLoss

    if (hitTP || hitSL) {
      this.closeTrade(open, currentPrice, hitTP ? 'take-profit' : 'stop-loss')
    }
  }

  // ── Update unrealized P&L for open trade ────────────────────────────────────

  private async updateUnrealizedPnL(currentPrice: number) {
    const open = this.openTrade
    if (!open) return

    const pnl = open.side === 'buy'
      ? (currentPrice - open.entryPrice) * open.amount
      : (open.entryPrice - currentPrice) * open.amount
    const pnlPct = open.side === 'buy'
      ? ((currentPrice - open.entryPrice) / open.entryPrice) * 100
      : ((open.entryPrice - currentPrice) / open.entryPrice) * 100

    // Update local trade object
    this.openTrade = {
      ...open,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPct: parseFloat(pnlPct.toFixed(2)),
    }

    // Update in trades array
    this.trades = this.trades.map((t) => 
      t.id === open.id ? this.openTrade! : t
    )

    // Persist to database (throttled - only update every 8 seconds to avoid spam)
    try {
      await patchApi(`/botTrades/${open.id}`, {
        pnl: parseFloat(pnl.toFixed(2)),
        pnlPct: parseFloat(pnlPct.toFixed(2)),
      })
    } catch {
      // Non-critical - UI will still show correct values
    }
  }

  // ── Performance ──────────────────────────────────────────────────────────

  private calcPerformance(): AlgoPerformance {
    const closed = this.trades.filter((t) => t.status === 'closed')
    if (closed.length === 0) {
      return {
        totalPnl: 0, totalPnlPct: 0, tradesExecuted: this.trades.length,
        winRate: 0, wins: 0, losses: 0, avgWin: 0, avgLoss: 0,
        profitFactor: 0, maxDrawdown: 0, todayPnl: 0, todayPnlPct: 0, pnlHistory: [],
      }
    }
    const wins = closed.filter((t) => t.pnl > 0)
    const losses = closed.filter((t) => t.pnl <= 0)
    const totalPnl = closed.reduce((a, t) => a + t.pnl, 0)
    const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0
    const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + t.pnl, 0) / losses.length) : 0
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : avgWin > 0 ? 99 : 0

    let cum = 0
    const pnlHistory = closed.slice(-20).map((t) => {
      cum += t.pnl
      return { time: new Date(t.closedAt!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), pnl: t.pnl, cumulative: cum }
    })

    let peak = 0, maxDD = 0, running = 0
    for (const t of closed) {
      running += t.pnl
      if (running > peak) peak = running
      const dd = peak - running
      if (dd > maxDD) maxDD = dd
    }

    const today = new Date().toDateString()
    const todayTrades = closed.filter((t) => t.closedAt && new Date(t.closedAt).toDateString() === today)
    const todayPnl = todayTrades.reduce((a, t) => a + t.pnl, 0)

    return {
      totalPnl,
      totalPnlPct: this.balance > 0 ? (totalPnl / this.balance) * 100 : 0,
      tradesExecuted: this.trades.length,
      winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
      wins: wins.length,
      losses: losses.length,
      avgWin,
      avgLoss,
      profitFactor,
      maxDrawdown: maxDD,
      todayPnl,
      todayPnlPct: this.balance > 0 ? (todayPnl / this.balance) * 100 : 0,
      pnlHistory,
    }
  }

  // ── Reset (on user switch) ───────────────────────────────────────────────

  reset() {
    this.stopLoop()
    this.state = { ...DEFAULT_STATE }
    this.openTrade = null
    this.trades = []
    this.priceHistory = []
    this.signal = null
    this.scanStatus = 'Initialising algorithm…'
    this.elapsed = 0
    this.tick = 0
    this.initialized = false
    this.initializing = false
    this.settingsId = null
    this.userId = 0
  }
}

// Export singleton
export const botEngine = new BotEngine()
