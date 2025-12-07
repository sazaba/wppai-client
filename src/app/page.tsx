import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import HowItWorksSection from "./components/HowItWorksSection"
import PricingSection from "./components/PricingSection"
import Testimony from "./components/Testimony"
import KeyBenefits from "./components/KeyBenefits"
import LandingFAQ from "./components/LandingFAQ"

export default function HomePage() {
  return (
    // CAMBIO: Redujimos gap-12/gap-24 a gap-8/gap-16
    <div className="w-full flex flex-col gap-8 md:gap-16 pb-16 overflow-x-hidden"> 
      
      <HeroSection />

      <section id="features" className="relative scroll-mt-20">
        <FeaturesSection />
      </section>

      <section id="how" className="relative scroll-mt-20">
        <HowItWorksSection />
      </section>

      <section id="pricing" className="relative scroll-mt-20">
        <PricingSection />
      </section>

      <Testimony />
      
      <KeyBenefits />

      <section id="faqs" className="relative scroll-mt-20">
        <LandingFAQ />
      </section>
    </div>
  )
}