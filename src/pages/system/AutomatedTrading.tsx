import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import SectionBackground from '../../components/ui/SectionBackground'
import SectionHeader from '../../components/ui/SectionHeader'
import Badge from '../../components/ui/Badge'
import MarketAnalysisSection from '../../components/home/MarketAnalysisSection'
import FAQSection from '../../components/home/FAQSection'

// ─── Animation hook ───────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: 'fas fa-robot',
    color: '#c9a84c',
    title: '24/7 Bot Execution',
    description:
      'Deploy trading bots that run around the clock — no sleep, no emotion, no missed opportunities. Your strategies execute precisely as configured, even while you are offline.',
  },
  {
    icon: 'fas fa-sliders-h',
    color: '#4ade80',
    title: 'Visual Strategy Builder',
    description:
      'Build complex strategies with a drag-and-drop interface. No coding required. Set entry/exit conditions, risk rules, and position sizing with intuitive visual controls.',
  },
  {
    icon: 'fas fa-shield-alt',
    color: '#60a5fa',
    title: 'Risk Management Engine',
    description:
      'Protect your capital with automated stop-loss, take-profit, and drawdown limits. The risk engine monitors every position in real time and acts instantly when thresholds are hit.',
  },
  {
    icon: 'fas fa-chart-line',
    color: '#a78bfa',
    title: 'Backtesting & Analytics',
    description:
      'Validate strategies against years of historical data before going live. Detailed performance reports show win rate, Sharpe ratio, max drawdown, and more.',
  },
  {
    icon: 'fas fa-layer-group',
    color: '#f472b6',
    title: 'Multi-Strategy Portfolio',
    description:
      'Run multiple bots simultaneously across different markets and asset classes. Each strategy operates independently with its own capital allocation and risk parameters.',
  },
  {
    icon: 'fas fa-plug',
    color: '#34d399',
    title: 'API & Webhook Support',
    description:
      'Connect external signals from TradingView, custom scripts, or third-party tools via our REST API and webhook system. Full programmatic control for advanced users.',
  },
]

const steps = [
  {
    number: '01',
    icon: 'fas fa-pencil-alt',
    title: 'Define Your Strategy',
    description:
      'Use the visual builder or API to configure your trading logic — indicators, conditions, entry/exit rules, and risk parameters.',
  },
  {
    number: '02',
    icon: 'fas fa-history',
    title: 'Backtest & Optimise',
    description:
      'Run your strategy against historical data. Analyse results, tweak parameters, and iterate until performance meets your targets.',
  },
  {
    number: '03',
    icon: 'fas fa-flask',
    title: 'Paper Trade',
    description:
      'Deploy in simulation mode with real market data but no real capital. Confirm live behaviour matches your backtest expectations.',
  },
  {
    number: '04',
    icon: 'fas fa-rocket',
    title: 'Go Live',
    description:
      'Activate your bot with real capital. Monitor performance from the dashboard and adjust parameters at any time without stopping the bot.',
  },
]

const stats = [
  { value: '1,000+', label: 'Instruments' },
  { value: '99.9%', label: 'Uptime' },
  { value: '< 5ms', label: 'Execution' },
  { value: '24/7', label: 'Operation' },
]

const botTypes = [
  {
    icon: 'fas fa-chart-bar',
    color: '#c9a84c',
    name: 'Trend Follower',
    description: 'Rides sustained price movements using moving averages and momentum indicators.',
    tags: ['MA Cross', 'RSI', 'MACD'],
    performance: '+68.4%',
  },
  {
    icon: 'fas fa-exchange-alt',
    color: '#4ade80',
    name: 'Mean Reversion',
    description: 'Profits from price returning to its statistical average after extreme moves.',
    tags: ['Bollinger', 'Z-Score', 'RSI'],
    performance: '+44.2%',
  },
  {
    icon: 'fas fa-bolt',
    color: '#60a5fa',
    name: 'Scalper Bot',
    description: 'Captures small, frequent gains from micro price movements with tight spreads.',
    tags: ['Order Flow', 'Level 2', 'Tick'],
    performance: '+91.7%',
  },
  {
    icon: 'fas fa-balance-scale',
    color: '#a78bfa',
    name: 'Arbitrage Bot',
    description: 'Exploits price discrepancies across exchanges or correlated instruments.',
    tags: ['Cross-Exchange', 'Pairs', 'Spread'],
    performance: '+37.9%',
  },
]

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedStat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className="text-center transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <p className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#c9a84c' }}>{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
  icon, color, title, description, delay, visible,
}: {
  icon: string; color: string; title: string; description: string; delay: number; visible: boolean
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 border transition-all duration-700 hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.2)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transitionDelay: `${delay}ms`,
        boxShadow: 'none',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}40` }}
      >
        <i className={icon} style={{ color, fontSize: 20 }} aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({ step, delay, visible }: { step: typeof steps[0]; delay: number; visible: boolean }) {
  return (
    <div
      className="rounded-2xl p-6 border flex flex-col gap-4 transition-all duration-700"
      style={{
        background: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.2)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
        >
          {step.number}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(162,133,57,0.12)', border: '1px solid rgba(162,133,57,0.3)' }}
        >
          <i className={step.icon} style={{ color: '#c9a84c', fontSize: 16 }} aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-base font-bold text-white">{step.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
    </div>
  )
}

// ─── Bot type card ────────────────────────────────────────────────────────────

function BotCard({ bot, delay, visible }: { bot: typeof botTypes[0]; delay: number; visible: boolean }) {
  return (
    <div
      className="rounded-2xl p-5 border flex flex-col gap-4 transition-all duration-700 hover:scale-[1.02]"
      style={{
        background: 'rgba(22,15,53,0.8)',
        borderColor: 'rgba(162,133,57,0.2)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${bot.color}18`, border: `1px solid ${bot.color}40` }}
        >
          <i className={bot.icon} style={{ color: bot.color, fontSize: 18 }} aria-hidden="true" />
        </div>
        <span
          className="text-sm font-extrabold"
          style={{ color: '#4ade80' }}
        >
          {bot.performance}
        </span>
      </div>
      <div>
        <h3 className="text-base font-bold text-white mb-1">{bot.name}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{bot.description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {bot.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(162,133,57,0.1)', color: '#c9a84c', border: '1px solid rgba(162,133,57,0.25)' }}
          >
            {tag}
          </span>
        ))}
      </div>
      <Link
        to="/register"
        className="block w-full text-center py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg,#a28539,#c9a84c)', color: '#0d0824' }}
      >
        Deploy Bot
      </Link>
    </div>
  )
}

// ─── Live terminal animation ──────────────────────────────────────────────────

const terminalLines = [
  { text: '> Initialising strategy engine...', color: '#c9a84c' },
  { text: '> Loading BTC/USD market data...', color: '#c8c8d8' },
  { text: '> Backtest complete: +142.3% (3yr)', color: '#4ade80' },
  { text: '> Risk check passed ✓', color: '#4ade80' },
  { text: '> Deploying bot to live market...', color: '#c8c8d8' },
  { text: '> ORDER FILLED: BUY 0.5 BTC @ $67,420', color: '#60a5fa' },
  { text: '> Stop-loss set @ $64,050 (-5%)', color: '#f87171' },
  { text: '> Take-profit set @ $74,162 (+10%)', color: '#4ade80' },
  { text: '> Bot running — monitoring positions...', color: '#c9a84c' },
]

function LiveTerminal() {
  const [lines, setLines] = useState<typeof terminalLines>([])
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const addLine = () => {
      if (i < terminalLines.length) {
        setLines((prev) => [...prev, terminalLines[i]])
        i++
        setTimeout(addLine, 600 + Math.random() * 400)
      }
    }
    const t = setTimeout(addLine, 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 530)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="rounded-2xl overflow-hidden border font-mono text-xs"
      style={{ background: '#0a0618', borderColor: 'rgba(162,133,57,0.3)' }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ background: 'rgba(22,15,53,0.9)', borderColor: 'rgba(162,133,57,0.2)' }}
      >
        <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
        <span className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
        <span className="ml-3 text-gray-500 text-xs">schwab-bot — live</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs">ACTIVE</span>
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-4 space-y-1.5 min-h-[260px]">
        {lines.map((line, i) => (
          <div key={i} style={{ color: line.color }}>
            {line.text}
          </div>
        ))}
        <span style={{ color: '#c9a84c' }}>
          {cursor ? '█' : ' '}
        </span>
      </div>
    </div>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CtaBanner() {
  return (
    <section
      className="py-16"
      style={{
        background: 'linear-gradient(135deg, #1a0f4f 0%, #2b1978 50%, #1a0f4f 100%)',
        borderTop: '1px solid rgba(162,133,57,0.2)',
        borderBottom: '1px solid rgba(162,133,57,0.2)',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          Ready to Automate Your{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#a28539,#c9a84c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Trading?
          </span>
        </h2>
        <p className="text-gray-300">
          Join thousands of traders using our automated platform to execute strategies 24/7 and
          remove emotion from every trade.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="ghost-gold" to="/register">
            <Icon name="fas fa-rocket mr-2" /> Create Free Account
          </Button>
          <Button variant="login" to="/login">
            <Icon name="fas fa-sign-in-alt mr-2" /> Login
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AutomatedTrading() {
  // Section-level animation refs
  const featuresSection = useInView()
  const stepsSection = useInView()
  const botsSection = useInView()

  return (
    <>
      {/* ── Hero ── */}
      <SectionBackground withOrbs>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div className="space-y-6">
              <Badge withDot>Algorithmic Trading</Badge>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                Automate Your{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg,#a28539,#c9a84c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Trading Strategy
                </span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
                Deploy intelligent trading bots that execute your strategies 24/7 with
                millisecond precision. No emotion, no fatigue — just disciplined, data-driven
                trading across 1,000+ instruments.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="ghost-gold" to="/register">
                  <Icon name="fas fa-rocket mr-2" /> Start Automating
                </Button>
                <Button variant="login" to="/for-traders">
                  <Icon name="fas fa-book-open mr-2" /> Learn More
                </Button>
              </div>

              {/* Quick stats */}
              <div
                className="flex flex-wrap gap-8 pt-4 mt-2 border-t"
                style={{ borderColor: 'rgba(162,133,57,0.2)' }}
              >
                {stats.map((stat, i, arr) => (
                  <div key={stat.label} className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-extrabold" style={{ color: '#c9a84c' }}>{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-px h-10 hidden sm:block" style={{ background: 'rgba(162,133,57,0.2)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live terminal */}
            <div>
              <LiveTerminal />
            </div>
          </div>
        </div>
      </SectionBackground>

      {/* ── Features ── */}
      <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={featuresSection.ref} className="mb-14">
            <SectionHeader
              badge="Platform Features"
              title="Everything You Need to Trade Automatically"
              highlight="Trade Automatically"
              subtitle="A complete suite of tools to build, test, and deploy algorithmic strategies at any skill level."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard
                key={f.title}
                {...f}
                delay={i * 80}
                visible={featuresSection.visible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20" style={{ backgroundColor: '#110b2d' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={stepsSection.ref} className="mb-14">
            <SectionHeader
              badge="Getting Started"
              title="From Idea to Live Bot in 4 Steps"
              highlight="4 Steps"
              subtitle="Our streamlined workflow takes you from strategy concept to live deployment quickly and safely."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <StepCard
                key={step.number}
                step={step}
                delay={i * 100}
                visible={stepsSection.visible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bot Types ── */}
      <section className="py-20" style={{ backgroundColor: '#0d0824' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={botsSection.ref} className="mb-14">
            <SectionHeader
              badge="Strategy Library"
              title="Pre-Built Bot Strategies"
              highlight="Bot Strategies"
              subtitle="Start with a proven strategy template or build your own from scratch."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {botTypes.map((bot, i) => (
              <BotCard
                key={bot.name}
                bot={bot}
                delay={i * 100}
                visible={botsSection.visible}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="ghost-gold" to="/register">
              Browse All Strategies <Icon name="fas fa-arrow-right ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Market Analysis & Insights ── */}
      <MarketAnalysisSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── CTA ── */}
      <CtaBanner />
    </>
  )
}
