import { useEffect, useRef } from 'react'

const symbols = [
  { proName: 'FX_IDC:EURUSD',    title: 'EUR/USD' },
  { proName: 'BITSTAMP:BTCUSD',  title: 'BTC/USD' },
  { proName: 'BITSTAMP:ETHUSD',  title: 'ETH/USD' },
  { proName: 'FX_IDC:GBPUSD',    title: 'GBP/USD' },
  { proName: 'CAPITALCOM:GOLD',  title: 'Gold' },
  { proName: 'CAPITALCOM:OIL',   title: 'Oil' },
]

/**
 * Sticky bottom TradingView ticker tape widget.
 * Injected once via useEffect to avoid duplicate scripts in StrictMode.
 */
export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.querySelector('script')) return

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols,
      colorTheme: 'dark',
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'en',
    })
    containerRef.current.appendChild(script)
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{ backgroundColor: '#0d0824', borderTop: '1px solid rgba(162,133,57,0.2)' }}
    >
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: 46 }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  )
}
