// import HeroSection from "./components/HeroSection"
// import FeaturesSection from "./components/FeaturesSection"
// import HowItWorksSection from "./components/HowItWorksSection"
// import PricingSection from "./components/PricingSection"
// import Testimony from "./components/Testimony"
// import KeyBenefits from "./components/KeyBenefits"
// import LandingFAQ from "./components/LandingFAQ"

// export default function HomePage() {
//   return (
//     // CAMBIO: Redujimos gap-12/gap-24 a gap-8/gap-16
//     <div className="w-full flex flex-col gap-8 md:gap-16 pb-16 overflow-x-hidden"> 
      
//       <HeroSection />

//       <section id="features" className="relative scroll-mt-20">
//         <FeaturesSection />
//       </section>

//       <section id="how" className="relative scroll-mt-20">
//         <HowItWorksSection />
//       </section>

//       <section id="pricing" className="relative scroll-mt-20">
//         <PricingSection />
//       </section>

//       <Testimony />
      
//       <KeyBenefits />

//       <section id="faqs" className="relative scroll-mt-20">
//         <LandingFAQ />
//       </section>
//     </div>
//   )
// }

import dynamic from 'next/dynamic' // 1. Importamos dynamic

// 2. Cargamos el Hero de forma normal (es lo primero que se ve)
import HeroSection from "./components/HeroSection"

// 3. Cargamos el resto de secciones de forma diferida (Lazy Load)
// Esto evita que el celular se bloquee intentando cargar todo junto.
const FeaturesSection = dynamic(() => import("./components/FeaturesSection"))
const HowItWorksSection = dynamic(() => import("./components/HowItWorksSection"))
const PricingSection = dynamic(() => import("./components/PricingSection"))
const Testimony = dynamic(() => import("./components/Testimony"))
const KeyBenefits = dynamic(() => import("./components/KeyBenefits"))
const LandingFAQ = dynamic(() => import("./components/LandingFAQ"))

export default function HomePage() {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-16 pb-16 overflow-x-hidden bg-zinc-950"> 
      
      {/* El Hero se carga inmediato para el LCP (Largest Contentful Paint) */}
      <HeroSection />

      {/* El resto se irá inyectando sin bloquear el hilo principal */}
      <section id="features" className="relative scroll-mt-20">
        <FeaturesSection />
      </section>

      <section id="how" className="relative scroll-mt-20">
        <HowItWorksSection />
      </section>

      <section id="pricing" className="relative scroll-mt-20">
        <PricingSection />
      </section>

      {/* Componentes pesados visualmente */}
      <Testimony />
      
      <KeyBenefits />

      <section id="faqs" className="relative scroll-mt-20">
        <LandingFAQ />
      </section>
    </div>
  )
}