import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Icon from '../ui/Icon'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
})

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.12 } },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const heroStats = [
  { value: '500K+', label: 'Active Traders' },
  { value: '$2B+',  label: 'Daily Volume' },
  { value: '0.0',   label: 'Pips Spread' },
  { value: '24/7',  label: 'Support' },
]

const trustItems = [
  { icon: 'fas fa-shield-alt', text: 'Regulated & Licensed' },
  { icon: 'fas fa-lock',       text: 'Funds Protected up to $1,000,000' },
  { icon: 'fas fa-bolt',       text: '211ms Execution' },
]

// Live market data for ticker
const marketAssets = [
  { symbol: 'BTC/USD', basePrice: 67234.50, change: 2.34 },
  { symbol: 'ETH/USD', basePrice: 3456.78, change: -1.23 },
  { symbol: 'EUR/USD', basePrice: 1.0876, change: 0.45 },
  { symbol: 'GBP/USD', basePrice: 1.2654, change: -0.32 },
  { symbol: 'GOLD', basePrice: 2034.56, change: 1.87 },
  { symbol: 'S&P 500', basePrice: 4567.89, change: 0.67 },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

// Animated background with grid and particles
function TradingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #2b1978, transparent)' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #a28539, transparent)' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6b46c1, transparent)' }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(162,133,57,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(162,133,57,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 3 === 0 ? '#a28539' : i % 3 === 1 ? '#2b1978' : '#6b46c1',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Live price ticker component
function LivePriceTicker() {
  const [prices, setPrices] = useState(
    marketAssets.map(asset => ({
      ...asset,
      currentPrice: asset.basePrice,
      isUp: asset.change > 0,
    }))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev =>
        prev.map(asset => {
          const fluctuation = (Math.random() - 0.5) * (asset.basePrice * 0.001)
          const newPrice = asset.currentPrice + fluctuation
          return {
            ...asset,
            currentPrice: newPrice,
            isUp: newPrice > asset.currentPrice,
          }
        })
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden py-3 px-4 rounded-xl border border-white/5" style={{ background: 'rgba(17,11,45,0.6)', backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
        {prices.map((asset, i) => (
          <motion.div
            key={asset.symbol}
            className="flex items-center gap-3 min-w-fit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">{asset.symbol}</span>
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-sm font-bold text-white"
                  key={asset.currentPrice}
                  initial={{ scale: 1.1, color: asset.isUp ? '#10b981' : '#ef4444' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.3 }}
                >
                  {asset.symbol.includes('USD') && asset.symbol !== 'S&P 500' 
                    ? asset.currentPrice.toFixed(2)
                    : asset.currentPrice.toFixed(4)}
                </motion.span>
                <span
                  className={`text-xs font-semibold ${asset.change > 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {asset.change > 0 ? '↑' : '↓'} {Math.abs(asset.change)}%
                </span>
              </div>
            </div>
            {i < prices.length - 1 && (
              <div className="w-px h-8 bg-white/10" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Mini chart visualization
function MiniChart() {
  const [points, setPoints] = useState(() => 
    Array.from({ length: 30 }, (_, i) => 50 + Math.sin(i * 0.3) * 20 + Math.random() * 10)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => {
        const newPoints = [...prev.slice(1), prev[prev.length - 1] + (Math.random() - 0.5) * 15]
        return newPoints
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const pathData = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${(i / points.length) * 200} ${100 - point}`)
    .join(' ')

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
      <motion.div
        className="relative w-64 h-48 rounded-xl border border-white/10 p-4"
        style={{ background: 'rgba(17,11,45,0.4)', backdropFilter: 'blur(10px)' }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">BTC/USD</span>
          <span className="text-xs text-green-400 font-semibold">+2.34%</span>
        </div>
        <svg className="w-full h-32" viewBox="0 0 200 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a28539" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a28539" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={`${pathData} L 200 100 L 0 100 Z`}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.path
            d={pathData}
            fill="none"
            stroke="#a28539"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </svg>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-white">$67,234.50</span>
          <motion.div
            className="flex items-center gap-1 text-xs text-green-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon name="fas fa-circle text-[6px]" />
            <span>Live</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function HeroBadge() {
  return (
    <motion.div
      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border"
      style={{
        background: 'rgba(162,133,57,0.15)',
        borderColor: 'rgba(162,133,57,0.4)',
        color: '#a28539',
      }}
      animate={{
        boxShadow: [
          '0 0 20px rgba(162,133,57,0.2)',
          '0 0 30px rgba(162,133,57,0.4)',
          '0 0 20px rgba(162,133,57,0.2)',
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.span
        className="w-2 h-2 rounded-full mr-2"
        style={{ backgroundColor: '#a28539' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      Trusted CFD Trading Platform Since 2017
    </motion.div>
  )
}

function HeroHeadline() {
  return (
    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
      <motion.span
        className="block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Trade Smarter with
      </motion.span>
      <motion.span
        className="block mt-2"
        style={{
          background: 'linear-gradient(90deg, #a28539, #d4af6a, #2b1978)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Charles Schwab
      </motion.span>
    </h1>
  )
}

function HeroStatsRow() {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-8 py-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {heroStats.map((stat, i) => (
        <motion.div key={stat.label} className="flex items-center gap-8" variants={fadeUp(0.4 + i * 0.1)}>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#a28539' }}>{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
          {i < heroStats.length - 1 && (
            <div className="w-px h-12" style={{ backgroundColor: 'rgba(162,133,57,0.3)' }} />
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}

function TrustBar() {
  return (
    <p className="text-sm text-gray-500 mt-2">
      {trustItems.map((item, i) => (
        <span key={item.text}>
          <Icon name={`${item.icon} mr-1`} style={{ color: '#a28539' }} />
          {item.text}
          {i < trustItems.length - 1 && <span> &nbsp;·&nbsp; </span>}
        </span>
      ))}
    </p>
  )
}

// ─── HeroSection ──────────────────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0520 0%, #110b2d 25%, #1a0f3d 50%, #110b2d 75%, #0d0824 100%)',
        minHeight: '90vh',
      }}
    >
      <TradingBackground />
      <MiniChart />

      <div className="relative z-10 px-4 py-24 mx-auto max-w-6xl sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div {...fadeUp(0)}>
            <HeroBadge />
          </motion.div>

          <motion.div {...fadeUp(0.15)}>
            <HeroHeadline />
          </motion.div>

          <motion.p
            className="max-w-2xl mx-auto text-xl text-gray-300 leading-relaxed"
            {...fadeUp(0.25)}
          >
            Access global markets — Stocks, Forex, Gold, Oil, Indices and Crypto — with ultra-fast
            execution, tight spreads, and institutional-grade security.
          </motion.p>

          <HeroStatsRow />

          <motion.div className="flex flex-wrap justify-center gap-4 mt-4" {...fadeUp(0.55)}>
            <Button variant="ghost-gold" to="/register" className="text-lg">
              Start Trading Now <Icon name="fas fa-arrow-right ml-2" />
            </Button>
          </motion.div>

          <motion.div {...fadeUp(0.65)}>
            <TrustBar />
          </motion.div>
        </div>

        {/* Live price ticker at bottom */}
        <motion.div
          className="mt-16 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <LivePriceTicker />
        </motion.div>
      </div>
    </section>
  )
}
