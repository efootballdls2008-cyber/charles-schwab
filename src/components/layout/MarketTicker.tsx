export default function MarketTicker() {
  return (
    <div className="bg-dark-300 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-1">
          <div className="crypto-ticker-wrapper">
            <iframe
              src="https://widget.coinlib.io/widget?type=horizontal_v2&theme=dark&pref_coin_id=1505&invert_hover=no"
              width="100%"
              height="36px"
              scrolling="auto"
              marginWidth={0}
              marginHeight={0}
              frameBorder={0}
              className="w-full"
              title="Market Ticker"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
