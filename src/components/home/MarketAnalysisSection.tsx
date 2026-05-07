import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import InsightCard, { type InsightCardProps } from '../ui/InsightCard'
import LiveClock from '../ui/LiveClock'

// ─── TradingView widget ───────────────────────────────────────────────────────

function TradingViewChart() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // Avoid double-injection in StrictMode
    if (containerRef.current.querySelector('script')) return

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'BITSTAMP:BTCUSD',
      interval: '1',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(13, 8, 36, 1)',
      gridColor: 'rgba(43, 25, 120, 0.2)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    })
    containerRef.current.appendChild(script)
  }, [])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: '100%', width: '100%' }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: 'calc(100% - 32px)', width: '100%' }}
      />
    </div>
  )
}

// ─── BTC price hook ───────────────────────────────────────────────────────────

interface BtcData {
  price: number
  prevPrice: number
  change: number
  volume: number
}

function useBtcPrice(intervalMs = 30_000) {
  const [data, setData] = useState<BtcData>({ price: 0, prevPrice: 0, change: 0, volume: 0 })

  useEffect(() => {
    const fetch_ = () =>
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true',
      )
        .then((r) => r.json())
        .then((d) =>
          setData((prev) => ({
            prevPrice: prev.price,
            price: d.bitcoin.usd,
            change: d.bitcoin.usd_24h_change,
            volume: d.bitcoin.usd_24h_vol,
          })),
        )
        .catch(console.error)

    fetch_()
    const id = setInterval(fetch_, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return data
}

// ─── Chart panel ─────────────────────────────────────────────────────────────

function ChartPanel() {
  const { price, prevPrice, change, volume } = useBtcPrice()

  const priceColor =
    price > prevPrice ? '#4ade80' : price < prevPrice ? '#f87171' : '#ffffff'

  const changeClass =
    change >= 0
      ? 'bg-green-500 bg-opacity-20 text-green-400'
      : 'bg-red-500 bg-opacity-20 text-red-400'

  return (
    <div
      className="relative overflow-hidden backdrop-blur-sm rounded-2xl border"
      style={{
        backgroundColor: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(43,25,120,0.4)',
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 pointer-events-none"
        style={{ backgroundColor: '#2b1978', filter: 'blur(48px)', opacity: 0.1 }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-10 -mb-10 pointer-events-none"
        style={{ backgroundColor: '#60a5fa', filter: 'blur(48px)', opacity: 0.1 }}
        aria-hidden="true"
      />

      {/* Live status bar */}
      <div
        className="border-b px-4 py-2 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(13,8,36,0.9)', borderColor: 'rgba(43,25,120,0.4)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">LIVE</span>
          </div>
          <LiveClock />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-400">Open</span>
          <select className="bg-gray-700 text-gray-300 text-xs rounded border-none focus:ring-blue-500 py-1">
            {['1D', '1W', '1M', '1Y'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-700"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 bg-opacity-20 rounded-md">
            <i className="fas fa-chart-line text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">BTC/USD</span>
              <span className="text-lg font-bold" style={{ color: priceColor }}>
                {price ? `$${price.toLocaleString()}` : '$—'}
              </span>
              <span className={`px-1.5 py-0.5 text-xs rounded ${changeClass}`}>
                {change ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—'}
              </span>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
              <span>Real-time data</span>
              <span>·</span>
              <span>
                Vol: ${volume ? `${(volume / 1_000_000_000).toFixed(1)}B` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[420px] relative overflow-hidden">
        <TradingViewChart />
      </div>
    </div>
  )
}

// ─── Insight cards data ───────────────────────────────────────────────────────

const ChartSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const GearSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const ShieldSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)
const ArrowSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)
const LightningSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)
const LockSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

type InsightData = Omit<InsightCardProps, 'active' | 'onMouseEnter' | 'onMouseLeave'>

const insightCards: InsightData[] = [
  {
    icon: <ChartSvg />,
    title: 'Daily Market',
    titleAccent: 'Updates',
    description:
      'Receive daily market analysis directly to your inbox. Our team of expert analysts provide actionable insights on market trends, price movements, and trading opportunities across all major asset classes.',
    badge: {
      label: 'Live',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />,
    },
    footerIcon: <ArrowSvg />,
    footerText: 'Updated today',
    color: 'green',
  },
  {
    icon: <GearSvg />,
    title: 'Premium Trading',
    titleAccent: 'Tools',
    description:
      'Access advanced trading tools designed for all experience levels. Our platform offers customizable solutions to meet diverse trading needs and styles, with multi-language support for international traders.',
    badge: { label: '50+ Tools' },
    footerIcon: <LightningSvg />,
    footerText: 'Real-time data',
    color: 'indigo',
  },
  {
    icon: <ShieldSvg />,
    title: 'Funds',
    titleAccent: 'Protection',
    description:
      'Your security is our priority. We provide industry-leading insurance protection for client funds up to $1,000,000, ensuring your investments are protected against unforeseen circumstances.',
    badge: { label: 'Up to $1M' },
    footerIcon: <LockSvg />,
    footerText: 'Insured & secured',
    color: 'gold',
  },
]

// ─── MarketAnalysisSection ────────────────────────────────────────────────────

export default function MarketAnalysisSection() {
  const [activeCard, setActiveCard] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Auto-cycle
  useEffect(() => {
    if (!autoPlay) return
    const id = setInterval(
      () => setActiveCard((c) => (c + 1) % insightCards.length),
      3500,
    )
    return () => clearInterval(id)
  }, [autoPlay])

  const pauseAuto = () => setAutoPlay(false)
  const resumeAuto = () => setAutoPlay(true)

  return (
    <section className="py-16" style={{ backgroundColor: '#110b2d' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-12 text-center">
          <h2
            className="mt-3 text-3xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #a28539, #c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Market Analysis &amp; Insights
          </h2>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Stay ahead with real-time market data, AI-powered insights, and expert analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left — TradingView chart */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChartPanel />
          </motion.div>

          {/* Right — Insight cards */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {/* Sub-header + dots */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a28539' }}>
                  Live Insights
                </span>
                <h3 className="text-2xl font-bold text-white mt-0.5">
                  Expert Market{' '}
                  <span
                    style={{
                      background: 'linear-gradient(90deg,#a28539,#d4af6a)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Analysis
                  </span>
                </h3>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {insightCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveCard(i); pauseAuto(); setTimeout(resumeAuto, 8000) }}
                    className="rounded-full transition-all duration-300"
                    style={
                      activeCard === i
                        ? { width: 22, height: 8, background: '#a28539' }
                        : { width: 8, height: 8, background: 'rgba(162,133,57,0.3)' }
                    }
                    aria-label={`Show insight ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Cards */}
            {insightCards.map((card, i) => (
              <InsightCard
                key={card.title}
                {...card}
                active={activeCard === i}
                onMouseEnter={() => { setActiveCard(i); pauseAuto() }}
                onMouseLeave={resumeAuto}
              />
            ))}

            {/* CTA */}
            <div className="pt-2 text-center">
              <Link
                to="/for-traders"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg,#a28539,#c9a84c)',
                  color: '#0d0824',
                  boxShadow: '0 4px 20px rgba(162,133,57,0.35)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.12)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(162,133,57,0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(162,133,57,0.35)'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Learn more about our services
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
