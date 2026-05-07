import HeroSection from '../components/home/HeroSection'
import StatsStrip from '../components/home/StatsStrip'
import FeaturesSection from '../components/home/FeaturesSection'
import MarketAnalysisSection from '../components/home/MarketAnalysisSection'
import EducationSection from '../components/home/EducationSection'
import PricingSection from '../components/home/PricingSection'
import TradingServicesSection from '../components/home/TradingServicesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import FAQSection from '../components/home/FAQSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <MarketAnalysisSection />
      <EducationSection />
      <PricingSection />
      <TradingServicesSection />
      <TestimonialsSection />
      <FAQSection />
    </>
  )
}
