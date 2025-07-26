// src/app/page.tsx

import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import HowItWorksSection from "./components/HowItWorksSection"
import PricingSection from "./components/PricingSection"
import Testimony from "./components/Testimony"
import KeyBenefits from "./components/KeyBenefits"
import LandingFAQ from "./components/LandingFAQ"
// import ContactSection from "./components/ContactSection" // si lo creas luego

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white">
      <HeroSection />
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="how">
        <HowItWorksSection />
      </section>
      <section id="pricing">
        <PricingSection />
      </section>
      <Testimony />
      <KeyBenefits />
      <section id="faqs">
        <LandingFAQ />
      </section>
      {/* Descomenta cuando tengas el componente contacto */}
      {/* <section id="contact">
        <ContactSection />
      </section> */}
    </main>
  )
}
