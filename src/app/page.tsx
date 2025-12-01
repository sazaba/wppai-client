import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import HowItWorksSection from "./components/HowItWorksSection"
import PricingSection from "./components/PricingSection"
import Testimony from "./components/Testimony"
import KeyBenefits from "./components/KeyBenefits"
import LandingFAQ from "./components/LandingFAQ"

export default function HomePage() {
  return (
    // CAMBIO: Quitamos bg-white/dark:bg-zinc-900. 
    // Ahora es transparente para dejar ver el fondo global del Layout.
    <div className="w-full flex flex-col gap-12 md:gap-24 pb-20"> 
      
      {/* El HeroSection debe ser transparente también para lucir los gradientes superiores */}
      <HeroSection />

      <section id="features" className="relative scroll-mt-24">
        <FeaturesSection />
      </section>

      <section id="how" className="relative scroll-mt-24">
        {/* Podríamos agregar un separador visual aquí si es necesario */}
        <HowItWorksSection />
      </section>

      <section id="pricing" className="relative scroll-mt-24">
        <PricingSection />
      </section>

      <Testimony />
      
      <KeyBenefits />

      <section id="faqs" className="relative scroll-mt-24">
        <LandingFAQ />
      </section>

      {/* <section id="contact" className="relative scroll-mt-24">
        <ContactSection />
      </section> */}
    </div>
  )
}