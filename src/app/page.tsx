// src/app/page.tsx

import FeaturesSection from "./components/FeaturesSection"
import HeroSection from "./components/HeroSection"
import HowItWorksSection from "./components/HowItWorksSection"
import KeyBenefits from "./components/KeyBenefits"
import LandingFAQ from "./components/LandingFAQ"
import PricingSection from "./components/PricingSection"
import Testimony from "./components/Testimony"


export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white">
      <HeroSection/>
      <FeaturesSection/>
      <HowItWorksSection/>
      <PricingSection/>
      <Testimony/>
      <KeyBenefits/>
      <LandingFAQ/>
     
    </main>
  )
}
