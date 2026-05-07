import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Layout from './components/layout/Layout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Contact from './pages/Contact'
import Education from './pages/Education'

// Trading pages
import Cryptocurrencies from './pages/trading/Cryptocurrencies'
import Forex from './pages/trading/Forex'
import Shares from './pages/trading/Shares'
import Indices from './pages/trading/Indices'
import ETFs from './pages/trading/ETFs'

// System pages
import Trade from './pages/system/Trade'
import CopyTrading from './pages/system/CopyTrading'
import AutomatedTrading from './pages/system/AutomatedTrading'

// Company pages
import About from './pages/company/About'
import WhyUs from './pages/company/WhyUs'
import FAQ from './pages/company/FAQ'
import Regulation from './pages/company/Regulation'

// Dashboard pages (outside public Layout)
import Dashboard from './pages/user/Dashboard'
import Wallet from './pages/user/Wallet'
import Account from './pages/user/Account'
import Settings from './pages/user/Settings'
import History from './pages/user/History'
import Transactions from './pages/user/Transactions'
import TradePage from './pages/user/TradePage'
import CryptoPage from './pages/user/CryptoPage'
import ExchangePage from './pages/user/ExchangePage'
import NotificationsPage from './pages/user/Notifications'
import Positions from './pages/user/Positions'

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
        {/* Public routes with shared Header/Footer layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contacts" element={<Contact />} />
          <Route path="/for-traders" element={<Education />} />

          {/* Trading */}
          <Route path="/cryptocurrencies" element={<Cryptocurrencies />} />
          <Route path="/forex" element={<Forex />} />
          <Route path="/shares" element={<Shares />} />
          <Route path="/indices" element={<Indices />} />
          <Route path="/etfs" element={<ETFs />} />

          {/* System */}
          <Route path="/trade" element={<Trade />} />
          <Route path="/copy" element={<CopyTrading />} />
          <Route path="/automate" element={<AutomatedTrading />} />

          {/* Company */}
          <Route path="/about" element={<About />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/regulation" element={<Regulation />} />
        </Route>

        {/* Dashboard routes — completely separate from public Layout */}
        <Route path="/user/dashboard" element={<Dashboard />} />
        <Route path="/user/wallet" element={<Wallet />} />
        <Route path="/user/account" element={<Account />} />
        <Route path="/user/settings" element={<Settings />} />
        <Route path="/user/history" element={<History />} />
        <Route path="/user/transactions" element={<Transactions />} />
        <Route path="/user/trade" element={<TradePage />} />
        <Route path="/user/crypto" element={<CryptoPage />} />
        <Route path="/user/exchange" element={<ExchangePage />} />
        <Route path="/user/notifications" element={<NotificationsPage />} />
        <Route path="/user/positions" element={<Positions />} />
      </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}
