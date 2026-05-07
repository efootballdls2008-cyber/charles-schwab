import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import TickerTape from './TickerTape'

export default function Layout() {
  return (
    <div
      className="antialiased text-gray-200 font-sans min-h-screen flex flex-col"
      style={{ backgroundColor: '#110b2d' }}
    >
      {/* Accessibility skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:bg-blue-700 focus:text-white focus:fixed focus:px-4 focus:py-2 focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to main content
      </a>

      <Header />

      {/* pb-12 reserves space so the sticky ticker tape never overlaps page content */}
      <main id="main-content" className="flex-grow pb-12">
        <Outlet />
      </main>

      <Footer />

      {/* Sticky bottom ticker — rendered outside <main> so it overlays the footer edge */}
      <TickerTape />
    </div>
  )
}
